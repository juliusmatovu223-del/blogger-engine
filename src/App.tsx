import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { ArticleEditor } from './components/ArticleEditor';
import { ArticleLibrary } from './components/ArticleLibrary';
import { DashboardView } from './components/DashboardView';
import { Navbar } from './components/Navbar';
import { PublishModal } from './components/PublishModal';
import { QuestionsView } from './components/QuestionsView';
import { ResearchModal } from './components/ResearchModal';
import { ResearchView } from './components/ResearchView';
import { SettingsView } from './components/SettingsView';
import { api } from './services/api';
import { AppSettings, Article, DashboardStats, ResearchRun, Source, Topic } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'research' | 'questions' | 'articles' | 'settings'>('dashboard');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // UI / Action states
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [latestDiscoveredSources, setLatestDiscoveredSources] = useState<Source[]>([]);
  const [latestDiscoveredTopics, setLatestDiscoveredTopics] = useState<Topic[]>([]);

  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [activeGeneratingTopicId, setActiveGeneratingTopicId] = useState<string | null>(null);

  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [isRegeneratingArticle, setIsRegeneratingArticle] = useState(false);

  const [publishModalArticle, setPublishModalArticle] = useState<Article | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadAllData = async () => {
    try {
      const [statsData, topicsData, sourcesData, articlesData, runsData, settingsData] = await Promise.all([
        api.getStats(),
        api.getTopics(),
        api.getSources(),
        api.getArticles(),
        api.getResearchRuns(),
        api.getSettings()
      ]);
      setStats(statsData);
      setTopics(topicsData);
      setSources(sourcesData);
      setArticles(articlesData);
      setRuns(runsData);
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      showToast('Error loading application data', 'error');
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Trigger "Search Today"
  const handleTriggerSearch = async () => {
    setIsSearching(true);
    setShowResearchModal(true);
    setLatestDiscoveredSources([]);
    setLatestDiscoveredTopics([]);

    try {
      const result = await api.triggerResearch();
      setLatestDiscoveredSources(result.sources);
      setLatestDiscoveredTopics(result.topics);
      showToast(result.message || 'Research completed successfully!');
      await loadAllData();
    } catch (err: any) {
      console.error('Research trigger failed:', err);
      showToast(err.message || 'Research failed to complete', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Generate Article from Topic
  const handleGenerateArticle = async (topicId: string) => {
    setIsGeneratingArticle(true);
    setActiveGeneratingTopicId(topicId);

    try {
      const newArticle = await api.generateArticle(topicId);
      showToast('300–450 word answer-focused article drafted!');
      await loadAllData();
      setSelectedArticleId(newArticle.id);
      setActiveTab('articles');
    } catch (err: any) {
      console.error('Article generation failed:', err);
      showToast(err.message || 'Failed to generate article', 'error');
    } finally {
      setIsGeneratingArticle(false);
      setActiveGeneratingTopicId(null);
    }
  };

  // Save Article
  const handleSaveArticle = async (updates: Partial<Article>) => {
    if (!selectedArticleId) return;
    setIsSavingArticle(true);
    try {
      const updated = await api.updateArticle(selectedArticleId, updates);
      setArticles(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      showToast('Draft changes saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsSavingArticle(false);
    }
  };

  // Approve Article
  const handleApproveArticle = async (articleId: string) => {
    try {
      const result = await api.approveArticle(articleId);
      setArticles(prev => prev.map(a => (a.id === result.article.id ? result.article : a)));
      await loadAllData();
      showToast('Article approved! One-click publishing is now unlocked.');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve article', 'error');
    }
  };

  // Reject / Revert Article
  const handleRejectArticle = async (articleId: string) => {
    try {
      const result = await api.rejectArticle(articleId, 'draft');
      setArticles(prev => prev.map(a => (a.id === result.article.id ? result.article : a)));
      await loadAllData();
      showToast('Article reverted to draft.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Regenerate Article
  const handleRegenerateArticle = async (topicId: string) => {
    setIsRegeneratingArticle(true);
    try {
      const newArticle = await api.generateArticle(topicId);
      setArticles(prev => prev.map(a => (a.id === newArticle.id ? newArticle : a)));
      await loadAllData();
      showToast('Article regenerated with fresh answer structure!');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate article', 'error');
    } finally {
      setIsRegeneratingArticle(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (articleId: string) => {
    try {
      await api.deleteArticle(articleId);
      setSelectedArticleId(null);
      await loadAllData();
      showToast('Draft deleted.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete article', 'error');
    }
  };

  // Confirm Publish
  const handleConfirmPublish = async () => {
    if (!publishModalArticle) return;
    setIsPublishing(true);
    try {
      const result = await api.publishArticle(publishModalArticle.id);
      setArticles(prev => prev.map(a => (a.id === result.article.id ? result.article : a)));
      setPublishModalArticle(result.article);
      await loadAllData();
      showToast('Article successfully published!');
    } catch (err: any) {
      showToast(err.message || 'Publishing failed', 'error');
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  // Reset Demo
  const handleResetDemoData = async () => {
    try {
      await api.resetDemoData();
      await loadAllData();
      setSelectedArticleId(null);
      showToast('Sample demo data reloaded.');
    } catch (err: any) {
      showToast('Failed to reset demo data', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      showToast('Settings saved.');
    } catch (err: any) {
      showToast('Failed to save settings', 'error');
    }
  };

  const selectedArticle = selectedArticleId ? articles.find(a => a.id === selectedArticleId) : null;
  const selectedArticleSources = selectedArticle
    ? sources.filter(s => selectedArticle.source_ids.includes(s.id))
    : [];
  const selectedArticleTopic = selectedArticle
    ? topics.find(t => t.id === selectedArticle.topic_id)
    : undefined;

  const needsApprovalCount = articles.filter(a => a.status === 'needs_approval').length;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-[#D4A373]/30 selection:text-[#1A1A1A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2.5 ${
            toastMessage.type === 'success'
              ? 'bg-[#FFFFFF] border-[#D1E2CA] text-[#2D5A27]'
              : 'bg-[#FFFFFF] border-[#F8D7DA] text-[#991B1B]'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#991B1B]" />
            )}
            <span className="font-sans">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={tab => {
          setActiveTab(tab);
          if (tab !== 'articles') {
            setSelectedArticleId(null);
          }
        }}
        onTriggerSearch={handleTriggerSearch}
        isSearching={isSearching}
        needsApprovalCount={needsApprovalCount}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isLoadingInitial ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C48B57]" />
            <p className="text-xs text-[#8E8B82] font-mono">Loading Planner Pulse research workspace...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                topics={topics}
                articles={articles}
                onTriggerSearch={handleTriggerSearch}
                isSearching={isSearching}
                onSelectTopic={topicId => {
                  const topic = topics.find(t => t.id === topicId);
                  if (topic?.article_id) {
                    setSelectedArticleId(topic.article_id);
                    setActiveTab('articles');
                  } else {
                    handleGenerateArticle(topicId);
                  }
                }}
                onSelectArticle={articleId => {
                  setSelectedArticleId(articleId);
                  setActiveTab('articles');
                }}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'research' && (
              <ResearchView
                runs={runs}
                sources={sources}
                topics={topics}
                keywords={settings?.research_keywords || []}
                onTriggerSearch={handleTriggerSearch}
                isSearching={isSearching}
                onUpdateKeywords={kws => handleSaveSettings({ research_keywords: kws })}
                onSelectTopic={topicId => {
                  const topic = topics.find(t => t.id === topicId);
                  if (topic?.article_id) {
                    setSelectedArticleId(topic.article_id);
                    setActiveTab('articles');
                  } else {
                    handleGenerateArticle(topicId);
                  }
                }}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsView
                topics={topics}
                sources={sources}
                onSelectTopicForArticle={handleGenerateArticle}
                onSelectArticle={articleId => {
                  setSelectedArticleId(articleId);
                  setActiveTab('articles');
                }}
                isGeneratingArticle={isGeneratingArticle}
                activeGeneratingId={activeGeneratingTopicId}
              />
            )}

            {activeTab === 'articles' && (
              selectedArticle ? (
                <ArticleEditor
                  article={selectedArticle}
                  sources={selectedArticleSources}
                  topic={selectedArticleTopic}
                  settings={settings}
                  onSave={handleSaveArticle}
                  onApprove={handleApproveArticle}
                  onReject={handleRejectArticle}
                  onRegenerate={handleRegenerateArticle}
                  onDelete={handleDeleteArticle}
                  onPublishClick={art => setPublishModalArticle(art)}
                  onBack={() => setSelectedArticleId(null)}
                  isSaving={isSavingArticle}
                  isRegenerating={isRegeneratingArticle}
                />
              ) : (
                <ArticleLibrary
                  articles={articles}
                  onSelectArticle={articleId => setSelectedArticleId(articleId)}
                  onApproveArticle={handleApproveArticle}
                  onPublishArticle={art => setPublishModalArticle(art)}
                  onNavigateToQuestions={() => setActiveTab('questions')}
                />
              )
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onResetDemoData={handleResetDemoData}
                isSaving={isSavingArticle}
              />
            )}
          </>
        )}
      </main>

      {/* Research Progress & Opportunity Modal */}
      <ResearchModal
        isOpen={showResearchModal}
        onClose={() => setShowResearchModal(false)}
        isSearching={isSearching}
        discoveredSources={latestDiscoveredSources}
        discoveredTopics={latestDiscoveredTopics}
        onSelectTopicForArticle={handleGenerateArticle}
      />

      {/* Publish Confirmation Modal */}
      <PublishModal
        isOpen={!!publishModalArticle}
        onClose={() => setPublishModalArticle(null)}
        article={publishModalArticle}
        settings={settings}
        onConfirmPublish={handleConfirmPublish}
        isPublishing={isPublishing}
      />
    </div>
  );
}
