import React from 'react';
import { 
  Terminal, 
  LayoutDashboard, 
  PlayCircle, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  User, 
  Settings, 
  Moon, 
  Sun,
  ShieldCheck,
  Sparkles,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeInterview: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
  activeInterview,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 text-slate-100 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div 
          onClick={() => !activeInterview && onNavigate('dashboard')}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Terminal className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-base sm:text-lg text-white">
                DevOps<span className="text-emerald-400">Coach</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Mock Interviews & Scenario Lab
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        {!activeInterview && (
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('setup')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                currentTab === 'setup'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <PlayCircle className="h-4 w-4 text-emerald-400" />
              <span>Mock Interview</span>
            </button>

            <button
              onClick={() => onNavigate('scenarios')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                currentTab === 'scenarios'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Incident Simulator</span>
            </button>

            <button
              onClick={() => onNavigate('questions')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                currentTab === 'questions'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                currentTab === 'analytics'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </nav>
        )}

        {/* Right Action Items */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center space-x-2 rounded-lg border border-slate-800 px-3 py-1.5 transition-colors ${
                  currentTab === 'profile' ? 'bg-slate-800 text-white' : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-none">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 leading-tight">Score: {user.interviewReadinessScore}%</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                title="Settings"
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${
                  currentTab === 'settings' ? 'bg-slate-800 text-emerald-400' : ''
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Quick Start Action on Mobile */}
          {!activeInterview && currentTab !== 'setup' && (
            <button
              onClick={() => onNavigate('setup')}
              className="lg:hidden flex items-center space-x-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Start</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Sub-Nav Bar */}
      {!activeInterview && (
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto border-t border-slate-800/60 px-4 py-2 text-xs no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'setup', label: 'Mock Interview', icon: PlayCircle },
            { id: 'scenarios', label: 'Incidents', icon: AlertTriangle },
            { id: 'questions', label: 'Questions', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center space-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
