import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Compass, Filter, HelpCircle, Loader2, Sparkles, TrendingUp, X } from 'lucide-react';
import { Source, Topic } from '../types';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSearching: boolean;
  discoveredSources: Source[];
  discoveredTopics: Topic[];
  onSelectTopicForArticle: (topicId: string) => void;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  isSearching,
  discoveredSources,
  discoveredTopics,
  onSelectTopicForArticle
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (isSearching) {
      setCurrentStep(1);
      const timer1 = setTimeout(() => setCurrentStep(2), 1600);
      const timer2 = setTimeout(() => setCurrentStep(3), 3200);
      const timer3 = setTimeout(() => setCurrentStep(4), 4800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setCurrentStep(4);
    }
  }, [isSearching]);

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'SEARCH', desc: 'Searching internet for digital planner conversations & struggles', icon: Compass },
    { num: 2, title: 'FILTER', desc: 'Filtering promotional fluff, spam, and unverified claims', icon: Filter },
    { num: 3, title: 'IDENTIFY', desc: 'Isolating genuine user questions, frustrations & friction', icon: HelpCircle },
    { num: 4, title: 'RANK', desc: 'Scoring opportunities by relevance, evidence & answerability', icon: TrendingUp }
  ];

  return (
    <div id="modal-research" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E5E2DD] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#FFF8E7] text-[#C48B57] flex items-center justify-center border border-[#F3DEB2]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[#1A1A1A]">Live Research Engine</h3>
              <p className="text-xs text-[#8E8B82]">Discovering what digital planner users are asking right now</p>
            </div>
          </div>
          {!isSearching && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#8E8B82] hover:text-[#1A1A1A] hover:bg-[#EAE6E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 4-Step Pipeline Visualizer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {steps.map(step => {
              const Icon = step.icon;
              const isPassed = !isSearching || currentStep > step.num;
              const isCurrent = isSearching && currentStep === step.num;

              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-[#FFFDF7] border-[#D4A373] text-[#8F5722] ring-1 ring-[#D4A373]'
                      : isPassed
                      ? 'bg-[#FAF8F5] border-[#E5E2DD] text-[#1A1A1A]'
                      : 'bg-[#FFFFFF] border-[#EAE6E1] text-[#8E8B82]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                      Step {step.num}
                    </span>
                    {isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C48B57]" />
                    ) : isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </div>
                  <div className="font-semibold text-xs text-[#1A1A1A]">{step.title}</div>
                  <p className="text-[10px] text-[#6B665F] line-clamp-2 mt-0.5 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {isSearching ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 bg-[#FAF8F5] border border-[#E5E2DD] rounded-lg">
              <Loader2 className="w-7 h-7 animate-spin text-[#C48B57]" />
              <div>
                <p className="text-sm font-serif font-medium text-[#1A1A1A]">
                  {currentStep === 1 && 'Querying Google Search Grounding for fresh planner threads...'}
                  {currentStep === 2 && 'Filtering out sponsored posts and generic store listings...'}
                  {currentStep === 3 && 'Analyzing user comments for recurring pain points...'}
                  {currentStep >= 4 && 'Calculating opportunity scores (relevance, evidence, answerability)...'}
                </p>
                <p className="text-xs text-[#8E8B82] mt-1 font-mono">
                  Grounding: r/digitalplanning · r/GoodNotes · r/ipad · Productivity Blogs
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-medium uppercase tracking-wider text-[#6B665F]">
                  Discovered Opportunities ({discoveredTopics.length})
                </span>
                <span className="text-xs text-[#2D5A27] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Editorial Selection
                </span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {discoveredTopics.map(topic => (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] hover:border-[#D4A373] transition-all flex items-start justify-between gap-3 group shadow-2xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          topic.score >= 85
                            ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                            : 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
                        }`}>
                          Score: {topic.score}
                        </span>
                        <h4 className="text-xs font-serif font-medium text-[#1A1A1A] group-hover:text-[#8F5722] transition-colors">
                          {topic.main_question}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#6B665F] line-clamp-2">
                        {topic.user_problem}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#8E8B82] pt-1">
                        <span>{topic.source_ids.length} verified source{topic.source_ids.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>Freshness: {topic.score_breakdown.freshness}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectTopicForArticle(topic.id);
                      }}
                      className="shrink-0 px-3 py-1.5 rounded bg-[#F4F1EA] hover:bg-[#C48B57] text-[#1A1A1A] hover:text-white text-xs font-medium border border-[#E5E2DD] transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>Draft</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E2DD] bg-[#FAF8F5] flex items-center justify-between text-xs text-[#6B665F]">
          <span>Target article length: 300–450 words answering 1–2 questions</span>
          {!isSearching && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#1A1A1A] hover:bg-[#2C2825] text-[#FDFCFB] transition-colors font-medium text-xs shadow-2xs"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
