import { AppSettings, Article, DashboardStats, ResearchRun, Source, Topic } from '../types';

export const api = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getResearchRuns(): Promise<ResearchRun[]> {
    const res = await fetch('/api/research/runs');
    if (!res.ok) throw new Error('Failed to fetch research runs');
    return res.json();
  },

  async triggerResearch(keywords?: string[]): Promise<{
    run: ResearchRun;
    sources: Source[];
    topics: Topic[];
    message: string;
  }> {
    const res = await fetch('/api/research/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Research run failed');
    }
    return res.json();
  },

  async getSources(): Promise<Source[]> {
    const res = await fetch('/api/sources');
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
  },

  async getTopics(params?: { min_score?: number; status?: string; query?: string }): Promise<Topic[]> {
    const query = new URLSearchParams();
    if (params?.min_score !== undefined) query.set('min_score', String(params.min_score));
    if (params?.status) query.set('status', params.status);
    if (params?.query) query.set('query', params.query);

    const res = await fetch(`/api/topics?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  },

  async getTopicById(id: string): Promise<Topic> {
    const res = await fetch(`/api/topics/${id}`);
    if (!res.ok) throw new Error('Failed to fetch topic');
    return res.json();
  },

  async generateArticle(topicId: string): Promise<Article> {
    const res = await fetch(`/api/topics/${topicId}/generate`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to generate article');
    return res.json();
  },

  async getArticles(params?: { status?: string; query?: string }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.query) query.set('query', params.query);

    const res = await fetch(`/api/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticleById(id: string): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update article');
    }
    return res.json();
  },

  async deleteArticle(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete article');
    return res.json();
  },

  async approveArticle(id: string): Promise<{ article: Article; message: string }> {
    const res = await fetch(`/api/articles/${id}/approve`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve article');
    }
    return res.json();
  },

  async rejectArticle(id: string, status: 'draft' | 'rejected' = 'rejected'): Promise<{ article: Article; message: string }> {
    const res = await fetch(`/api/articles/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to reject article');
    return res.json();
  },

  async publishArticle(id: string): Promise<{
    article: Article;
    published_url: string;
    published_at: string;
    editor_url?: string;
    message: string;
  }> {
    const res = await fetch(`/api/articles/${id}/publish`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Publishing failed');
    }
    return res.json();
  },

  async testBloggerKey(apiKey?: string): Promise<{
    valid: boolean;
    status: 'success' | 'error';
    message: string;
    source?: string;
    tested_endpoint?: string;
    google_blogger_handshake?: {
      kind: string;
      reference_blog: string;
      blogger_api_version: string;
      provider?: string;
      timestamp: string;
    };
    error?: string;
  }> {
    const res = await fetch('/api/blogger/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Blogger API key test failed');
    }
    return data;
  },

  async createTestBlogPost(): Promise<{
    success: boolean;
    message: string;
    article: Article;
    publish_result: any;
    blogger_post_url: string;
    blogger_editor_url: string;
  }> {
    const res = await fetch('/api/blogger/create-test-blog', {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create test blog post');
    }
    return res.json();
  },

  async verifyBlogger(apiKey?: string, blogUrl?: string): Promise<{
    id: string;
    name: string;
    url: string;
    postsCount: number;
    status: 'connected' | 'error';
    error?: string;
  }> {
    const res = await fetch('/api/blogger/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, blog_url: blogUrl })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify Blogger connection');
    }
    return res.json();
  },

  async getBloggerPreviewHtml(articleId: string): Promise<{
    article_id: string;
    headline: string;
    html: string;
  }> {
    const res = await fetch(`/api/blogger/preview-html/${articleId}`);
    if (!res.ok) throw new Error('Failed to fetch Blogger HTML preview');
    return res.json();
  },

  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async resetDemoData(): Promise<void> {
    const res = await fetch('/api/reset-demo', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
  }
};
