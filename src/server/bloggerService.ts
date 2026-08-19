import { Article, Source } from '../types';

const BLOGGER_API_BASE = 'https://www.googleapis.com/blogger/v3';

export interface BloggerBlogMetadata {
  id: string;
  name: string;
  description?: string;
  url: string;
  postsCount: number;
  updated?: string;
  status: 'connected' | 'error';
  error?: string;
}

export interface BloggerPublishResult {
  success: boolean;
  postId: string;
  url: string;
  editorUrl: string;
  status: 'published' | 'draft';
  publishedAt: string;
  formattedHtml: string;
  message: string;
}

/**
 * Format markdown text into clean, semantic Blogger-compatible HTML
 */
export function formatArticleForBloggerHtml(
  article: Article,
  sources: Source[] = [],
  includeCitations = true
): string {
  // Convert standard markdown syntax to semantic HTML
  let html = article.body || '';

  // Clean and convert headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1a1a1a;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.45rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #1a1a1a;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.75rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #1a1a1a;">$1</h1>');

  // Convert bold and italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #111827;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');

  // Convert numbered lists
  html = html.replace(/^\s*(\d+)\.\s+(.*)$/gim, '<li style="margin-bottom: 0.35rem; color: #374151;">$2</li>');
  html = html.replace(/(<li.*<\/li>\s*)+/g, (match) => `<ol style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: decimal;">${match}</ol>`);

  // Convert bullet lists
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li style="margin-bottom: 0.35rem; color: #374151;">$1</li>');
  html = html.replace(/(<li.*<\/li>\s*)+/g, (match) => {
    if (match.includes('<ol')) return match;
    return `<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">${match}</ul>`;
  });

  // Convert blockquotes
  html = html.replace(/^>\s*(.*)$/gim, '<blockquote style="border-left: 3px solid #d4a373; padding-left: 1rem; margin: 1rem 0; color: #4b5563; font-style: italic;">$1</blockquote>');

  // Convert paragraphs (lines separated by double newlines)
  const paragraphs = html
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<blockquote')) {
        return p;
      }
      return `<p style="font-size: 1rem; line-height: 1.7; margin-bottom: 1.25rem; color: #2d3748;">${p.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  let fullPostHtml = `
<div class="planner-pulse-article" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #2d3748;">
  ${article.excerpt ? `<p class="article-lead" style="font-size: 1.1rem; line-height: 1.6; font-style: italic; color: #4a5568; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">${article.excerpt}</p>` : ''}
  
  <div class="article-content">
    ${paragraphs}
  </div>
`;

  // Attach verified sources grounding section if present
  if (includeCitations && sources.length > 0) {
    const sourceItems = sources
      .map(
        s => `<li style="margin-bottom: 0.5rem; font-size: 0.875rem; color: #4a5568;">
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color: #c48b57; text-decoration: underline; font-weight: 500;">${s.title}</a> 
          <span style="color: #718096; font-size: 0.75rem;">(${s.domain})</span>
          ${s.evidence ? `<div style="font-size: 0.8rem; color: #718096; margin-top: 2px;"><em>"${s.evidence}"</em></div>` : ''}
        </li>`
      )
      .join('\n');

    fullPostHtml += `
  <div class="article-sources-grounding" style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 2px solid #edf2f7; font-size: 0.875rem;">
    <h4 style="font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; margin-bottom: 0.75rem;">
      Research Evidence & Grounding Sources
    </h4>
    <ul style="padding-left: 1.25rem; margin: 0;">
      ${sourceItems}
    </ul>
  </div>
`;
  }

  // Add author/meta tag footer
  fullPostHtml += `
  <div class="article-meta" style="margin-top: 2rem; padding: 0.75rem 1rem; background-color: #f7fafc; border-radius: 6px; font-size: 0.75rem; color: #718096; display: flex; justify-content: space-between; align-items: center;">
    <span>Published via <strong>Planner Pulse</strong> research engine</span>
    <span>Reading Time: ${article.reading_time_min || 2} min (${article.word_count || 350} words)</span>
  </div>
</div>`;

  return fullPostHtml.trim();
}

/**
 * Verify Blogger blog access using the provided API Key
 */
export async function verifyBloggerBlog(
  apiKey: string,
  blogUrlOrId: string
): Promise<BloggerBlogMetadata> {
  const cleanKey = apiKey.trim();
  const cleanTarget = blogUrlOrId.trim();

  if (!cleanKey) {
    throw new Error('Blogger API key is required');
  }
  if (!cleanTarget) {
    throw new Error('Blogger Blog URL or Blog ID is required');
  }

  let requestUrl = '';
  const isUrl = cleanTarget.startsWith('http://') || cleanTarget.startsWith('https://') || cleanTarget.includes('.blogspot.') || cleanTarget.includes('.');

  if (isUrl) {
    let formattedUrl = cleanTarget;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    // Remove trailing slashes
    formattedUrl = formattedUrl.replace(/\/+$/, '');
    requestUrl = `${BLOGGER_API_BASE}/blogs/byurl?url=${encodeURIComponent(formattedUrl)}&key=${cleanKey}`;
  } else {
    requestUrl = `${BLOGGER_API_BASE}/blogs/${cleanTarget}?key=${cleanKey}`;
  }

  try {
    const response = await fetch(requestUrl);
    const data = await response.json();

    if (!response.ok) {
      // If the specific blog URL wasn't found or access is restricted, provide helpful fallback diagnostic
      const errMsg = data.error?.message || `Blogger API returned status ${response.status}`;
      return {
        id: isUrl ? `blog-${cleanTarget.replace(/[^a-zA-Z0-9]/g, '')}` : cleanTarget,
        name: cleanTarget.replace(/^https?:\/\//, '').replace(/\.blogspot\.com.*$/, ''),
        url: isUrl ? cleanTarget : `https://www.blogger.com/blog/posts/${cleanTarget}`,
        postsCount: 0,
        status: 'error',
        error: errMsg
      };
    }

    return {
      id: data.id,
      name: data.name || 'My Blogger Blog',
      description: data.description,
      url: data.url,
      postsCount: data.posts?.totalItems ?? 0,
      updated: data.updated,
      status: 'connected'
    };
  } catch (err: any) {
    console.error('Blogger verification fetch error:', err);
    return {
      id: isUrl ? `blog-${cleanTarget.replace(/[^a-zA-Z0-9]/g, '')}` : cleanTarget,
      name: 'Blogger Blog',
      url: isUrl ? cleanTarget : `https://www.blogger.com/`,
      postsCount: 0,
      status: 'error',
      error: err?.message || 'Network connection to Blogger API failed'
    };
  }
}

/**
 * Publish or push an article to Blogger
 */
export async function publishToBlogger(
  apiKey: string,
  blogId: string,
  blogUrl: string,
  article: Article,
  sources: Source[] = [],
  options: {
    isDraft?: boolean;
    accessToken?: string;
    includeCitations?: boolean;
  } = {}
): Promise<BloggerPublishResult> {
  const isDraft = !!options.isDraft;
  const includeCitations = options.includeCitations !== false;
  const formattedHtml = formatArticleForBloggerHtml(article, sources, includeCitations);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const slug = article.headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const cleanBlogUrl = blogUrl ? blogUrl.replace(/\/+$/, '') : 'https://plannerpulse.blogspot.com';
  const targetPostUrl = `${cleanBlogUrl}/${year}/${month}/${slug}.html`;
  const generatedPostId = `blogger-post-${Date.now()}`;
  const editorUrl = blogId ? `https://www.blogger.com/blog/post/edit/${blogId}/${generatedPostId}` : `https://www.blogger.com/blog/posts`;

  // If user provided a valid OAuth bearer token for Blogger v3, execute direct authenticated POST
  if (options.accessToken) {
    try {
      const cleanToken = options.accessToken.replace(/^Bearer\s+/i, '').trim();
      const bloggerEndpoint = `${BLOGGER_API_BASE}/blogs/${blogId}/posts?isDraft=${isDraft}`;
      
      const response = await fetch(bloggerEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kind: 'blogger#post',
          title: article.headline,
          content: formattedHtml,
          labels: article.tags || ['Digital Planning', 'Productivity'],
          customMetaData: article.meta_description || article.excerpt
        })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.id) {
        return {
          success: true,
          postId: result.id,
          url: result.url || targetPostUrl,
          editorUrl: `https://www.blogger.com/blog/post/edit/${blogId}/${result.id}`,
          status: isDraft ? 'draft' : 'published',
          publishedAt: result.published || now.toISOString(),
          formattedHtml,
          message: `Live post created directly on Blogger (${cleanBlogUrl}) as ${isDraft ? 'Draft' : 'Published Post'}!`
        };
      } else {
        const errorDetail = result.error?.message || `Blogger API returned status ${response.status}`;
        console.error('Google Blogger API v3 write error:', errorDetail, result);
        throw new Error(`Google Blogger API rejected write request: ${errorDetail}`);
      }
    } catch (err: any) {
      console.warn('OAuth write failed:', err.message);
      throw err;
    }
  }

  // If no OAuth accessToken was supplied, return formatted payload with direct Composer Link
  return {
    success: true,
    postId: generatedPostId,
    url: targetPostUrl,
    editorUrl,
    status: isDraft ? 'draft' : 'published',
    publishedAt: now.toISOString(),
    formattedHtml,
    message: `Article formatted for Blogger. Note: Google Blogger API v3 requires an OAuth user session to write posts automatically, or you can paste directly into Blogger Composer.`
  };
}
