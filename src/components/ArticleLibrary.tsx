import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileEdit, 
  FileText, 
  Filter, 
  Globe, 
  Plus, 
  Search, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Trash2 
} from 'lucide-react';
import { Article, ArticleStatus } from '../types';

interface ArticleLibraryProps {
  articles: Article[];
  onSelectArticle: (articleId: string) => void;
  onApproveArticle: (articleId: string) => void;
  onPublishArticle: (article: Article) => void;
  onNavigateToQuestions: () => void;
}

export const ArticleLibrary: React.FC<ArticleLibraryProps> = ({
  articles,
  onSelectArticle,
  onApproveArticle,
  onPublishArticle,
  onNavigateToQuestions
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = articles.filter(art => {
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchesSearch = 
      art.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'All Articles', count: articles.length },
    { id: 'needs_approval', label: 'Needs Approval', count: articles.filter(a => a.status === 'needs_approval').length },
    { id: 'draft', label: 'Drafts', count: articles.filter(a => a.status === 'draft').length },
    { id: 'approved', label: 'Approved', count: articles.filter(a => a.status === 'approved').length },
    { id: 'published', label: 'Published', count: articles.filter(a => a.status === 'published').length }
  ];

  return (
    <div id="view-article-library" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E2DD] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] tracking-tight flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#C48B57]" />
            <span>Article Library & Publishing Pipeline</span>
          </h2>
          <p className="text-xs text-[#6B665F] mt-1 font-sans">
            Short, question-based blog posts grounded in real research. Human approval strictly required before publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToQuestions}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-semibold border border-[#E5E2DD] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C48B57]" />
            <span>Draft from New Question</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1A1A1A] text-[#FDFCFB] shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#1A1A1A] hover:bg-[#F4F1EA]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-[#33302C] text-[#FDFCFB]' : 'bg-[#F4F1EA] text-[#8E8B82]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8E8B82] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#1A1A1A] placeholder-[#8E8B82] focus:outline-none focus:border-[#C48B57] w-full md:w-56 shadow-2xs"
          />
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3 shadow-2xs">
            <FileText className="w-8 h-8 text-[#8E8B82] mx-auto opacity-50" />
            <p className="text-sm font-serif font-medium text-[#1A1A1A]">No articles in this category</p>
            <p className="text-xs text-[#6B665F]">Pick a scored question from the Questions tab to generate your next post.</p>
            <button
              onClick={onNavigateToQuestions}
              className="px-3.5 py-1.5 rounded-md bg-[#C48B57] text-white text-xs font-semibold shadow-xs"
            >
              Explore Ranked Questions
            </button>
          </div>
        ) : (
          filteredArticles.map(art => {
            const isApproved = art.status === 'approved';
            const isPublished = art.status === 'published';
            const isNeedsApproval = art.status === 'needs_approval';

            return (
              <div
                key={art.id}
                className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] hover:border-[#D4A373] transition-all flex flex-col justify-between space-y-4 group shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
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

                    <div className="flex items-center gap-2 text-[11px] text-[#8E8B82]">
                      <span className="font-mono">{art.word_count} words</span>
                      <span>•</span>
                      <span>{art.source_ids.length} sources</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectArticle(art.id)}
                    className="text-base font-serif font-medium text-[#1A1A1A] group-hover:text-[#8F5722] transition-colors cursor-pointer leading-snug"
                  >
                    {art.headline}
                  </h3>

                  <p className="text-xs text-[#6B665F] line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[#E5E2DD] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#8E8B82]">
                    Updated {new Date(art.updated_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectArticle(art.id)}
                      className="px-3 py-1.5 rounded-md bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#1A1A1A] text-xs font-medium border border-[#E5E2DD] flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <FileEdit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {isNeedsApproval && (
                      <button
                        onClick={() => onApproveArticle(art.id)}
                        className="px-3 py-1.5 rounded-md bg-[#2D5A27] hover:bg-[#23471F] text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => onPublishArticle(art)}
                        className="px-3 py-1.5 rounded-md bg-[#C48B57] hover:bg-[#B37945] text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publish</span>
                      </button>
                    )}

                    {isPublished && art.published_url && (
                      <a
                        href={art.published_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-md bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#8F5722] text-xs font-medium border border-[#E5E2DD] flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
