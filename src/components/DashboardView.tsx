import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Compass, 
  ExternalLink, 
  FileEdit, 
  FileText, 
  Globe, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import { Article, DashboardStats, Topic } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  topics: Topic[];
  articles: Article[];
  onTriggerSearch: () => void;
  isSearching: boolean;
  onSelectTopic: (topicId: string) => void;
  onSelectArticle: (articleId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'research' | 'questions' | 'articles' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  topics,
  articles,
  onTriggerSearch,
  isSearching,
  onSelectTopic,
  onSelectArticle,
  onNavigateTab
}) => {
  const topQuestions = topics
    .filter(t => t.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const pendingApproval = articles.filter(a => a.status === 'needs_approval');
  const recentlyPublished = articles.filter(a => a.status === 'published').slice(0, 3);
  const activeDrafts = articles.filter(a => a.status === 'draft' || a.status === 'approved');

  const statCards = [
    { label: 'Questions Found', value: stats?.questions_found ?? topics.length, icon: HelpCircle, color: 'text-[#1E3A5F]', bg: 'bg-[#F0F7FF]' },
    { label: 'Strong Opportunities', value: stats?.strong_opportunities ?? topics.filter(t => t.score >= 65).length, icon: TrendingUp, color: 'text-[#2D5A27]', bg: 'bg-[#F0FDF4]', sub: 'Score ≥ 65' },
    { label: 'Drafts', value: stats?.drafts_count ?? activeDrafts.length, icon: FileEdit, color: 'text-[#6B665F]', bg: 'bg-[#F4F1EA]' },
    { label: 'Needs Approval', value: stats?.needs_approval_count ?? pendingApproval.length, icon: ShieldAlert, color: 'text-[#975A16]', bg: 'bg-[#FFF8E7]', alert: (stats?.needs_approval_count ?? pendingApproval.length) > 0 },
    { label: 'Published', value: stats?.published_count ?? recentlyPublished.length, icon: Globe, color: 'text-[#6D28D9]', bg: 'bg-[#FAF5FF]' }
  ];

  const workflowSteps = [
    { num: '1', name: 'SEARCH', desc: 'Internet scan' },
    { num: '2', name: 'FILTER', desc: 'Noise removal' },
    { num: '3', name: 'IDENTIFY', desc: 'User struggles' },
    { num: '4', name: 'RANK', desc: 'Score 0–100' },
    { num: '5', name: 'GENERATE', desc: '300–450 words' },
    { num: '6', name: 'REVIEW', desc: 'Editor check' },
    { num: '7', name: 'APPROVE', desc: 'Human sign-off' },
    { num: '8', name: 'PUBLISH', desc: '1-Click push' }
  ];

  return (
    <div id="view-dashboard" className="space-y-8 pb-12">
      {/* Hero Banner with Editorial Aesthetic */}
      <div className="relative rounded-2xl bg-[#F4F1EA] border border-[#E5E2DD] p-6 sm:p-8 overflow-hidden shadow-2xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E2DD] text-[11px] font-medium text-[#8F5722]">
              <Sparkles className="w-3.5 h-3.5 text-[#C48B57]" />
              <span>Research-First Content Engine</span>
              <span className="text-[#8E8B82]">•</span>
              <span className="text-[#2D5A27] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                Blogger v3 API Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#1A1A1A] leading-snug">
              Find what digital planner users are asking. Turn it into useful content.
            </h1>
            <p className="text-sm text-[#6B665F] leading-relaxed font-sans">
              Planner Pulse scans real community discussions across Reddit, forums, and note-taking communities, scores genuine user problems, and crafts tight, source-grounded answers ready for your review.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="dash-search-btn"
              onClick={onTriggerSearch}
              disabled={isSearching}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                isSearching
                  ? 'bg-[#E5E2DD] text-[#8E8B82] cursor-wait animate-pulse'
                  : 'bg-[#C48B57] hover:bg-[#B37945] text-white hover:shadow-sm'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Searching Internet...' : 'Search Today'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('questions')}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-medium border border-[#E5E2DD] transition-colors shadow-2xs"
            >
              <span>Explore Ranked Questions</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6B665F]" />
            </button>
          </div>
        </div>

        {/* 8-Step Core Workflow Strip */}
        <div className="mt-8 pt-6 border-t border-[#E5E2DD]">
          <div className="text-[11px] font-mono uppercase text-[#8E8B82] tracking-wider mb-3 flex items-center gap-1.5 font-semibold">
            <Layers className="w-3.5 h-3.5 text-[#8E8B82]" />
            <span>Standard Operating Workflow</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {workflowSteps.map(st => (
              <div key={st.num} className="p-2 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-center shadow-2xs">
                <div className="text-[10px] font-serif text-[#C48B57] font-bold">{st.num}</div>
                <div className="text-[11px] font-semibold text-[#1A1A1A] truncate">{st.name}</div>
                <div className="text-[9px] text-[#8E8B82] truncate">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl bg-[#FFFFFF] border ${
                c.alert ? 'border-[#F3DEB2] ring-1 ring-[#F3DEB2] bg-[#FFFDF7]' : 'border-[#E5E2DD]'
              } flex flex-col justify-between shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6B665F]">{c.label}</span>
                <div className={`p-1.5 rounded-md ${c.bg} ${c.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">{c.value}</span>
                {c.sub && <span className="text-[10px] text-[#8E8B82] font-sans">{c.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Needs Approval Action Bar (When applicable) */}
      {pendingApproval.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#F3DEB2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FFF8E7] text-[#975A16] mt-0.5 sm:mt-0 border border-[#F3DEB2]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#975A16] font-serif text-sm">
                {pendingApproval.length} Article{pendingApproval.length !== 1 ? 's' : ''} Awaiting Owner Approval
              </h4>
              <p className="text-[11px] text-[#8F5722] mt-0.5 font-sans">
                Explicit human sign-off is required before publishing can be executed.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectArticle(pendingApproval[0].id)}
            className="px-3.5 py-1.5 rounded-md bg-[#1A1A1A] hover:bg-[#2C2825] text-[#FDFCFB] text-xs font-medium transition-colors shrink-0 shadow-xs"
          >
            Review Article Now
          </button>
        </div>
      )}

      {/* Two Column Layout: Today's Best Questions & Editorial Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Best Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C48B57]" />
                <span>Today's Best Questions</span>
              </h3>
              <p className="text-xs text-[#8E8B82]">Ranked opportunities based on current internet research</p>
            </div>
            <button
              onClick={() => onNavigateTab('questions')}
              className="text-xs text-[#8F5722] hover:text-[#1A1A1A] flex items-center gap-1 font-medium transition-colors"
            >
              <span>View all ({topics.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topQuestions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3 shadow-2xs">
                <HelpCircle className="w-8 h-8 text-[#8E8B82] mx-auto opacity-50" />
                <p className="text-xs text-[#6B665F]">No questions found yet. Click "Search Today" to start research.</p>
                <button
                  onClick={onTriggerSearch}
                  className="px-3.5 py-1.5 rounded bg-[#C48B57] text-white text-xs font-medium shadow-xs"
                >
                  Search Today
                </button>
              </div>
            ) : (
              topQuestions.map(topic => (
                <div
                  key={topic.id}
                  className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] hover:border-[#D4A373] transition-all space-y-3 group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          topic.score >= 85
                            ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                            : 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
                        }`}>
                          Score {topic.score}
                        </span>
                        <span className="text-[10px] font-mono text-[#8E8B82] px-1.5 py-0.5 rounded bg-[#F4F1EA] border border-[#E5E2DD]">
                          {topic.source_ids.length} Sources
                        </span>
                        <span className="text-[10px] text-[#8E8B82]">
                          {new Date(topic.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-serif font-medium text-[#1A1A1A] group-hover:text-[#8F5722] transition-colors leading-snug">
                        {topic.main_question}
                      </h4>
                    </div>

                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="shrink-0 px-3 py-1.5 rounded-md bg-[#F4F1EA] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#FDFCFB] text-xs font-medium border border-[#E5E2DD] hover:border-[#1A1A1A] transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>{topic.article_id ? 'View Article' : 'Generate'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-[#6B665F] leading-relaxed line-clamp-2">
                    {topic.user_problem}
                  </p>

                  <div className="pt-2.5 border-t border-[#E5E2DD] flex items-center justify-between text-[11px] text-[#8E8B82]">
                    <span className="truncate max-w-md italic font-serif">"{topic.evidence_summary}"</span>
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="text-[#8F5722] hover:underline shrink-0 ml-2 font-medium"
                    >
                      Inspect Evidence
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Approval Queue & Recently Published */}
        <div className="space-y-6">
          {/* Editorial Queue */}
          <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-2.5">
              <h3 className="text-sm font-serif font-medium text-[#1A1A1A] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1E3A5F]" />
                <span>Editorial Pipeline</span>
              </h3>
              <button
                onClick={() => onNavigateTab('articles')}
                className="text-[11px] text-[#8E8B82] hover:text-[#1A1A1A] font-medium"
              >
                All Articles
              </button>
            </div>

            <div className="space-y-2.5">
              {articles.slice(0, 4).map(art => {
                const isNeedsApproval = art.status === 'needs_approval';
                const isPublished = art.status === 'published';
                const isApproved = art.status === 'approved';

                return (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] hover:border-[#D4A373] cursor-pointer transition-all space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                        isPublished
                          ? 'bg-[#FAF5FF] text-[#6D28D9] border border-[#E9D5FF]'
                          : isApproved
                          ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                          : isNeedsApproval
                          ? 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
                          : 'bg-[#F4F1EA] text-[#6B665F] border border-[#E5E2DD]'
                      }`}>
                        {art.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[#8E8B82] font-mono">{art.word_count} words</span>
                    </div>
                    <h5 className="text-xs font-serif font-medium text-[#1A1A1A] line-clamp-1 hover:text-[#8F5722]">
                      {art.headline}
                    </h5>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Published */}
          <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-2.5">
              <h3 className="text-sm font-serif font-medium text-[#1A1A1A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#6D28D9]" />
                <span>Recently Published</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {recentlyPublished.length === 0 ? (
                <p className="text-xs text-[#8E8B82] text-center py-2">No articles published yet.</p>
              ) : (
                recentlyPublished.map(pub => (
                  <div key={pub.id} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] space-y-1.5">
                    <h5 className="text-xs font-serif font-medium text-[#1A1A1A] line-clamp-1">{pub.headline}</h5>
                    {pub.published_url && (
                      <a
                        href={pub.published_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-[#8F5722] hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{pub.published_url}</span>
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
