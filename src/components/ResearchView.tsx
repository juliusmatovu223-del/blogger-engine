import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Compass, 
  ExternalLink, 
  Filter, 
  HelpCircle, 
  Plus, 
  Search, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  X 
} from 'lucide-react';
import { ResearchRun, Source, Topic } from '../types';

interface ResearchViewProps {
  runs: ResearchRun[];
  sources: Source[];
  topics: Topic[];
  keywords: string[];
  onTriggerSearch: () => void;
  isSearching: boolean;
  onUpdateKeywords: (newKeywords: string[]) => void;
  onSelectTopic: (topicId: string) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  runs,
  sources,
  topics,
  keywords,
  onTriggerSearch,
  isSearching,
  onUpdateKeywords,
  onSelectTopic
}) => {
  const [sourceSearch, setSourceSearch] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const domains = Array.from(new Set(sources.map(s => s.domain)));

  const filteredSources = sources.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      s.summary.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      s.evidence.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      s.domain.toLowerCase().includes(sourceSearch.toLowerCase());

    const matchesDomain = selectedDomain === 'all' || s.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    if (!keywords.includes(newKeywordInput.trim())) {
      onUpdateKeywords([...keywords, newKeywordInput.trim()]);
    }
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    onUpdateKeywords(keywords.filter(k => k !== kw));
  };

  return (
    <div id="view-research" className="space-y-8 pb-12">
      {/* Header with trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E2DD] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] tracking-tight flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#C48B57]" />
            <span>Research & Source Discovery Engine</span>
          </h2>
          <p className="text-xs text-[#6B665F] mt-1 font-sans">
            Grounded search crawling public Reddit forums, note-taking communities, and productivity websites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerSearch}
            disabled={isSearching}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              isSearching
                ? 'bg-[#E5E2DD] text-[#8E8B82] cursor-not-allowed animate-pulse'
                : 'bg-[#C48B57] hover:bg-[#B37945] text-white'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Running Grounded Search...' : 'Search Today'}</span>
          </button>
        </div>
      </div>

      {/* Active Search Keywords */}
      <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C48B57]" />
            <h3 className="text-sm font-serif font-medium text-[#1A1A1A]">Target Search Queries & Topics</h3>
          </div>
          <span className="text-[11px] text-[#8E8B82] font-mono">{keywords.length} active topics</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {keywords.map(kw => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#F4F1EA] text-[#1A1A1A] border border-[#E5E2DD] hover:border-[#D4A373] transition-colors"
            >
              <span>{kw}</span>
              <button
                onClick={() => handleRemoveKeyword(kw)}
                className="text-[#8E8B82] hover:text-[#991B1B]"
                title="Remove keyword"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddKeyword} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add search topic (e.g. 'GoodNotes handwriting lag', 'planner task rollover')..."
            value={newKeywordInput}
            onChange={e => setNewKeywordInput(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-xs text-[#1A1A1A] placeholder-[#8E8B82] focus:outline-none focus:border-[#C48B57] transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-[#1A1A1A] hover:bg-[#2C2825] text-[#FDFCFB] text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </form>
      </div>

      {/* Research Runs History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1E3A5F]" />
            <span>Research Run Logs</span>
          </h3>
          <span className="text-xs text-[#8E8B82] font-sans">{runs.length} runs recorded</span>
        </div>

        <div className="space-y-3">
          {runs.map(run => (
            <div
              key={run.id}
              className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D5A27]" />
                  <span className="text-xs font-serif font-medium text-[#1A1A1A]">
                    {new Date(run.started_at).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1EA] text-[#6B665F] border border-[#E5E2DD]">
                    {run.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#6B665F]">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-[#8E8B82]" /> {run.sources_found} Sources
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#8E8B82]" /> {run.questions_found} Questions
                  </span>
                  <span className="flex items-center gap-1 text-[#2D5A27] font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> {run.opportunities_found} Opportunities
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#1A1A1A] bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E5E2DD] leading-relaxed font-sans">
                {run.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {run.keywords_used.slice(0, 5).map((k, idx) => (
                  <span key={idx} className="text-[10px] text-[#6B665F] bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E5E2DD]">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discovered Real Sources Explorer */}
      <div className="space-y-4 pt-4 border-t border-[#E5E2DD]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#6D28D9]" />
              <span>Real Discovered Sources ({sources.length})</span>
            </h3>
            <p className="text-xs text-[#8E8B82] mt-0.5">
              Verified community discussions and blog reviews powering our question extraction
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8B82] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search sources & evidence..."
                value={sourceSearch}
                onChange={e => setSourceSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#1A1A1A] placeholder-[#8E8B82] focus:outline-none focus:border-[#C48B57] w-56 shadow-2xs"
              />
            </div>

            {/* Filter Domain */}
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C48B57] shadow-2xs"
            >
              <option value="all">All Domains</option>
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map(src => (
            <div
              key={src.id}
              className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] hover:border-[#D4A373] transition-all flex flex-col justify-between space-y-3 shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F4F1EA] text-[#8F5722] border border-[#E5E2DD]">
                    {src.domain}
                  </span>
                  <span className="text-[10px] text-[#8E8B82]">
                    {new Date(src.discovered_at).toLocaleDateString()}
                  </span>
                </div>

                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-serif font-medium text-[#1A1A1A] hover:text-[#8F5722] transition-colors flex items-start gap-1.5 group"
                >
                  <span className="line-clamp-2">{src.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 mt-0.5" />
                </a>

                <p className="text-xs text-[#6B665F] line-clamp-3 leading-relaxed">
                  {src.summary}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] text-[11px] text-[#1A1A1A] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8E8B82] block font-semibold">User Struggle / Evidence:</span>
                <p className="italic font-serif">"{src.evidence}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
