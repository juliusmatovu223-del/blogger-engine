import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Eye, 
  Globe, 
  Layers, 
  Lock, 
  PenTool, 
  RotateCw, 
  Save, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  X 
} from 'lucide-react';
import { AppSettings, Article, Source, Topic } from '../types';

interface ArticleEditorProps {
  article: Article;
  sources: Source[];
  topic?: Topic;
  settings: AppSettings | null;
  onSave: (updated: Partial<Article>) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onRegenerate: (topicId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPublishClick: (article: Article) => void;
  onBack: () => void;
  isSaving: boolean;
  isRegenerating: boolean;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  sources,
  topic,
  settings,
  onSave,
  onApprove,
  onReject,
  onRegenerate,
  onDelete,
  onPublishClick,
  onBack,
  isSaving,
  isRegenerating
}) => {
  const [headline, setHeadline] = useState(article.headline);
  const [excerpt, setExcerpt] = useState(article.excerpt);
  const [body, setBody] = useState(article.body);
  const [seoTitle, setSeoTitle] = useState(article.seo_title || article.headline);
  const [metaDescription, setMetaDescription] = useState(article.meta_description || article.excerpt);
  const [category, setCategory] = useState(article.category || 'Digital Planning Advice');
  const [tagsInput, setTagsInput] = useState((article.tags || []).join(', '));
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showSeoDrawer, setShowSeoDrawer] = useState(false);
  const [showSourcesDrawer, setShowSourcesDrawer] = useState(true);

  const words = `${headline} ${body}`.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const isWordCountOptimal = words >= 300 && words <= 450;
  const isWordCountAcceptable = words >= 250 && words <= 500;

  const isApproved = article.status === 'approved';
  const isPublished = article.status === 'published';
  const isNeedsApproval = article.status === 'needs_approval';

  const handleQuickSave = async () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await onSave({
      headline,
      excerpt,
      body,
      seo_title: seoTitle,
      meta_description: metaDescription,
      category,
      tags
    });
  };

  const handleApproveAction = async () => {
    await handleQuickSave();
    await onApprove(article.id);
  };

  return (
    <div id="view-article-editor" className="space-y-6 pb-16">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2DD] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#6B665F] hover:text-[#1A1A1A] border border-[#E5E2DD] transition-colors shadow-2xs"
            title="Back to articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                isPublished
                  ? 'bg-[#FAF5FF] text-[#6D28D9] border border-[#E9D5FF]'
                  : isApproved
                  ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                  : isNeedsApproval
                  ? 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
                  : 'bg-[#F4F1EA] text-[#6B665F] border border-[#E5E2DD]'
              }`}>
                {article.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-[#8E8B82]">
                Last edited {new Date(article.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onRegenerate(article.topic_id)}
            disabled={isRegenerating || isPublished}
            className="px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-medium border border-[#E5E2DD] flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
            title="Regenerate with Gemini"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <button
            onClick={handleQuickSave}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-medium border border-[#E5E2DD] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Explicit Human Approval Gate */}
          {!isApproved && !isPublished && (
            <button
              id="btn-approve-article"
              onClick={handleApproveAction}
              className="px-4 py-1.5 rounded-md bg-[#2D5A27] hover:bg-[#23471F] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approve Article</span>
            </button>
          )}

          {isApproved && !isPublished && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#2D5A27] font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-[#F0FDF4] border border-[#BBF7D0]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
              <button
                id="btn-open-publish"
                onClick={() => onPublishClick(article)}
                className={`px-4 py-1.5 rounded-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
                  settings?.publishing_settings.integration_type === 'blogger'
                    ? 'bg-[#FF5722] hover:bg-[#E64A19]'
                    : 'bg-[#C48B57] hover:bg-[#B37945]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{settings?.publishing_settings.integration_type === 'blogger' ? 'Publish to Blogger' : 'Publish'}</span>
              </button>
            </div>
          )}

          {isPublished && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6D28D9] font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAF5FF] border border-[#E9D5FF]">
                <Globe className="w-3.5 h-3.5" /> Published
              </span>
              {article.published_url && (
                <a
                  href={article.published_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#8F5722] text-xs font-medium flex items-center gap-1 border border-[#E5E2DD] shadow-2xs"
                >
                  <span>View Live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Human Approval Warning Banner (If not yet approved) */}
      {!isApproved && !isPublished && (
        <div className="p-3.5 rounded-lg bg-[#FFFDF7] border border-[#F3DEB2] flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#975A16]">
            <Lock className="w-4 h-4 text-[#C48B57] shrink-0" />
            <span className="font-sans">
              <strong className="font-semibold">Editorial Rule:</strong> Publishing is locked until you review the text, inspect sources, and click <strong>Approve Article</strong>.
            </span>
          </div>
          <button
            onClick={handleApproveAction}
            className="px-3 py-1 rounded bg-[#FFF8E7] hover:bg-[#FDE68A] text-[#975A16] border border-[#F3DEB2] text-[11px] font-semibold transition-colors shrink-0"
          >
            Approve Now
          </button>
        </div>
      )}

      {/* Main Grid: Left Editor & Right Research Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Article Form & Markdown */}
        <div className="lg:col-span-8 space-y-4">
          {/* Headline Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#8E8B82] font-semibold">
              Article Headline (Derived from User Question)
            </label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#FFFFFF] border border-[#E5E2DD] text-xl sm:text-2xl font-serif font-medium text-[#1A1A1A] focus:outline-none focus:border-[#C48B57] transition-colors shadow-2xs"
              placeholder="e.g. Why You Keep Abandoning Your Digital Planner"
            />
          </div>

          {/* Excerpt Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#8E8B82] font-semibold">
              Short Excerpt / Problem Summary
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E2DD] text-xs text-[#6B665F] font-serif focus:outline-none focus:border-[#C48B57] transition-colors resize-none leading-relaxed shadow-2xs"
              placeholder="Brief 1-2 sentence lead explaining the core user challenge..."
            />
          </div>

          {/* Editor / Preview Toolbar */}
          <div className="flex items-center justify-between border-b border-[#E5E2DD] pt-2 pb-2">
            <div className="flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-md border border-[#E5E2DD]">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-[#1A1A1A] text-[#FDFCFB] shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#1A1A1A]'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Write (Markdown)</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-[#1A1A1A] text-[#FDFCFB] shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#1A1A1A]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Word Count Indicator */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8E8B82]" />
                <span className="text-[#6B665F]">{readingTime} min read</span>
              </div>

              <div className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                isWordCountOptimal
                  ? 'bg-[#F0FDF4] text-[#2D5A27] border border-[#BBF7D0]'
                  : isWordCountAcceptable
                  ? 'bg-[#F0F7FF] text-[#1E3A5F] border border-[#BAE6FD]'
                  : 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
              }`}>
                <span>{words} words</span>
                <span className="text-[10px] text-[#8E8B82] font-normal">
                  (Goal: 300–450w)
                </span>
              </div>
            </div>
          </div>

          {/* Body Editor vs Markdown Preview */}
          {activeTab === 'editor' ? (
            <textarea
              rows={16}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] text-[#1A1A1A] font-mono text-xs leading-relaxed focus:outline-none focus:border-[#C48B57] transition-colors shadow-2xs"
              placeholder="Write your article in clean markdown..."
            />
          ) : (
            <div className="p-8 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] min-h-[380px] prose prose-stone max-w-none text-[#1A1A1A] shadow-2xs">
              <h1 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-2">{headline}</h1>
              <p className="text-sm text-[#6B665F] italic mb-6 border-b border-[#E5E2DD] pb-4 font-serif">{excerpt}</p>
              <div className="space-y-4 text-sm leading-relaxed text-[#1A1A1A] font-serif">
                <Markdown>{body}</Markdown>
              </div>
            </div>
          )}

          {/* SEO & Meta Accordion */}
          <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] overflow-hidden shadow-2xs">
            <button
              onClick={() => setShowSeoDrawer(!showSeoDrawer)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors"
            >
              <span>SEO & Publishing Metadata (Optional)</span>
              <span className="text-[11px] text-[#8E8B82] font-normal">
                {showSeoDrawer ? 'Hide' : 'Configure'}
              </span>
            </button>

            {showSeoDrawer && (
              <div className="p-4 border-t border-[#E5E2DD] space-y-3 bg-[#FAF8F5] text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#8E8B82]">SEO Title Tag</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-[#1A1A1A] focus:outline-none focus:border-[#C48B57]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#8E8B82]">Meta Description</label>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-[#1A1A1A] focus:outline-none focus:border-[#C48B57] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#8E8B82]">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-[#1A1A1A] focus:outline-none focus:border-[#C48B57]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#8E8B82]">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E2DD] text-[#1A1A1A] focus:outline-none focus:border-[#C48B57]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Attached Research Sources & Question Context */}
        <div className="lg:col-span-4 space-y-4">
          {/* Question Context Card */}
          {topic && (
            <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#8F5722] font-semibold">
                  Original Research Opportunity
                </span>
                <span className="text-[11px] font-mono text-[#1A1A1A] font-semibold bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E5E2DD]">
                  Score: {topic.score}
                </span>
              </div>
              <h4 className="text-sm font-serif font-medium text-[#1A1A1A]">{topic.main_question}</h4>
              <p className="text-[11px] text-[#6B665F] leading-relaxed">{topic.user_problem}</p>
            </div>
          )}

          {/* Attached Verified Sources */}
          <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-medium text-[#1A1A1A] flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#6D28D9]" />
                <span>Grounding Sources ({sources.length})</span>
              </h4>
              <span className="text-[10px] text-[#8E8B82] font-mono">Real Web Citations</span>
            </div>

            <p className="text-[11px] text-[#6B665F]">
              This article was derived directly from these community discussions and evidence:
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {sources.map(src => (
                <div
                  key={src.id}
                  className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#8F5722] border border-[#E5E2DD]">
                      {src.domain}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6B665F] hover:text-[#1A1A1A] flex items-center gap-1 text-[10px] font-medium"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <h5 className="text-[11px] font-serif font-medium text-[#1A1A1A] line-clamp-2">{src.title}</h5>
                  <p className="text-[10px] text-[#6B665F] italic font-serif">"{src.evidence}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Delete Article */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this article?')) {
                  onDelete(article.id);
                }
              }}
              className="w-full py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#8E8B82] hover:text-[#991B1B] border border-[#E5E2DD] hover:border-[#FECACA] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
