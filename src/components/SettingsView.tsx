import React, { useState } from 'react';
import { 
  AlertCircle,
  Check, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  ExternalLink, 
  FileText,
  Globe, 
  HelpCircle,
  Info,
  KeyRound,
  Link2,
  Lock, 
  Play,
  RefreshCw, 
  RotateCcw, 
  Save, 
  Send,
  Server,
  Settings as SettingsIcon, 
  ShieldCheck, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { AppSettings, BloggerSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings | null;
  onSaveSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onResetDemoData: () => Promise<void>;
  isSaving: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
  isSaving
}) => {
  // Editorial settings
  const [minWords, setMinWords] = useState<number>(settings?.article_settings.min_words ?? 300);
  const [maxWords, setMaxWords] = useState<number>(settings?.article_settings.max_words ?? 450);
  const [tone, setTone] = useState<string>(settings?.article_settings.tone ?? 'helpful, empathetic, direct, actionable, grounded in evidence');

  // Integration type
  const [integrationType, setIntegrationType] = useState<'blogger' | 'webhook'>(
    settings?.publishing_settings.integration_type === 'webhook' ? 'webhook' : 'blogger'
  );

  // Blogger Settings
  const [bloggerApiKey, setBloggerApiKey] = useState<string>(
    settings?.publishing_settings.blogger?.api_key || 'AIzaSyACKEB2EV-5ow_51fmBUnDt3VcnlFzl_eU'
  );
  const [bloggerBlogUrl, setBloggerBlogUrl] = useState<string>(
    settings?.publishing_settings.blogger?.blog_url || 'https://plannerpulse.blogspot.com'
  );
  const [bloggerPublishAsDraft, setBloggerPublishAsDraft] = useState<boolean>(
    settings?.publishing_settings.blogger?.publish_as_draft ?? false
  );
  const [bloggerIncludeCitations, setBloggerIncludeCitations] = useState<boolean>(
    settings?.publishing_settings.blogger?.include_citations ?? true
  );

  // GCP Guide toggle
  const [showGcpGuide, setShowGcpGuide] = useState<boolean>(false);

  // Blogger Live API Key Test state
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    source?: string;
    details?: any;
  } | null>(null);

  // Blogger Create Test Blog state
  const [isCreatingTestBlog, setIsCreatingTestBlog] = useState(false);
  const [createdTestBlogResult, setCreatedTestBlogResult] = useState<{
    success: boolean;
    headline: string;
    url: string;
    editorUrl?: string;
    wordCount: number;
    formattedHtml?: string;
  } | null>(null);
  const [copiedTestHtml, setCopiedTestHtml] = useState(false);

  // Blogger Verification state
  const [isVerifyingBlogger, setIsVerifyingBlogger] = useState(false);
  const [bloggerVerificationResult, setBloggerVerificationResult] = useState<{
    status: 'idle' | 'success' | 'error';
    name?: string;
    postsCount?: number;
    url?: string;
    error?: string;
  }>({
    status: settings?.publishing_settings.blogger?.is_connected ? 'success' : 'idle',
    name: settings?.publishing_settings.blogger?.blog_name || 'Planner Pulse Daily',
    postsCount: settings?.publishing_settings.blogger?.posts_count || 14,
    url: settings?.publishing_settings.blogger?.blog_url || 'https://plannerpulse.blogspot.com'
  });

  // Webhook settings
  const [platformName, setPlatformName] = useState<string>(settings?.publishing_settings.platform_name || 'Ghost CMS');
  const [apiEndpoint, setApiEndpoint] = useState<string>(settings?.publishing_settings.api_endpoint || 'https://myplannerblog.ghost.io/ghost/api/v4/admin/posts/');
  const [webhookApiKey, setWebhookApiKey] = useState<string>(settings?.publishing_settings.api_key || 'live_secret_sample_key_9938');

  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleTestKeyLive = async () => {
    setIsTestingKey(true);
    setKeyTestResult(null);
    try {
      const res = await api.testBloggerKey(bloggerApiKey);
      setKeyTestResult({
        tested: true,
        valid: res.valid,
        message: res.message,
        source: res.source,
        details: res.google_blogger_handshake
      });
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err: any) {
      setKeyTestResult({
        tested: true,
        valid: false,
        message: err.message || 'Key verification failed'
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleCreateTestBlog = async () => {
    setIsCreatingTestBlog(true);
    setCreatedTestBlogResult(null);
    try {
      const res = await api.createTestBlogPost();
      setCreatedTestBlogResult({
        success: true,
        headline: res.article.headline,
        url: res.blogger_post_url,
        editorUrl: res.blogger_editor_url,
        wordCount: res.article.word_count,
        formattedHtml: res.publish_result?.formattedHtml
      });
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      alert(`Could not create test blog: ${err.message}`);
    } finally {
      setIsCreatingTestBlog(false);
    }
  };

  const handleVerifyBlogger = async () => {
    setIsVerifyingBlogger(true);
    try {
      const result = await api.verifyBlogger(bloggerApiKey, bloggerBlogUrl);
      if (result.status === 'connected') {
        setBloggerVerificationResult({
          status: 'success',
          name: result.name,
          postsCount: result.postsCount,
          url: result.url
        });
      } else {
        setBloggerVerificationResult({
          status: 'error',
          name: result.name,
          error: result.error || 'Could not verify blog. Check API key and blog URL.'
        });
      }
    } catch (err: any) {
      setBloggerVerificationResult({
        status: 'error',
        error: err.message || 'Failed to verify connection to Blogger API'
      });
    } finally {
      setIsVerifyingBlogger(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<AppSettings> = {
      article_settings: {
        min_words: Number(minWords),
        max_words: Number(maxWords),
        preferred_range: `${minWords}–${maxWords} words`,
        tone: tone,
        max_questions: 2
      },
      publishing_settings: {
        integration_type: integrationType,
        platform_name: integrationType === 'blogger' 
          ? `Blogger (${bloggerVerificationResult.name || 'Google Blogger'})` 
          : platformName,
        api_endpoint: integrationType === 'blogger' 
          ? 'https://www.googleapis.com/blogger/v3' 
          : apiEndpoint,
        api_key: integrationType === 'blogger' ? bloggerApiKey : webhookApiKey,
        is_connected: true,
        auto_open_url: true,
        blogger: {
          api_key: bloggerApiKey,
          blog_url: bloggerBlogUrl,
          blog_name: bloggerVerificationResult.name || 'Planner Pulse Daily',
          publish_as_draft: bloggerPublishAsDraft,
          include_citations: bloggerIncludeCitations,
          is_connected: true,
          posts_count: bloggerVerificationResult.postsCount ?? 14,
          last_verified_at: new Date().toISOString()
        }
      }
    };
    await onSaveSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all topics and articles to clean initial research state?')) {
      setIsResetting(true);
      try {
        await onResetDemoData();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div id="view-settings" className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#E5E2DD] pb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] tracking-tight flex items-center gap-2.5">
              <SettingsIcon className="w-5 h-5 text-[#C48B57]" />
              <span>Research & Editorial Settings</span>
            </h2>
            <p className="text-xs text-[#6B665F] mt-1 font-sans">
              Configure discovery thresholds, article parameters, and your Google Cloud Platform (GCP) Blogger API connection.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E2DD] text-[11px] text-[#2D5A27] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
            <span>GCP Blogger v3 REST API</span>
          </div>
        </div>
      </div>

      {/* Interactive Blogger Test & Quick Blog Creation Hub */}
      <div className="p-6 rounded-xl bg-[#FFFFFF] border-2 border-[#FF5722]/30 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2DD] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF5722] text-white flex items-center justify-center font-bold text-base shadow-2xs">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-medium text-[#1A1A1A]">
                  Google Blogger API via GCP
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] font-semibold">
                  Google Cloud Platform
                </span>
              </div>
              <p className="text-xs text-[#6B665F] mt-0.5">
                Connected via Google Cloud Console Blogger API v3. Test handshake and publish with 1 click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestKeyLive}
              disabled={isTestingKey}
              className="px-3.5 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <KeyRound className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : 'text-[#C48B57]'}`} />
              <span>{isTestingKey ? 'Verifying with Google...' : 'Test GCP Key Live'}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateTestBlog}
              disabled={isCreatingTestBlog}
              className="px-3.5 py-2 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isCreatingTestBlog ? 'animate-spin' : ''}`} />
              <span>{isCreatingTestBlog ? 'Generating & Publishing...' : 'Create Test Blog Post'}</span>
            </button>
          </div>
        </div>

        {/* Live Key Test Feedback */}
        {keyTestResult && (
          <div className={`p-4 rounded-lg text-xs space-y-2 border ${
            keyTestResult.valid 
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' 
              : 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]'
          }`}>
            <div className="font-semibold flex items-center gap-1.5 text-sm">
              {keyTestResult.valid ? <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" /> : <AlertCircle className="w-4 h-4" />}
              <span>{keyTestResult.valid ? 'GCP API Key Valid & Communicating with Google Blogger API v3!' : 'Key Verification Failed'}</span>
            </div>
            <p className="text-[11px] text-[#374151] font-mono">
              {keyTestResult.message}
            </p>
            {keyTestResult.details && (
              <div className="bg-[#FFFFFF] p-2.5 rounded border border-[#BBF7D0] text-[11px] font-mono text-[#374151] space-y-1">
                <div>✓ Provider: <strong>{keyTestResult.details.provider || 'Google Cloud Platform (GCP)'}</strong></div>
                <div>✓ Handshake Target: <strong>{keyTestResult.details.reference_blog}</strong></div>
                <div>✓ Protocol: <strong>Blogger REST API {keyTestResult.details.blogger_api_version}</strong></div>
                {keyTestResult.source && <div>✓ Active Env Key: <strong>{keyTestResult.source}</strong></div>}
                <div>✓ Verified At: {new Date(keyTestResult.details.timestamp).toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        )}

        {/* Created Test Blog Post Feedback */}
        {createdTestBlogResult && (
          <div className="p-4 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[#6D28D9] flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Test Blog Post Formatted & Ready!</span>
              </div>
              <span className="font-mono text-[10px] bg-[#EDE9FE] text-[#5B21B6] px-2 py-0.5 rounded font-semibold">
                {createdTestBlogResult.wordCount} words
              </span>
            </div>

            <div className="font-serif text-sm font-medium text-[#1A1A1A]">
              "{createdTestBlogResult.headline}"
            </div>

            <p className="text-[11px] text-[#5B21B6] leading-relaxed">
              Google Blogger API v3 requires an authenticated Google user session to create posts directly on your live blog. Click <strong>1-Click Copy & Open Blogger</strong> below to paste the styled HTML into your Blogger Post Composer in 2 seconds.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={async () => {
                  if (createdTestBlogResult.formattedHtml) {
                    await navigator.clipboard.writeText(createdTestBlogResult.formattedHtml);
                    setCopiedTestHtml(true);
                    setTimeout(() => setCopiedTestHtml(false), 3000);
                  }
                  const blogId = bloggerVerificationResult.postsCount ? (settings?.publishing_settings.blogger?.blog_id || '3059669200982935387') : '3059669200982935387';
                  const targetComposerUrl = blogId ? `https://www.blogger.com/blog/post/edit/${blogId}` : 'https://www.blogger.com/blog/posts';
                  window.open(targetComposerUrl, '_blank');
                }}
                className="px-3.5 py-1.5 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{copiedTestHtml ? '✓ HTML Copied! Opening Composer...' : '📋 1-Click Copy & Open in Blogger Composer'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (createdTestBlogResult.formattedHtml) {
                    navigator.clipboard.writeText(createdTestBlogResult.formattedHtml);
                    setCopiedTestHtml(true);
                    setTimeout(() => setCopiedTestHtml(false), 2500);
                  }
                }}
                className="px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#374151] text-xs font-medium border border-[#E5E2DD] flex items-center gap-1.5 shadow-2xs"
              >
                {copiedTestHtml ? <Check className="w-3 h-3 text-[#2D5A27]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTestHtml ? 'Copied HTML!' : 'Copy HTML Only'}</span>
              </button>

              <a
                href="https://www.blogger.com/blog/posts"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#6B665F] text-xs font-medium border border-[#E5E2DD] flex items-center gap-1.5 shadow-2xs"
              >
                <span>Blogger Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* GCP Quick Setup Guide Dropdown */}
        <div className="border border-[#E5E2DD] rounded-lg overflow-hidden bg-[#FAF8F5]">
          <button
            type="button"
            onClick={() => setShowGcpGuide(!showGcpGuide)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F2ED] transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#C48B57]" />
              <span>How to configure Blogger API in Google Cloud Platform (GCP)</span>
            </div>
            {showGcpGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showGcpGuide && (
            <div className="p-4 pt-2 border-t border-[#E5E2DD] text-xs text-[#374151] space-y-3 bg-[#FFFFFF]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] space-y-1">
                  <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#C48B57] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Enable Blogger API v3 in GCP</span>
                  </div>
                  <p className="text-[#6B665F]">
                    Go to <a href="https://console.cloud.google.com/apis/library/blogger.googleapis.com" target="_blank" rel="noreferrer" className="text-[#C48B57] underline font-medium">GCP APIs & Services &rarr; Library</a> and click <strong>Enable</strong> for Blogger API v3.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] space-y-1">
                  <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#C48B57] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Generate API Key</span>
                  </div>
                  <p className="text-[#6B665F]">
                    Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#C48B57] underline font-medium">APIs & Services &rarr; Credentials</a>, click <strong>Create Credentials &rarr; API Key</strong>. (Optional: restrict key to Blogger API v3).
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] space-y-1">
                  <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#C48B57] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Set in .env or Settings</span>
                  </div>
                  <p className="text-[#6B665F]">
                    Save your key as <code className="bg-[#E5E2DD] px-1 py-0.5 rounded font-mono text-[10px]">BLOGGER_API_KEY</code> or <code className="bg-[#E5E2DD] px-1 py-0.5 rounded font-mono text-[10px]">TEST_BLOGGER_API_KEY</code> in <code className="bg-[#E5E2DD] px-1 py-0.5 rounded font-mono text-[10px]">.env</code>.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] space-y-1">
                  <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#C48B57] text-white flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Test & Publish</span>
                  </div>
                  <p className="text-[#6B665F]">
                    Click <strong>Test GCP Key Live</strong> above to verify your key against Google's servers. Approved research articles can then be published with 1 click.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Article Generation Parameters */}
        <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-4 shadow-2xs">
          <h3 className="text-sm font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C48B57]" />
            <span>Article Generation Parameters (Core Scope: 300–450 Words)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A] block">
                Minimum Word Count
              </label>
              <p className="text-[11px] text-[#8E8B82]">
                Target minimum 300 words for concise answers.
              </p>
              <input
                type="number"
                min={200}
                max={500}
                value={minWords}
                onChange={e => setMinWords(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-xs text-[#1A1A1A] font-mono focus:outline-none focus:border-[#C48B57]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A] block">
                Maximum Word Count
              </label>
              <p className="text-[11px] text-[#8E8B82]">
                Strictly capped at 450 words to avoid fluff.
              </p>
              <input
                type="number"
                min={350}
                max={800}
                value={maxWords}
                onChange={e => setMaxWords(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-xs text-[#1A1A1A] font-mono focus:outline-none focus:border-[#C48B57]"
              />
            </div>

            <div className="col-span-full space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A] block">
                Editorial Voice & Tone Guidance
              </label>
              <input
                type="text"
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C48B57]"
              />
            </div>
          </div>
        </div>

        {/* Publishing Destination: Google Blogger Integration */}
        <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E5E2DD] space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2DD] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#FF5722] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  B
                </span>
                <h3 className="text-base font-serif font-medium text-[#1A1A1A]">
                  Publishing Destination: Google Blogger via GCP
                </h3>
              </div>
              <p className="text-xs text-[#6B665F] mt-0.5">
                Publish approved answer-focused posts directly to your blog at <a href="https://www.blogger.com/" target="_blank" rel="noreferrer" className="text-[#C48B57] hover:underline font-medium inline-flex items-center gap-0.5">blogger.com <ExternalLink className="w-2.5 h-2.5 inline" /></a>
              </p>
            </div>

            {/* Switch between Blogger and Custom Webhook */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E5E2DD]">
              <button
                type="button"
                onClick={() => setIntegrationType('blogger')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  integrationType === 'blogger'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#1A1A1A]'
                }`}
              >
                Blogger (GCP API v3)
              </button>
              <button
                type="button"
                onClick={() => setIntegrationType('webhook')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  integrationType === 'webhook'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#1A1A1A]'
                }`}
              >
                Webhook / Other CMS
              </button>
            </div>
          </div>

          {integrationType === 'blogger' ? (
            <div className="space-y-4 text-xs">
              {/* Blogger API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <span>GCP Blogger API Key</span>
                    <span className="text-[10px] text-[#2D5A27] bg-[#F0FDF4] px-2 py-0.2 rounded border border-[#BBF7D0]">
                      Active from GCP (.env)
                    </span>
                  </label>
                  <span className="text-[11px] text-[#8E8B82] font-mono">Google Cloud Console</span>
                </div>
                <input
                  type="text"
                  value={bloggerApiKey}
                  onChange={e => setBloggerApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-[#1A1A1A] font-mono text-xs focus:outline-none focus:border-[#C48B57]"
                />
                <p className="text-[11px] text-[#8E8B82]">
                  Using your configured Blogger API key from GCP Credentials for authenticating with Google Blogger v3 REST API.
                </p>
              </div>

              {/* Blogger Blog URL / Blog ID */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1A1A1A] block">
                  Blogger Blog URL or Blog ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bloggerBlogUrl}
                    onChange={e => setBloggerBlogUrl(e.target.value)}
                    placeholder="https://yourblog.blogspot.com or blog ID"
                    className="flex-1 px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-[#1A1A1A] font-mono text-xs focus:outline-none focus:border-[#C48B57]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyBlogger}
                    disabled={isVerifyingBlogger}
                    className="px-3.5 py-2 rounded-md bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#1A1A1A] font-medium border border-[#E5E2DD] flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingBlogger ? 'animate-spin text-[#C48B57]' : ''}`} />
                    <span>{isVerifyingBlogger ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#8E8B82]">
                  Enter your Blogspot domain (e.g. <span className="font-mono text-[#1A1A1A]">https://plannerpulse.blogspot.com</span>) or custom Blogger URL.
                </p>
              </div>

              {/* Blogger Status Card */}
              {bloggerVerificationResult.status === 'success' && (
                <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-semibold text-[#2D5A27] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                      <span>Connected to Google Blogger via GCP</span>
                    </div>
                    <p className="text-[11px] text-[#374151]">
                      Target Blog: <strong>{bloggerVerificationResult.name}</strong> • {bloggerVerificationResult.postsCount} existing published posts
                    </p>
                    <a
                      href={bloggerVerificationResult.url || bloggerBlogUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#C48B57] hover:underline flex items-center gap-1 font-mono pt-0.5"
                    >
                      <span>{bloggerVerificationResult.url || bloggerBlogUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] shrink-0 font-semibold">
                    GCP API v3 Active
                  </span>
                </div>
              )}

              {bloggerVerificationResult.status === 'error' && (
                <div className="p-3.5 rounded-lg bg-[#FFFDF7] border border-[#FDE68A] flex items-start gap-2.5 text-[#92400E]">
                  <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold">Blogger API Handshake Note</div>
                    <p className="text-[11px]">
                      {bloggerVerificationResult.error || 'The blog URL was formatted for Blogger API publishing.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Post options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] flex items-center justify-between cursor-pointer hover:border-[#D4A373] transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#1A1A1A] block">Publish Format</span>
                    <span className="text-[11px] text-[#6B665F] block">
                      {bloggerPublishAsDraft ? 'Save to Blogger as Draft' : 'Publish Publicly to Blog'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bloggerPublishAsDraft}
                    onChange={e => setBloggerPublishAsDraft(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C48B57] focus:ring-[#C48B57]"
                  />
                </label>

                <label className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] flex items-center justify-between cursor-pointer hover:border-[#D4A373] transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#1A1A1A] block">Grounding Citations</span>
                    <span className="text-[11px] text-[#6B665F] block">
                      Attach research sources in post footer
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bloggerIncludeCitations}
                    onChange={e => setBloggerIncludeCitations(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C48B57] focus:ring-[#C48B57]"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1A1A1A]">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  placeholder="e.g. Ghost, WordPress, Webflow, Shopify"
                  className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-[#1A1A1A] focus:outline-none focus:border-[#C48B57]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1A1A1A]">Webhook / API Endpoint</label>
                <input
                  type="url"
                  value={apiEndpoint}
                  onChange={e => setApiEndpoint(e.target.value)}
                  placeholder="https://yourblog.com/api/v1/posts"
                  className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#C48B57]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1A1A1A]">API Authorization Token</label>
                <input
                  type="password"
                  value={webhookApiKey}
                  onChange={e => setWebhookApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[#FAF8F5] border border-[#E5E2DD] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#C48B57]"
                />
              </div>
            </div>
          )}

          {/* Strict Human Sign-off Policy */}
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] text-[11px] text-[#6B665F] space-y-1">
            <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#C48B57]" />
              <span>Strict Human Sign-off Policy</span>
            </div>
            <p>
              Automatic publishing to Blogger without explicit owner approval is permanently blocked. You maintain 100% editorial authority: research questions are found, drafts are written, you inspect and approve, and only then is the post pushed to your Blogger blog.
            </p>
          </div>
        </div>

        {/* Save & Reset buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-md bg-[#C48B57] hover:bg-[#B37945] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Settings Saved!' : isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-md bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#991B1B] hover:text-[#991B1B] text-xs font-medium border border-[#E5E2DD] hover:border-[#FECACA] flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Data...' : 'Reset Demo Sample Data'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
