import React from 'react';
import { Compass, FileText, HelpCircle, Layers, Settings, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'research' | 'questions' | 'articles' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'research' | 'questions' | 'articles' | 'settings') => void;
  onTriggerSearch: () => void;
  isSearching: boolean;
  needsApprovalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onTriggerSearch,
  isSearching,
  needsApprovalCount
}) => {
  const navItems: Array<{
    id: 'dashboard' | 'research' | 'questions' | 'articles' | 'settings';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'research', label: 'Research', icon: Compass },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'articles', label: 'Articles', icon: FileText, badge: needsApprovalCount > 0 ? needsApprovalCount : undefined },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E2DD] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-[#1A1A1A] text-[#FDFCFB] flex items-center justify-center shadow-xs group-hover:bg-[#C48B57] transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-lg tracking-tight text-[#1A1A1A]">Planner Pulse</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F4F1EA] text-[#8E8B82] border border-[#E5E2DD]">Research MVP</span>
              </div>
              <p className="text-[11px] text-[#8E8B82] hidden sm:block font-sans">Digital Planner Question Discovery & Answer Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1A1A1A] text-[#FDFCFB] shadow-xs'
                      : 'text-[#6B665F] hover:text-[#1A1A1A] hover:bg-[#F4F1EA]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive 
                        ? 'bg-[#C48B57] text-white' 
                        : 'bg-[#FFF8E7] text-[#975A16] border border-[#F3DEB2]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Primary Action */}
        <div className="flex items-center gap-3">
          <button
            id="btn-search-today"
            onClick={onTriggerSearch}
            disabled={isSearching}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium shadow-xs transition-all ${
              isSearching
                ? 'bg-[#E5E2DD] text-[#8E8B82] cursor-not-allowed animate-pulse'
                : 'bg-[#C48B57] hover:bg-[#B37945] text-white font-medium hover:shadow-sm'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Researching Internet...' : 'Search Today'}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#E5E2DD] bg-[#FAF8F5] px-2 py-1.5 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded text-[10px] font-medium ${
                isActive ? 'text-[#1A1A1A] bg-[#EAE6E1]' : 'text-[#8E8B82] hover:text-[#1A1A1A]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
