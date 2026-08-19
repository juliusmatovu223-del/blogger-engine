import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  AlertCircle, 
  Check, 
  CheckCircle2, 
  Code, 
  Copy, 
  ExternalLink, 
  Globe, 
  Loader2, 
  Send, 
  Sparkles, 
  Tag, 
  X 
} from 'lucide-react';
import { api } from '../services/api';
import { AppSettings, Article } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  settings: AppSettings | null;
  onConfirmPublish: () => Promise<void>;
  isPublishing: boolean;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  article,
  settings,
  onConfirmPublish,
  isPublishing
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'html'>('overview');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoadingHtml, setIsLoadingHtml] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const pubConfig = settings?.publishing_settings;
  const isBlogger = pubConfig?.integration_type === 'blogger';
  const isConnected = pubConfig?.is_connected;
  const bloggerCfg = pubConfig?.blogger;

  useEffect(() => {
    if (isOpen && article && isBlogger) {
      setIsLoadingHtml(true);
      api.getBloggerPreviewHtml(article.id)
        .then(res => setPreviewHtml(res.html))
        .catch(() => setPreviewHtml(''))
        .finally(() => setIsLoadingHtml(false));
    }
  }, [isOpen, article, isBlogger]);

  if (!isOpen || !article) return null;

  const handlePublish = async () => {
    setErrorMsg(null);
    try {
      await onConfirmPublish();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || 'Publishing failed');
    }
  };

  const handleCopyHtml = () => {
    if (!previewHtml) return;
    navigator.clipboard.writeText(previewHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyAndOpenComposer = async () => {
    let htmlToCopy = previewHtml;
    if (!htmlToCopy && article) {
      try {
        const res = await api.getBloggerPreviewHtml(article.id);
        htmlToCopy = res.html;
      } catch {}
    }
    
    if (htmlToCopy) {
      await navigator.clipboard.writeText(htmlToCopy);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 3000);
    }
    
    const blogId = bloggerCfg?.blog_id || '3059669200982935387';
    const composerUrl = blogId && blogId !== 'test-blog-id' 
      ? `https://www.blogger.com/blog/post/edit/${blogId}` 
      : 'https://www.blogger.com/blog/posts';
    window.open(composerUrl, '_blank');
  };

  return (
    <div id="modal-publish" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E5E2DD] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            {isBlogger ? (
              <div className="w-7 h-7 rounded bg-[#FF5722] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                B
              </div>
            ) : (
              <div className="w-7 h-7 rounded bg-[#F0FDF4] text-[#2D5A27] flex items-center justify-center border border-[#BBF7D0]">
                <Globe className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-base font-serif font-medium text-[#1A1A1A]">
                {isBlogger ? 'Publish to Google Blogger' : 'Publish Approved Article'}
              </h3>
              <p className="text-xs text-[#8E8B82]">
                {isBlogger ? 'Google Blogger REST API v3 Integration' : 'One-click push to your connected CMS / Webhook'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8E8B82] hover:text-[#1A1A1A] hover:bg-[#EAE6E1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs for Overview vs Blogger HTML */}
        {isBlogger && (
          <div className="flex border-b border-[#E5E2DD] bg-[#FAF8F5] px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#C48B57] text-[#1A1A1A] font-semibold'
                  : 'border-transparent text-[#6B665F] hover:text-[#1A1A1A]'
              }`}
            >
              Post Details & Destination
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'html'
                  ? 'border-[#C48B57] text-[#1A1A1A] font-semibold'
                  : 'border-transparent text-[#6B665F] hover:text-[#1A1A1A]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Blogger HTML Payload</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {activeTab === 'overview' ? (
            <>
              {/* Article Summary Box */}
              <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono uppercase text-[#8E8B82] tracking-wider font-semibold">
                  Approved & Ready to Push
                </div>
                <h4 className="text-sm font-serif font-medium text-[#1A1A1A] leading-snug">
                  {article.headline}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-[#6B665F] pt-1">
                  <span className="font-mono">{article.word_count} words</span>
                  <span>•</span>
                  <span>{article.reading_time_min} min read</span>
                  <span>•</span>
                  <span className="text-[#2D5A27] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Approved by Owner
                  </span>
                </div>
              </div>

              {/* Destination Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B665F]">Blogger Destination:</span>
                  <span className="font-medium text-[#1A1A1A] flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#2D5A27]' : 'bg-[#991B1B]'}`} />
                    {isBlogger ? (bloggerCfg?.blog_name || 'Planner Pulse Blogspot') : pubConfig?.platform_name}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#FAF8F5] text-[11px] font-mono text-[#6B665F] border border-[#E5E2DD] truncate">
                  {isBlogger ? (bloggerCfg?.blog_url || 'https://plannerpulse.blogspot.com') : pubConfig?.api_endpoint}
                </div>
              </div>

              {/* Blogger Labels / Tags preview */}
              {article.tags && article.tags.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#8E8B82]">Blogger Labels:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[#FAF8F5] text-[#6B665F] border border-[#E5E2DD] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-[#C48B57]" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {article.published_url && (
                <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                  <div className="text-xs font-medium text-[#2D5A27] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Live on Google Blogger!
                  </div>
                  <a
                    href={article.published_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#C48B57] hover:underline flex items-center gap-1 font-mono break-all"
                  >
                    <span>{article.published_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href="https://www.blogger.com/blog/posts"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#1A1A1A] text-[11px] font-medium border border-[#E5E2DD] flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-[#FF5722]" />
                      <span>Open in Blogger Dashboard</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A1A1A]">Clean Blogger-Compatible HTML</span>
                <button
                  onClick={handleCopyHtml}
                  className="px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs text-[#1A1A1A] font-medium border border-[#E5E2DD] flex items-center gap-1 transition-colors shadow-2xs"
                >
                  {copiedHtml ? <Check className="w-3 h-3 text-[#2D5A27]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHtml ? 'Copied HTML!' : 'Copy HTML'}</span>
                </button>
              </div>

              {isLoadingHtml ? (
                <div className="py-8 text-center text-xs text-[#8E8B82] font-mono">
                  Formatting semantic Blogger HTML...
                </div>
              ) : (
                <textarea
                  readOnly
                  rows={10}
                  value={previewHtml}
                  className="w-full p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] text-[11px] font-mono text-[#374151] leading-relaxed resize-none focus:outline-none"
                />
              )}
              <p className="text-[11px] text-[#8E8B82]">
                Includes structured headings, body paragraphs, and grounded research citations formatted for Blogger templates.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E2DD] bg-[#FAF8F5] flex items-center justify-between gap-2.5">
          <a
            href="https://www.blogger.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-[#8E8B82] hover:text-[#C48B57] flex items-center gap-1 font-medium"
          >
            <span>Blogger.com</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#6B665F] text-xs font-medium border border-[#E5E2DD] transition-colors shadow-2xs"
            >
              Close
            </button>
            {isBlogger && (
              <button
                type="button"
                onClick={handleCopyAndOpenComposer}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#FF5722] border border-[#FFCCBC] shadow-2xs transition-all"
                title="Copies formatted post HTML to clipboard and opens your Blogger Post Composer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>{copiedHtml ? 'Copied HTML! Opening...' : 'Open in Blogger Composer'}</span>
              </button>
            )}
            <button
              id="btn-confirm-publish"
              onClick={handlePublish}
              disabled={isPublishing || !isConnected}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-all ${
                isPublishing
                  ? 'bg-[#E5E2DD] text-[#8E8B82] cursor-not-allowed'
                  : 'bg-[#FF5722] hover:bg-[#E64A19] text-white'
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing to Blogger...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish via API</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
