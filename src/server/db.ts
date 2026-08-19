import fs from 'fs';
import path from 'path';
import { AppSettings, Article, ResearchRun, Source, Topic } from '../types';

interface DatabaseSchema {
  sources: Source[];
  research_runs: ResearchRun[];
  topics: Topic[];
  articles: Article[];
  settings: AppSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: AppSettings = {
  research_keywords: [
    'digital planner',
    'digital planning',
    'iPad planner',
    'GoodNotes planner',
    'Notability planner',
    'PDF planner',
    'digital journal',
    'digital habit tracking',
    'digital goal planning',
    'daily planning routine',
    'planner overwhelm',
    'digital planner consistency'
  ],
  automatic_daily_trigger: true,
  search_frequency: 'daily',
  article_settings: {
    min_words: 250,
    max_words: 500,
    preferred_range: '300-450 words',
    tone: 'human, clear, helpful, conversational, practical, simple, confident',
    max_questions: 2
  },
  publishing_settings: {
    integration_type: 'blogger',
    platform_name: 'Blogger (Google Blogger)',
    api_endpoint: 'https://www.googleapis.com/blogger/v3',
    auth_header_name: 'Authorization',
    api_key: 'AIzaSyBFyXZ3w6-o4J0O6HIm4tAyclQUaTLU_IQ',
    is_connected: true,
    auto_open_url: true,
    blogger: {
      api_key: 'AIzaSyBFyXZ3w6-o4J0O6HIm4tAyclQUaTLU_IQ',
      blog_url: 'https://plannerpulse.blogspot.com',
      blog_name: 'Planner Pulse Daily',
      publish_as_draft: false,
      include_citations: true,
      is_connected: true,
      posts_count: 14,
      last_verified_at: '2026-08-14T10:00:00Z'
    }
  }
};

const SEED_SOURCES: Source[] = [
  {
    id: 'src-1',
    title: 'Why I stopped using my iPad digital planner after 3 months (honest reflection)',
    url: 'https://reddit.com/r/digitalplanning/comments/1f4k9a2/why_i_stopped_using_my_ipad_planner',
    domain: 'reddit.com',
    published_at: '2026-08-10T14:30:00Z',
    discovered_at: '2026-08-14T09:15:00Z',
    summary: 'User describes spending 45 minutes decorating hyperlinked spreads every morning until it became a second job, leading to planner burnout and total abandonment.',
    evidence: 'Over 140 comments agreeing that hyper-complex 200-page PDF planners with 50 habit trackers create friction rather than clarity.',
    sentiment: 'frustrated'
  },
  {
    id: 'src-2',
    title: 'Overwhelmed by daily planner layouts: How many tasks do you realistically schedule?',
    url: 'https://reddit.com/r/GoodNotes/comments/1e8m31q/how_many_tasks_on_daily_spread',
    domain: 'reddit.com',
    published_at: '2026-08-11T18:00:00Z',
    discovered_at: '2026-08-14T09:15:00Z',
    summary: 'Beginners trying to schedule 15-20 hourly blocks end up carrying over 70% of unfinished tasks daily, leading to guilt.',
    evidence: 'Community consensus recommending the Rule of 3 (1 primary priority, 2 secondary, 3 minor chores).',
    sentiment: 'confused'
  },
  {
    id: 'src-3',
    title: 'The Psychological Trap of Digital Planner Hoarding and Aesthetic Customization',
    url: 'https://productivefocus.blog/digital-planner-trap-aesthetic-vs-utility',
    domain: 'productivefocus.blog',
    published_at: '2026-08-08T11:20:00Z',
    discovered_at: '2026-08-14T09:15:00Z',
    summary: 'Analysis of why people confuse the feeling of designing a system with actual task execution.',
    evidence: 'Studies cited showing that spending >10 minutes setting up a daily page reduces actual task initiation probability by 35%.',
    sentiment: 'seeking_recommendations'
  },
  {
    id: 'src-4',
    title: 'GoodNotes 6 vs Notability vs Apple Notes for simple daily planning without friction',
    url: 'https://thepaperlessmovement.com/digital-planning-apps-comparison-simplicity',
    domain: 'thepaperlessmovement.com',
    published_at: '2026-08-12T08:00:00Z',
    discovered_at: '2026-08-14T09:15:00Z',
    summary: 'Users are migrating away from massive hyperlinked PDF planners toward lightweight single-page daily resets and Apple Pencil quick notes.',
    evidence: 'Surveys show 68% of digital planner users abandon planners when navigation between tabs takes more than 2 taps.',
    sentiment: 'seeking_recommendations'
  },
  {
    id: 'src-5',
    title: 'Why digital planners feel overwhelming when life gets chaotic (and the 2-minute fix)',
    url: 'https://reddit.com/r/ipad/comments/1g1x2z9/digital_planning_burnout_solution',
    domain: 'reddit.com',
    published_at: '2026-08-13T16:45:00Z',
    discovered_at: '2026-08-14T09:15:00Z',
    summary: 'A widely upvoted guide on shrinking digital planner usage down to an index card size during high-stress weeks.',
    evidence: '230+ upvotes; users confirmed that treating planners as living scratchpads rather than museum exhibits restored consistency.',
    sentiment: 'frustrated'
  }
];

const SEED_TOPICS: Topic[] = [
  {
    id: 'topic-1',
    research_run_id: 'run-seed-1',
    title: 'Why Digital Planners Get Abandoned After a Few Weeks',
    main_question: 'Why do I keep abandoning my digital planner?',
    second_question: 'How do I simplify my digital planning routine to stay consistent?',
    user_problem: 'Users buy intricate hyperlinked planners, spend excessive time decorating templates, and abandon them as soon as routine demands feel like a chore.',
    why_users_care: 'They blame themselves for a lack of discipline when the root cause is system complexity and setup friction.',
    why_now: 'Trending discussions across r/digitalplanning and productivity blogs show widespread planner burnout from over-designed spreads.',
    evidence_summary: 'Multiple Reddit discussions (140+ comments) and productivity blog reviews highlighting that 10+ minute page setup directly triggers avoidance.',
    score: 92,
    score_breakdown: {
      user_relevance: 95,
      problem_strength: 92,
      freshness: 90,
      evidence: 88,
      answerability: 96,
      content_value: 91
    },
    status: 'published',
    source_ids: ['src-1', 'src-3', 'src-4'],
    article_id: 'art-1',
    created_at: '2026-08-14T09:20:00Z'
  },
  {
    id: 'topic-2',
    research_run_id: 'run-seed-1',
    title: 'Daily Task Capacity: How Many Items to Put on a Digital Planner Page',
    main_question: 'How many things should I realistically put on my daily planner?',
    second_question: 'What is the best way to handle unfinished tasks without feeling guilty?',
    user_problem: 'Planner users pack 15-20 hourly slots with tasks, finish only 4-5, and experience demoralizing task rollover every evening.',
    why_users_care: 'Overloaded daily spreads turn a tool designed for peace into a daily catalog of perceived failure.',
    why_now: 'Surge in community questions on GoodNotes and iPad forums about structuring daily spreads during work and study crunch times.',
    evidence_summary: 'Consensus from r/GoodNotes threads where users shared the "Rule of 3" and 2-column action methods to eliminate rollover stress.',
    score: 87,
    score_breakdown: {
      user_relevance: 90,
      problem_strength: 88,
      freshness: 85,
      evidence: 84,
      answerability: 92,
      content_value: 86
    },
    status: 'needs_approval',
    source_ids: ['src-2', 'src-5'],
    article_id: 'art-2',
    created_at: '2026-08-14T09:22:00Z'
  },
  {
    id: 'topic-3',
    research_run_id: 'run-seed-1',
    title: 'Fixing Digital Planner Overwhelm During Busy Weeks',
    main_question: 'Why does my digital planner feel overwhelming when my schedule gets busy?',
    second_question: 'What is the minimum viable digital planning routine?',
    user_problem: 'When schedules become chaotic, navigating between tabs, stickers, and color-coded widgets takes too much mental bandwidth.',
    why_users_care: 'People need their planner most when stressed, yet that is exactly when complex digital planners break down.',
    why_now: 'Fresh discussions on r/ipad showing users switching to single daily scratchpad pages during peak workload cycles.',
    evidence_summary: '230+ upvotes on user case studies showing that a 2-minute single-page reset prevents total planner abandonment.',
    score: 84,
    score_breakdown: {
      user_relevance: 88,
      problem_strength: 86,
      freshness: 86,
      evidence: 80,
      answerability: 88,
      content_value: 82
    },
    status: 'draft',
    source_ids: ['src-4', 'src-5'],
    article_id: 'art-3',
    created_at: '2026-08-14T09:25:00Z'
  },
  {
    id: 'topic-4',
    research_run_id: 'run-seed-1',
    title: 'GoodNotes vs Notability for Low-Friction Daily Planning',
    main_question: 'Which digital planning app creates the least friction for daily check-ins?',
    second_question: 'Are hyperlinked PDF planners faster than blank bullet journals?',
    user_problem: 'Users spend weeks comparing apps and downloading bloated 500-page planner templates without ever settling into an executable routine.',
    why_users_care: 'App paralysis delays real productivity; users want an honest breakdown focused on speed rather than aesthetics.',
    why_now: 'Recent updates to note-taking apps have changed PDF loading speed and Apple Pencil latency.',
    evidence_summary: 'Comparative analysis from Paperless Movement demonstrating navigation speed benchmarks across popular tablet planning apps.',
    score: 76,
    score_breakdown: {
      user_relevance: 80,
      problem_strength: 74,
      freshness: 78,
      evidence: 75,
      answerability: 78,
      content_value: 75
    },
    status: 'new',
    source_ids: ['src-4'],
    created_at: '2026-08-14T09:30:00Z'
  }
];

const SEED_ARTICLES: Article[] = [
  {
    id: 'art-1',
    topic_id: 'topic-1',
    headline: 'Why You Keep Abandoning Your Digital Planner (And How to Fix It)',
    excerpt: 'If you keep buying digital planners only to abandon them by week three, the problem is not your discipline. It is the friction of your system.',
    body: `If you have ever downloaded an elaborate 300-page digital planner, meticulously customized your color palette on Monday, and completely stopped opening the file by Thursday, you are not alone. 

Online discussions across planner forums reveal a consistent pattern: digital planner abandonment is rarely caused by a lack of willpower. It is caused by **excessive operational friction**.

### The Setup Trap
When a digital planning routine requires more than five minutes of layout formatting, sticker placement, or hyperlinked tab hopping, your brain begins to categorize the planner as a task in itself rather than a tool for execution. 

Research into productivity habits shows that spending excessive time crafting the appearance of a day directly reduces your energy for initiating actual work. When life gets hectic, the first thing people drop is the high-maintenance system.

### The Fix: Switch to a 3-Minute Daily Reset
To make digital planning stick, eliminate the decorative overhead and focus strictly on actionable clarity:

1. **Limit page setup to three minutes max.** If setting up tomorrow's page takes longer than making a cup of coffee, your template is too complex.
2. **Use a single active view.** Hide or ignore auxiliary habit grids and multi-tier tracking charts until your core daily habit is solid.
3. **Treat your planner as a working scratchpad.** It does not need to look like a curated social media post. Strikeouts, quick scribbles, and unfinished margins are signs of real work.

By reducing the friction required to open and log in your planner, consistency becomes the default path of least resistance.`,
    seo_title: 'Why You Keep Abandoning Your Digital Planner (And the 3-Minute Fix)',
    meta_description: 'Discover why digital planners get abandoned within weeks and how switching to a low-friction 3-minute routine builds lasting consistency.',
    category: 'Digital Planning Habits',
    tags: ['digital planners', 'GoodNotes', 'habit consistency', 'productivity systems'],
    status: 'published',
    source_ids: ['src-1', 'src-3', 'src-4'],
    word_count: 312,
    reading_time_min: 2,
    created_at: '2026-08-14T10:00:00Z',
    updated_at: '2026-08-14T10:15:00Z',
    approved_at: '2026-08-14T10:10:00Z',
    published_at: '2026-08-14T10:15:00Z',
    published_url: 'https://myplannerblog.com/posts/why-you-keep-abandoning-digital-planner',
    publishing_channel: 'Custom Webhook / CMS'
  },
  {
    id: 'art-2',
    topic_id: 'topic-2',
    headline: 'How Many Tasks Should You Actually Put on Your Daily Planner?',
    excerpt: 'Packing your daily planner with 15 tasks practically guarantees burnout. Here is the realistic task threshold that keeps digital planners useful.',
    body: `One of the quickest ways to ruin a digital planner is filling every available line on the daily spread. 

When you write down fifteen distinct to-dos alongside hourly time blocks, any unexpected interruption creates an instant backlog. By evening, carrying over ten unfinished items triggers guilt—and within a week, you stop opening the app altogether.

### The Psychological Cost of Task Rollover
Planner discussions highlight a recurring user dilemma: when a daily page looks like an endless wishlist, it ceases to be a strategic guide. Unfinished items don't just disappear; they generate mental weight. The friction of copying them over to the next day creates subtle negative reinforcement.

### The Rule of 1-2-3
To keep your digital planner grounded in reality, constrain your daily spread to a maximum of six intentional commitments:

- **1 Big Rock:** The single non-negotiable project or outcome that moves the needle today.
- **2 Medium Tasks:** Important supporting tasks with clear deliverables (e.g., draft client proposal, review quarterly outline).
- **3 Minor Maintenance Chores:** Quick administrative errands (e.g., reply to urgent email, file receipts, order groceries).

Anything beyond these six belongs on a separate weekly braindump page—not on your active daily canvas.

### What to Do with Incomplete Tasks
If you don't finish a task, pause before automatically carrying it forward. Ask whether it truly needs to happen tomorrow, or if it can be archived to a backlog. Protecting your daily page from clutter is what keeps your digital planning routine sustainable.`,
    seo_title: 'How Many Tasks to Put on Your Daily Planner (The 1-2-3 Rule)',
    meta_description: 'Learn how many tasks to realistically schedule on your digital planner each day to prevent task rollover guilt and maintain daily momentum.',
    category: 'Productivity Workflows',
    tags: ['task management', 'digital planning', 'daily routine', 'focus'],
    status: 'needs_approval',
    source_ids: ['src-2', 'src-5'],
    word_count: 328,
    reading_time_min: 2,
    created_at: '2026-08-14T11:00:00Z',
    updated_at: '2026-08-14T11:00:00Z'
  },
  {
    id: 'art-3',
    topic_id: 'topic-3',
    headline: 'Why Your Digital Planner Feels Overwhelming (And the 2-Minute Reset)',
    excerpt: 'When life gets busy, opening a multi-tab digital planner can feel paralyzing. Here is how to shrink your system when your schedule gets crazy.',
    body: `When your calendar gets packed and your stress levels spike, opening a massive digital planner with twenty hyperlinked sections can feel like opening a second job.

Ironically, people often abandon their digital planners at the exact moment they need organization the most. Why? Because complex templates require mental bandwidth that you simply do not have during a crunch period.

### Signs Your Planner Is Too Heavy
- You feel anxious just looking at your empty habit trackers.
- You spend five minutes navigating tabs before writing down a single note.
- You avoid the app because you missed three days in a row and feel behind.

### The 2-Minute Single-Page Reset
When life accelerates, don't abandon planning—downscale the format.

Open a completely blank page in your note-taking app or create a dedicated "Quick Action" scratchpad. Write only three things:

1. **The single task that must be done before noon.**
2. **The single task that must be done before 5 PM.**
3. **One brief boundary for your sanity (e.g., stop working at 6 PM).**

Forget about habit rings, water trackers, and aesthetic stickers for the next 48 hours. Once your workload stabilizes, you can return to full spreads. But during high-demand weeks, your digital planner should be a life raft, not an obstacle course.`,
    seo_title: 'Why Digital Planners Feel Overwhelming During Busy Weeks',
    meta_description: 'Feeling overwhelmed by your digital planner? Use the 2-minute single-page reset to stay organized without template friction.',
    category: 'Planner Troubleshooting',
    tags: ['planner overwhelm', 'iPad planning', 'GoodNotes', 'minimalism'],
    status: 'draft',
    source_ids: ['src-4', 'src-5'],
    word_count: 305,
    reading_time_min: 2,
    created_at: '2026-08-14T11:30:00Z',
    updated_at: '2026-08-14T11:30:00Z'
  }
];

const SEED_RESEARCH_RUNS: ResearchRun[] = [
  {
    id: 'run-seed-1',
    started_at: '2026-08-14T09:10:00Z',
    completed_at: '2026-08-14T09:15:00Z',
    keywords_used: ['digital planner', 'GoodNotes planner', 'iPad planning consistency', 'planner overwhelm'],
    sources_found: 5,
    questions_found: 4,
    opportunities_found: 3,
    summary: 'Discovered high-volume discussions around digital planner abandonment, aesthetic burnout vs practical execution, and daily task rollover fatigue across Reddit and productivity publications.',
    status: 'completed'
  }
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.settings?.publishing_settings?.blogger) {
          parsed.settings = {
            ...DEFAULT_SETTINGS,
            ...parsed.settings,
            publishing_settings: {
              ...DEFAULT_SETTINGS.publishing_settings,
              ...(parsed.settings?.publishing_settings || {})
            }
          };
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.error('Failed to parse database file, initializing with seeds:', err);
    }
    const initial: DatabaseSchema = {
      sources: SEED_SOURCES,
      research_runs: SEED_RESEARCH_RUNS,
      topics: SEED_TOPICS,
      articles: SEED_ARTICLES,
      settings: DEFAULT_SETTINGS
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  public resetToSeeds(): void {
    this.data = {
      sources: [...SEED_SOURCES],
      research_runs: [...SEED_RESEARCH_RUNS],
      topics: [...SEED_TOPICS],
      articles: [...SEED_ARTICLES],
      settings: { ...DEFAULT_SETTINGS }
    };
    this.saveData(this.data);
  }

  // Sources
  public getSources(): Source[] {
    return this.data.sources;
  }

  public getSourcesByIds(ids: string[]): Source[] {
    return this.data.sources.filter(s => ids.includes(s.id));
  }

  public addSources(newSources: Source[]): void {
    for (const src of newSources) {
      const existsIndex = this.data.sources.findIndex(s => s.url === src.url || s.id === src.id);
      if (existsIndex >= 0) {
        this.data.sources[existsIndex] = { ...this.data.sources[existsIndex], ...src };
      } else {
        this.data.sources.unshift(src);
      }
    }
    this.saveData(this.data);
  }

  // Research Runs
  public getResearchRuns(): ResearchRun[] {
    return this.data.research_runs;
  }

  public addResearchRun(run: ResearchRun): void {
    this.data.research_runs.unshift(run);
    this.saveData(this.data);
  }

  public updateResearchRun(id: string, updates: Partial<ResearchRun>): ResearchRun | null {
    const run = this.data.research_runs.find(r => r.id === id);
    if (!run) return null;
    Object.assign(run, updates);
    this.saveData(this.data);
    return run;
  }

  // Topics
  public getTopics(): Topic[] {
    return this.data.topics.map(t => ({
      ...t,
      sources: this.getSourcesByIds(t.source_ids)
    }));
  }

  public getTopicById(id: string): Topic | null {
    const topic = this.data.topics.find(t => t.id === id);
    if (!topic) return null;
    return {
      ...topic,
      sources: this.getSourcesByIds(topic.source_ids)
    };
  }

  public addTopics(newTopics: Topic[]): void {
    for (const t of newTopics) {
      const idx = this.data.topics.findIndex(item => item.id === t.id);
      if (idx >= 0) {
        this.data.topics[idx] = t;
      } else {
        this.data.topics.unshift(t);
      }
    }
    this.saveData(this.data);
  }

  public updateTopic(id: string, updates: Partial<Topic>): Topic | null {
    const topic = this.data.topics.find(t => t.id === id);
    if (!topic) return null;
    Object.assign(topic, updates);
    this.saveData(this.data);
    return this.getTopicById(id);
  }

  // Articles
  public getArticles(): Article[] {
    return this.data.articles.map(a => {
      const topic = this.data.topics.find(t => t.id === a.topic_id);
      return {
        ...a,
        sources: this.getSourcesByIds(a.source_ids),
        topic: topic ? { ...topic, sources: this.getSourcesByIds(topic.source_ids) } : undefined
      };
    });
  }

  public getArticleById(id: string): Article | null {
    const article = this.data.articles.find(a => a.id === id);
    if (!article) return null;
    const topic = this.data.topics.find(t => t.id === article.topic_id);
    return {
      ...article,
      sources: this.getSourcesByIds(article.source_ids),
      topic: topic ? { ...topic, sources: this.getSourcesByIds(topic.source_ids) } : undefined
    };
  }

  public addArticle(article: Article): Article {
    const existingIndex = this.data.articles.findIndex(a => a.id === article.id || (article.topic_id && a.topic_id === article.topic_id));
    if (existingIndex >= 0) {
      this.data.articles[existingIndex] = {
        ...this.data.articles[existingIndex],
        ...article,
        updated_at: new Date().toISOString()
      };
      this.saveData(this.data);
      return this.getArticleById(this.data.articles[existingIndex].id)!;
    }
    this.data.articles.unshift(article);
    // Update linked topic
    const topic = this.data.topics.find(t => t.id === article.topic_id);
    if (topic) {
      topic.article_id = article.id;
      topic.status = article.status;
    }
    this.saveData(this.data);
    return this.getArticleById(article.id)!;
  }

  public updateArticle(id: string, updates: Partial<Article>): Article | null {
    const article = this.data.articles.find(a => a.id === id);
    if (!article) return null;

    Object.assign(article, updates);
    article.updated_at = new Date().toISOString();

    // Recalculate word count and reading time
    if (updates.body !== undefined || updates.headline !== undefined) {
      const fullText = `${article.headline} ${article.body}`;
      const words = fullText.trim().split(/\s+/).filter(Boolean).length;
      article.word_count = words;
      article.reading_time_min = Math.max(1, Math.ceil(words / 200));
    }

    // Sync status to topic
    if (updates.status && article.topic_id) {
      const topic = this.data.topics.find(t => t.id === article.topic_id);
      if (topic) {
        topic.status = updates.status;
      }
    }

    this.saveData(this.data);
    return this.getArticleById(id);
  }

  public deleteArticle(id: string): boolean {
    const idx = this.data.articles.findIndex(a => a.id === id);
    if (idx < 0) return false;
    const article = this.data.articles[idx];
    if (article.topic_id) {
      const topic = this.data.topics.find(t => t.id === article.topic_id);
      if (topic) {
        topic.article_id = undefined;
        topic.status = 'new';
      }
    }
    this.data.articles.splice(idx, 1);
    this.saveData(this.data);
    return true;
  }

  // Settings
  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData(this.data);
    return this.data.settings;
  }
}

export const db = new Database();
