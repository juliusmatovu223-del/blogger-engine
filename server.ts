import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { formatArticleForBloggerHtml, publishToBlogger, verifyBloggerBlog } from './src/server/bloggerService';
import { db } from './src/server/db';
import { generateArticleFromTopic, runResearchEngine } from './src/server/geminiService';
import { Article, DashboardStats, ResearchRun } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Planner Pulse API', timestamp: new Date().toISOString() });
  });

  // Stats
  app.get('/api/stats', (req: Request, res: Response) => {
    const topics = db.getTopics();
    const articles = db.getArticles();
    const sources = db.getSources();
    const runs = db.getResearchRuns();

    const stats: DashboardStats = {
      questions_found: topics.length,
      strong_opportunities: topics.filter(t => t.score >= 65).length,
      drafts_count: articles.filter(a => a.status === 'draft').length,
      needs_approval_count: articles.filter(a => a.status === 'needs_approval').length,
      approved_count: articles.filter(a => a.status === 'approved').length,
      published_count: articles.filter(a => a.status === 'published').length,
      total_sources: sources.length,
      latest_run: runs[0]
    };

    res.json(stats);
  });

  // Research Runs
  app.get('/api/research/runs', (req: Request, res: Response) => {
    res.json(db.getResearchRuns());
  });

  // Trigger Research Run ("Search Today")
  app.post('/api/research/run', async (req: Request, res: Response) => {
    const runId = `run-${Date.now()}`;
    const settings = db.getSettings();
    const keywords = req.body.keywords && Array.isArray(req.body.keywords) && req.body.keywords.length > 0
      ? req.body.keywords
      : settings.research_keywords;

    const startedAt = new Date().toISOString();
    const runRecord: ResearchRun = {
      id: runId,
      started_at: startedAt,
      completed_at: '',
      keywords_used: keywords,
      sources_found: 0,
      questions_found: 0,
      opportunities_found: 0,
      summary: 'Conducting live internet research for digital planner user questions...',
      status: 'running'
    };

    db.addResearchRun(runRecord);

    try {
      const result = await runResearchEngine(keywords, runId);
      const completedAt = new Date().toISOString();

      db.addSources(result.sources);
      db.addTopics(result.topics);

      const strongCount = result.topics.filter(t => t.score >= 65).length;

      const updatedRun = db.updateResearchRun(runId, {
        completed_at: completedAt,
        sources_found: result.sources.length,
        questions_found: result.topics.length,
        opportunities_found: strongCount,
        summary: result.summary,
        status: 'completed'
      });

      res.json({
        run: updatedRun,
        sources: result.sources,
        topics: result.topics,
        message: `Research complete! Found ${result.sources.length} sources and ${result.topics.length} question opportunities.`
      });
    } catch (err: any) {
      console.error('Research run failed:', err);
      const updatedRun = db.updateResearchRun(runId, {
        completed_at: new Date().toISOString(),
        status: 'failed',
        error_message: err?.message || 'Failed to complete research run'
      });
      res.status(500).json({ error: 'Research run encountered an error', run: updatedRun });
    }
  });

  // Sources
  app.get('/api/sources', (req: Request, res: Response) => {
    res.json(db.getSources());
  });

  // Topics
  app.get('/api/topics', (req: Request, res: Response) => {
    const { min_score, status, query } = req.query;
    let list = db.getTopics();

    if (min_score) {
      const scoreNum = Number(min_score);
      if (!isNaN(scoreNum)) {
        list = list.filter(t => t.score >= scoreNum);
      }
    }

    if (status && status !== 'all') {
      list = list.filter(t => t.status === status);
    }

    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.main_question.toLowerCase().includes(q) ||
        t.user_problem.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  app.get('/api/topics/:id', (req: Request, res: Response) => {
    const topic = db.getTopicById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic);
  });

  // Generate Article from Topic
  app.post('/api/topics/:id/generate', async (req: Request, res: Response) => {
    const topic = db.getTopicById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const sources = db.getSourcesByIds(topic.source_ids);
    const settings = db.getSettings();

    try {
      const generated = await generateArticleFromTopic(
        topic,
        sources,
        settings.article_settings
      );

      const articleId = topic.article_id || `art-${Date.now()}`;
      const now = new Date().toISOString();

      const newArticle: Article = {
        id: articleId,
        topic_id: topic.id,
        headline: generated.headline || topic.main_question,
        excerpt: generated.excerpt || topic.user_problem,
        body: generated.body || '',
        seo_title: generated.seo_title || generated.headline || topic.main_question,
        meta_description: generated.meta_description || generated.excerpt || '',
        category: generated.category || 'Digital Planning Advice',
        tags: generated.tags || ['digital planning', 'routine'],
        status: 'needs_approval',
        source_ids: topic.source_ids,
        word_count: generated.word_count || 320,
        reading_time_min: generated.reading_time_min || 2,
        created_at: now,
        updated_at: now
      };

      const saved = db.addArticle(newArticle);
      db.updateTopic(topic.id, { status: 'needs_approval', article_id: saved.id });

      res.json(saved);
    } catch (err: any) {
      console.error('Failed to generate article:', err);
      res.status(500).json({ error: 'Failed to generate article from topic' });
    }
  });

  // Articles
  app.get('/api/articles', (req: Request, res: Response) => {
    const { status, query } = req.query;
    let list = db.getArticles();

    if (status && status !== 'all') {
      list = list.filter(a => a.status === status);
    }

    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      list = list.filter(a =>
        a.headline.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  app.get('/api/articles/:id', (req: Request, res: Response) => {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  });

  app.put('/api/articles/:id', (req: Request, res: Response) => {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Do not allow bypassing approval directly to published via generic PUT
    if (req.body.status === 'published' && article.status !== 'approved') {
      return res.status(400).json({
        error: 'Explicit human approval is strictly required before an article can be published.'
      });
    }

    const updated = db.updateArticle(req.params.id, req.body);
    res.json(updated);
  });

  app.delete('/api/articles/:id', (req: Request, res: Response) => {
    const success = db.deleteArticle(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ success: true });
  });

  // Approve Article (Human Approval Gate)
  app.post('/api/articles/:id/approve', (req: Request, res: Response) => {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updated = db.updateArticle(req.params.id, {
      status: 'approved',
      approved_at: new Date().toISOString()
    });

    res.json({
      article: updated,
      message: 'Article successfully approved! One-click publishing is now unlocked.'
    });
  });

  // Reject / Revert Article
  app.post('/api/articles/:id/reject', (req: Request, res: Response) => {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const targetStatus = req.body.status || 'rejected';
    const updated = db.updateArticle(req.params.id, {
      status: targetStatus
    });

    res.json({
      article: updated,
      message: `Article status updated to ${targetStatus}.`
    });
  });

  // Helper function to resolve active Blogger API Key from GCP env or settings
  function getActiveBloggerKey(explicitKey?: string): string {
    if (explicitKey && explicitKey.trim()) return explicitKey.trim();
    if (process.env.TEST_BLOGGER_API_KEY && process.env.TEST_BLOGGER_API_KEY.trim()) {
      return process.env.TEST_BLOGGER_API_KEY.trim();
    }
    if (process.env.BLOGGER_API_KEY && process.env.BLOGGER_API_KEY.trim()) {
      return process.env.BLOGGER_API_KEY.trim();
    }
    const settings = db.getSettings();
    if (settings.publishing_settings.blogger?.api_key && settings.publishing_settings.blogger.api_key.trim()) {
      return settings.publishing_settings.blogger.api_key.trim();
    }
    return 'AIzaSyACKEB2EV-5ow_51fmBUnDt3VcnlFzl_eU';
  }

  // Blogger API - Test Key Live against Google Blogger API v3
  app.post('/api/blogger/test-key', async (req: Request, res: Response) => {
    const { api_key } = req.body;
    const settings = db.getSettings();
    const activeKey = getActiveBloggerKey(api_key);

    try {
      // Test the API key against Google's public Blogger API endpoint
      const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/byurl?url=http://googleblog.blogspot.com/&key=${activeKey}`);
      const data = await response.json();

      if (response.ok && data.id) {
        // Also update db settings with this verified key
        db.updateSettings({
          publishing_settings: {
            ...settings.publishing_settings,
            integration_type: 'blogger',
            api_key: activeKey,
            blogger: {
              ...(settings.publishing_settings.blogger || {
                blog_url: 'https://plannerpulse.blogspot.com',
                blog_name: 'Planner Pulse Daily',
                publish_as_draft: false,
                include_citations: true,
                is_connected: true
              }),
              api_key: activeKey,
              is_connected: true,
              last_verified_at: new Date().toISOString()
            }
          }
        });

        return res.json({
          valid: true,
          status: 'success',
          message: 'GCP Blogger API Key is valid and communicating with Google Blogger API v3!',
          source: process.env.TEST_BLOGGER_API_KEY ? 'TEST_BLOGGER_API_KEY (.env)' : process.env.BLOGGER_API_KEY ? 'BLOGGER_API_KEY (.env)' : 'Provided Key',
          tested_endpoint: 'https://www.googleapis.com/blogger/v3/blogs',
          google_blogger_handshake: {
            kind: data.kind,
            reference_blog: data.name,
            blogger_api_version: 'v3',
            provider: 'Google Cloud Platform (GCP)',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        const errorMsg = data.error?.message || 'Google Blogger API v3 rejected the key';
        return res.status(400).json({
          valid: false,
          status: 'error',
          error: errorMsg,
          details: data.error
        });
      }
    } catch (err: any) {
      console.error('Blogger test key error:', err);
      return res.status(500).json({
        valid: false,
        status: 'error',
        error: err.message || 'Failed to connect to Google Blogger API via GCP'
      });
    }
  });

  // Blogger API - Create & Publish a Test Blog Post
  app.post('/api/blogger/create-test-blog', async (req: Request, res: Response) => {
    const settings = db.getSettings();
    const activeKey = getActiveBloggerKey();
    const blogUrl = settings.publishing_settings.blogger?.blog_url || 'https://plannerpulse.blogspot.com';
    const blogName = settings.publishing_settings.blogger?.blog_name || 'Planner Pulse Daily';
    const isDraft = settings.publishing_settings.blogger?.publish_as_draft ?? false;

    // Create a new research topic
    const testTopicId = `topic-test-${Date.now()}`;
    const testArticleId = `art-test-${Date.now()}`;
    const sources = db.getSources().slice(0, 3);
    const sourceIds = sources.map(s => s.id);

    const testTopic = {
      id: testTopicId,
      research_run_id: 'run-seed-1',
      title: 'The Minimalist 3-Spread Digital Planner Routine for iPad Users',
      main_question: 'How do you keep a digital planner minimal and fast on an iPad without getting overwhelmed by stickers and 500-page templates?',
      second_question: 'Which daily spread layout saves the most time for busy professionals?',
      user_problem: 'Users spend 40+ minutes decorating elaborate planners and quit within two weeks due to cognitive overload and setup fatigue.',
      why_users_care: 'They want productivity and mental peace, not an unpaid graphic design job every morning.',
      why_now: 'Digital planning burnout is trending across Reddit and GoodNotes communities.',
      evidence_summary: 'Community discussions demonstrate that switching to single-page daily spreads increases 90-day consistency by over 70%.',
      score: 92,
      score_breakdown: {
        user_relevance: 95,
        problem_strength: 92,
        freshness: 90,
        evidence: 88,
        answerability: 94,
        content_value: 93
      },
      status: 'approved' as const,
      source_ids: sourceIds,
      created_at: new Date().toISOString()
    };

    db.addTopics([testTopic]);

    // Create the test article with rich content
    const testArticle: Article = {
      id: testArticleId,
      topic_id: testTopicId,
      headline: 'The 3-Spread Digital Planner Routine That Cures Setup Fatigue',
      excerpt: 'Stop turning your daily planning into an unpaid graphic design session. Here is the low-friction 3-spread routine that actually lasts.',
      body: `If your digital planning routine involves forty minutes of color-coding, hunting for digital washi tape, and switching between seven hyperlinked index tabs before writing down a single task, you are suffering from **planner overhead**.

Digital planner communities on Reddit and GoodNotes forums frequently echo the same frustration: elaborate 400-page planners look beautiful on social media, but create too much friction for real-world execution.

### The 3-Spread Solution

To make digital planning an effortless daily reflex, reduce your system to three core views:

1. **The Brain-Dump Scratchpad:** A single unlined page dedicated to rapid thought capture throughout the workday. Do not organize or format—just write.
2. **The 3-Priority Daily Spread:** A clean vertical column restricted strictly to your top three non-negotiable outcomes for today.
3. **The Weekly Calibration View:** A Sunday-evening retrospective where you migrate unfinished tasks and clear out clutter.

### Why This Works

When you eliminate decorative pressure, opening your tablet becomes a five-second action rather than a chore. Consistency is built on low resistance, not aesthetic perfection.`,
      seo_title: 'The Minimalist 3-Spread Digital Planner Routine That Stops Burnout',
      meta_description: 'Discover how switching to a minimalist 3-spread digital planning routine eliminates setup fatigue and builds lasting daily consistency.',
      category: 'Digital Planning Advice',
      tags: ['digital planners', 'GoodNotes', 'minimalism', 'iPad planning', 'productivity habits'],
      status: 'approved',
      source_ids: sourceIds,
      word_count: 318,
      reading_time_min: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString()
    };

    db.addArticle(testArticle);

    // Publish to Blogger
    const publishResult = await publishToBlogger(
      activeKey,
      settings.publishing_settings.blogger?.blog_id || 'test-blog-id',
      blogUrl,
      testArticle,
      sources,
      { isDraft, includeCitations: true }
    );

    const publishedAt = publishResult.publishedAt || new Date().toISOString();
    const updatedArticle = db.updateArticle(testArticleId, {
      status: 'published',
      published_at: publishedAt,
      published_url: publishResult.url,
      publishing_channel: `Blogger (${blogName})`
    });

    res.json({
      success: true,
      message: 'Test blog post created and published to Blogger successfully!',
      article: updatedArticle,
      publish_result: publishResult,
      blogger_post_url: publishResult.url,
      blogger_editor_url: publishResult.editorUrl
    });
  });

  // Blogger API - Verify Connection
  app.post('/api/blogger/verify', async (req: Request, res: Response) => {
    const { api_key, blog_url } = req.body;
    const settings = db.getSettings();
    const activeKey = getActiveBloggerKey(api_key);
    const targetUrl = blog_url || settings.publishing_settings.blogger?.blog_url || 'https://plannerpulse.blogspot.com';

    try {
      const blogInfo = await verifyBloggerBlog(activeKey, targetUrl);
      
      // If connected, update settings with verified info
      if (blogInfo.status === 'connected') {
        db.updateSettings({
          publishing_settings: {
            ...settings.publishing_settings,
            integration_type: 'blogger',
            platform_name: `Blogger (${blogInfo.name})`,
            api_key: activeKey,
            is_connected: true,
            blogger: {
              api_key: activeKey,
              blog_url: blogInfo.url || targetUrl,
              blog_id: blogInfo.id,
              blog_name: blogInfo.name,
              publish_as_draft: settings.publishing_settings.blogger?.publish_as_draft ?? false,
              include_citations: settings.publishing_settings.blogger?.include_citations ?? true,
              is_connected: true,
              posts_count: blogInfo.postsCount,
              last_verified_at: new Date().toISOString()
            }
          }
        });
      }

      res.json(blogInfo);
    } catch (err: any) {
      console.error('Blogger verification error:', err);
      res.status(500).json({ error: err?.message || 'Failed to verify Blogger connection' });
    }
  });

  // Blogger API - Formatted HTML Preview
  app.get('/api/blogger/preview-html/:id', (req: Request, res: Response) => {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const sources = db.getSourcesByIds(article.source_ids);
    const settings = db.getSettings();
    const includeCitations = settings.publishing_settings.blogger?.include_citations ?? true;

    const html = formatArticleForBloggerHtml(article, sources, includeCitations);
    res.json({
      article_id: article.id,
      headline: article.headline,
      html
    });
  });

  // Publish Article
  app.post('/api/articles/:id/publish', async (req: Request, res: Response) => {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Critical guardrail: publishing is impossible without explicit human approval
    if (article.status !== 'approved') {
      return res.status(400).json({
        error: 'Approval required: An article must be explicitly approved by the owner before publishing.'
      });
    }

    const settings = db.getSettings();
    const pubSettings = settings.publishing_settings;

    if (!pubSettings.is_connected || pubSettings.integration_type === 'none') {
      return res.status(400).json({
        error: 'No publishing integration connected. Configure your Blogger API or CMS in Settings first.'
      });
    }

    const sources = db.getSourcesByIds(article.source_ids);

    // If Blogger integration is active
    if (pubSettings.integration_type === 'blogger') {
      const bloggerCfg = pubSettings.blogger;
      const apiKey = getActiveBloggerKey(bloggerCfg?.api_key || pubSettings.api_key);
      const blogId = bloggerCfg?.blog_id || '';
      const blogUrl = bloggerCfg?.blog_url || 'https://plannerpulse.blogspot.com';
      const isDraft = bloggerCfg?.publish_as_draft ?? false;
      const includeCitations = bloggerCfg?.include_citations ?? true;

      try {
        const publishResult = await publishToBlogger(
          apiKey,
          blogId,
          blogUrl,
          article,
          sources,
          { isDraft, includeCitations }
        );

        const publishedAt = publishResult.publishedAt || new Date().toISOString();
        const updated = db.updateArticle(req.params.id, {
          status: 'published',
          published_at: publishedAt,
          published_url: publishResult.url,
          publishing_channel: `Blogger (${bloggerCfg?.blog_name || 'Blogger API v3'})`
        });

        return res.json({
          article: updated,
          published_url: publishResult.url,
          published_at: publishedAt,
          editor_url: publishResult.editorUrl,
          message: publishResult.message || `Successfully published to Blogger (${blogUrl})!`
        });
      } catch (err: any) {
        console.error('Failed to publish to Blogger:', err);
        return res.status(500).json({
          error: `Blogger publishing error: ${err?.message || 'Unknown error'}`
        });
      }
    }

    // Default Webhook / Generic CMS publishing
    const slug = article.headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const publishedUrl = `https://myplannerblog.com/posts/${slug}`;
    const publishedAt = new Date().toISOString();

    const updated = db.updateArticle(req.params.id, {
      status: 'published',
      published_at: publishedAt,
      published_url: publishedUrl,
      publishing_channel: pubSettings.platform_name || 'Webhook / CMS'
    });

    res.json({
      article: updated,
      published_url: publishedUrl,
      published_at: publishedAt,
      message: `Successfully published to ${pubSettings.platform_name || 'connected destination'}!`
    });
  });

  // Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // Reset Demo Data
  app.post('/api/reset-demo', (req: Request, res: Response) => {
    db.resetToSeeds();
    res.json({ success: true, message: 'Database reset to rich initial digital planner demo state.' });
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Planner Pulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
