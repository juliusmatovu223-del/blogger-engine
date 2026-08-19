import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  FileText, 
  Filter, 
  HelpCircle, 
  Layers, 
  Search, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';
import { Source, Topic } from '../types';

interface QuestionsViewProps {
  topics: Topic[];
  sources: Source[];
  onSelectTopicForArticle: (topicId: string) => void;
  onSelectArticle: (articleId: string) => void;
  isGeneratingArticle: boolean;
  activeGeneratingId: string | null;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  topics,
  sources,
  onSelectTopicForArticle,
  onSelectArticle,
  isGeneratingArticle,
  activeGeneratingId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'strong' | 'top'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const filteredTopics = topics.filter(t => {
    const matchesSearch = 
      t.main_question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_problem.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScore = 
      scoreFilter === 'all' ||
      (scoreFilter === 'strong' && t.score >= 65) ||
      (scoreFilter === 'top' && t.score >= 85);

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesScore && matchesStatus;
  });

  return (
    <div id="view-questions" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E2DD] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] tracking-tight flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#1E3A5F]" />
            <span>Discovered User Questions & Opportunity Ranking</span>
          </h2>
          <p className="text-xs text-[#6B665F] mt-1 font-sans">
            Real questions and struggles from digital planner users scored for editorial potential (minimum score 65 for article generation).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8E8B82] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter questions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#1A1A1A] placeholder-[#8E8B82] focus:outline-none focus:border-[#C48B57] w-52 shadow-2xs"
            />
          </div>

          {/* Score filter */}
          <select
            value={scoreFilter}
            onChange={e => setScoreFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C48B57] shadow-2xs"
          >
            <option value="all">All Scores</option>
            <option value="strong">Strong (Score ≥ 65)</option>
            <option value="top">Top Priority (Score ≥ 85)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C48B57] shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Opportunity</option>
            <option value="needs_approval">Needs Approval</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-2 shadow-2xs">
            <HelpCircle className="w-8 h-8 text-[#8E8B82] mx-auto opacity-50" />
            <p className="text-sm font-serif font-medium text-[#1A1A1A]">No questions matched your filters</p>
            <p className="text-xs text-[#6B665F]">Try adjusting your search criteria or trigger a fresh research run.</p>
          </div>
        ) : (
          filteredTopics.map(topic => {
            const isExpanded = expandedTopicId === topic.id;
            const isGeneratingThis = isGeneratingArticle && activeGeneratingId === topic.id;
            const linkedSources = sources.filter(s => topic.source_ids.includes(s.id));

            return (
              <div
                key={topic.id}
                className="rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] hover:border-[#D4A373] transition-all overflow-hidden shadow-2xs"
              >
                {/* Main Card Header */}
                <div className="p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Score badge */}
                        <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 ${
                          topic.score >= 85
                            ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                            : topic.score >= 65
                            ? 'bg-[#F0F7FF] text-[#1E3A5F] border border-[#BAE6FD]'
                            : 'bg-[#F4F1EA] text-[#6B665F] border border-[#E5E2DD]'
                        }`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Opportunity Score: {topic.score}/100</span>
                        </div>

                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          topic.status === 'published'
                            ? 'bg-[#FAF5FF] text-[#6D28D9] border border-[#E9D5FF]'
                            : topic.status === 'approved'
                            ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                            : topic.status === 'needs_approval'
                            ? 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
                            : 'bg-[#F4F1EA] text-[#6B665F] border border-[#E5E2DD]'
                        }`}>
                          {topic.status.replace('_', ' ').toUpperCase()}
                        </span>

                        <span className="text-xs text-[#8E8B82]">
                          Discovered {new Date(topic.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Main & Second Question */}
                      <div>
                        <h3 className="text-lg font-serif font-medium text-[#1A1A1A] tracking-tight leading-snug">
                          {topic.main_question}
                        </h3>
                        {topic.second_question && (
                          <p className="text-xs text-[#8F5722] font-medium mt-1 flex items-center gap-1.5 font-sans">
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#FFF8E7] border border-[#F3DEB2]">Sub-question</span>
                            <span>{topic.second_question}</span>
                          </p>
                        )}
                      </div>

                      {/* Problem Statement */}
                      <p className="text-xs text-[#6B665F] leading-relaxed">
                        <span className="font-semibold text-[#1A1A1A]">User Friction: </span>
                        {topic.user_problem}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                      {topic.article_id ? (
                        <button
                          onClick={() => onSelectArticle(topic.article_id!)}
                          className="px-4 py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#1A1A1A] text-xs font-semibold border border-[#E5E2DD] flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#1E3A5F]" />
                          <span>View Article Draft</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectTopicForArticle(topic.id)}
                          disabled={isGeneratingThis}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
                            isGeneratingThis
                              ? 'bg-[#E5E2DD] text-[#8E8B82] cursor-not-allowed'
                              : 'bg-[#C48B57] hover:bg-[#B37945] text-white font-medium hover:shadow-sm'
                          }`}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingThis ? 'animate-spin' : ''}`} />
                          <span>{isGeneratingThis ? 'Drafting 300–450w Post...' : 'Generate Blog Post'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                        className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#6B665F] hover:text-[#1A1A1A] border border-[#E5E2DD] transition-colors shadow-2xs"
                        title={isExpanded ? 'Collapse research' : 'Expand research & scoring'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 6-Criteria Mini Bar (Always visible) */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-[#E5E2DD]">
                    <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E2DD]">
                      <div className="text-[9px] uppercase font-mono text-[#8E8B82]">Relevance</div>
                      <div className="text-xs font-serif font-bold text-[#1A1A1A]">{topic.score_breakdown.user_relevance}%</div>
                    </div>
                    <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E2DD]">
                      <div className="text-[9px] uppercase font-mono text-[#8E8B82]">Problem Strength</div>
                      <div className="text-xs font-serif font-bold text-[#1A1A1A]">{topic.score_breakdown.problem_strength}%</div>
                    </div>
                    <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E2DD]">
                      <div className="text-[9px] uppercase font-mono text-[#8E8B82]">Freshness</div>
                      <div className="text-xs font-serif font-bold text-[#1A1A1A]">{topic.score_breakdown.freshness}%</div>
                    </div>
                    <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E2DD]">
                      <div className="text-[9px] uppercase font-mono text-[#8E8B82]">Evidence</div>
                      <div className="text-xs font-serif font-bold text-[#1A1A1A]">{topic.score_breakdown.evidence}%</div>
                    </div>
                    <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E2DD]">
                      <div className="text-[9px] uppercase font-mono text-[#8E8B82]">Answerability</div>
                      <div className="text-xs font-serif font-bold text-[#1A1A1A]">{topic.score_breakdown.answerability}%</div>
                    </div>
                    <div className="p-2 rounded bg-[#FAF8F5] border border-[#E5E2DD]">
                      <div className="text-[9px] uppercase font-mono text-[#8E8B82]">Content Value</div>
                      <div className="text-xs font-serif font-bold text-[#1A1A1A]">{topic.score_breakdown.content_value}%</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Research Drawer */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-[#FAF8F5] border-t border-[#E5E2DD] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Why users care & Why now */}
                      <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#E5E2DD] space-y-2 shadow-2xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#8F5722] font-semibold block">
                            Why Users Care:
                          </span>
                          <p className="text-xs text-[#1A1A1A] mt-0.5">{topic.why_users_care}</p>
                        </div>
                        <div className="pt-2 border-t border-[#E5E2DD]">
                          <span className="text-[10px] font-mono uppercase text-[#1E3A5F] font-semibold block">
                            Why Now:
                          </span>
                          <p className="text-xs text-[#1A1A1A] mt-0.5">{topic.why_now}</p>
                        </div>
                      </div>

                      {/* Evidence Summary */}
                      <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#E5E2DD] space-y-1.5 shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-[#2D5A27] font-semibold block">
                          Community Evidence Summary:
                        </span>
                        <p className="text-xs text-[#1A1A1A] leading-relaxed italic font-serif">
                          "{topic.evidence_summary}"
                        </p>
                      </div>
                    </div>

                    {/* Attached Real Sources */}
                    <div className="space-y-2">
                      <div className="text-xs font-serif font-medium text-[#1A1A1A]">
                        Attached Sources ({linkedSources.length}):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {linkedSources.map(s => (
                          <div
                            key={s.id}
                            className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5E2DD] text-xs space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4F1EA] text-[#8F5722] border border-[#E5E2DD]">
                                {s.domain}
                              </span>
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#6B665F] hover:text-[#1A1A1A] flex items-center gap-1 text-[11px] font-medium"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <h5 className="font-serif font-medium text-[#1A1A1A] line-clamp-1">{s.title}</h5>
                            <p className="text-[11px] text-[#6B665F] line-clamp-2">{s.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
