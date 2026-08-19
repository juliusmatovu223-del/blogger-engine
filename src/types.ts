export type ArticleStatus = 'draft' | 'needs_approval' | 'approved' | 'published' | 'rejected';
export type TopicStatus = 'new' | 'draft' | 'needs_approval' | 'approved' | 'published' | 'rejected';

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  published_at?: string;
  discovered_at: string;
  summary: string;
  evidence: string;
  sentiment?: 'frustrated' | 'confused' | 'curious' | 'seeking_recommendations' | 'neutral';
}

export interface ScoreBreakdown {
  user_relevance: number; // 0-100
  problem_strength: number; // 0-100
  freshness: number; // 0-100
  evidence: number; // 0-100
  answerability: number; // 0-100
  content_value: number; // 0-100
}

export interface Topic {
  id: string;
  research_run_id: string;
  title: string;
  main_question: string;
  second_question?: string;
  user_problem: string;
  why_users_care: string;
  why_now: string;
  evidence_summary: string;
  score: number; // 0-100
  score_breakdown: ScoreBreakdown;
  status: TopicStatus;
  source_ids: string[];
  sources?: Source[];
  article_id?: string;
  created_at: string;
}

export interface Article {
  id: string;
  topic_id: string;
  headline: string;
  excerpt: string;
  body: string;
  seo_title: string;
  meta_description: string;
  category?: string;
  tags?: string[];
  featured_image?: string;
  status: ArticleStatus;
  source_ids: string[];
  sources?: Source[];
  topic?: Topic;
  word_count: number;
  reading_time_min: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  published_at?: string;
  published_url?: string;
  publishing_channel?: string;
}

export interface ResearchRun {
  id: string;
  started_at: string;
  completed_at: string;
  keywords_used: string[];
  sources_found: number;
  questions_found: number;
  opportunities_found: number;
  summary: string;
  status: 'running' | 'completed' | 'failed';
  error_message?: string;
}

export interface BloggerSettings {
  api_key: string;
  blog_url: string;
  blog_id?: string;
  blog_name?: string;
  publish_as_draft: boolean;
  include_citations: boolean;
  is_connected: boolean;
  posts_count?: number;
  last_verified_at?: string;
}

export interface AppSettings {
  research_keywords: string[];
  automatic_daily_trigger: boolean;
  search_frequency: 'daily' | 'twice_daily' | 'weekly';
  article_settings: {
    min_words: number;
    max_words: number;
    preferred_range: string;
    tone: string;
    max_questions: number;
  };
  publishing_settings: {
    integration_type: 'blogger' | 'webhook' | 'wordpress' | 'ghost' | 'custom_api' | 'none';
    platform_name: string;
    api_endpoint: string;
    auth_header_name?: string;
    api_key?: string;
    is_connected: boolean;
    auto_open_url: boolean;
    blogger?: BloggerSettings;
  };
}

export interface DashboardStats {
  questions_found: number;
  strong_opportunities: number; // score >= 65
  drafts_count: number;
  needs_approval_count: number;
  approved_count: number;
  published_count: number;
  total_sources: number;
  latest_run?: ResearchRun;
}
