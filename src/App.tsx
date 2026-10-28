import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { SetupView } from './components/SetupView';
import { InterviewRoomView } from './components/InterviewRoomView';
import { ResultsView } from './components/ResultsView';
import { QuestionBankView } from './components/QuestionBankView';
import { ScenariosView } from './components/ScenariosView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { 
  UserProfile, 
  InterviewConfig, 
  Question, 
  InterviewResult, 
  TopicId 
} from './types';
import { StorageService, AppSettings } from './services/storage';
import { ApiService } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser());
  const [interviews, setInterviews] = useState<InterviewResult[]>(() => StorageService.getInterviews());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Active interview state
  const [activeConfig, setActiveConfig] = useState<InterviewConfig | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeResult, setActiveResult] = useState<InterviewResult | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState<boolean>(false);
  const [selectedBankTopic, setSelectedBankTopic] = useState<TopicId | undefined>(undefined);

  // Apply dark mode class to html element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleToggleTheme = () => {
    const newTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    const updated: AppSettings = { ...settings, theme: newTheme };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    StorageService.saveUser(newUser);
  };

  const handleLogout = () => {
    // Return to guest default
    const guestUser = StorageService.getUser();
    setUser(guestUser);
  };

  // Start interview flow
  const handleStartInterview = async (config: InterviewConfig) => {
    setActiveConfig(config);
    setIsStartingInterview(true);
    setCurrentTab('interview');

    const res = await ApiService.generateQuestions(config);
    setActiveQuestions(res.questions);
    setIsStartingInterview(false);
  };

  const handleInterviewComplete = (result: InterviewResult) => {
    setActiveResult(result);
    StorageService.saveInterview(result);
    setInterviews(StorageService.getInterviews());
    setUser(StorageService.getUser());
    setCurrentTab('results');
  };

  const handleExploreQuestions = (topicId?: string) => {
    if (topicId) setSelectedBankTopic(topicId as TopicId);
    setCurrentTab('questions');
  };

  const handlePracticeTopicFromBank = (topicId: TopicId) => {
    const topicConfig: InterviewConfig = {
      experienceLevel: user.experienceLevel,
      interviewType: 'technical',
      topics: [topicId],
      difficulty: 'intermediate',
      questionCount: 3,
      durationMinutes: 15,
      enableAudioTTS: settings.ttsEnabled,
      enableVoiceInput: true,
    };
    handleStartInterview(topicConfig);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (currentTab === 'interview') {
            if (window.confirm('Leave the active interview? Your progress so far will be lost.')) {
              ApiService.stopSpeech();
              setCurrentTab(tab);
            }
          } else {
            setCurrentTab(tab);
          }
        }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        activeInterview={currentTab === 'interview'}
      />

      {/* Main Content Router */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-6">
        {currentTab === 'landing' && (
          <LandingView
            onStartInterview={() => setCurrentTab('setup')}
            onExploreQuestions={() => setCurrentTab('questions')}
            onOpenScenarios={() => setCurrentTab('scenarios')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            interviews={interviews}
            onStartInterview={() => setCurrentTab('setup')}
            onExploreQuestions={handleExploreQuestions}
            onOpenScenarios={() => setCurrentTab('scenarios')}
            onViewResults={(res) => {
              setActiveResult(res);
              setCurrentTab('results');
            }}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'setup' && (
          <SetupView
            onStart={handleStartInterview}
            initialExperience={user.experienceLevel}
          />
        )}

        {currentTab === 'interview' && (
          <>
            {isStartingInterview || activeQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <h2 className="text-lg font-bold text-white">Preparing Your Live Interview...</h2>
                <p className="text-xs text-slate-400 max-w-md text-center">
                  Synthesizing DevOps questions tailored to your experience level and selected topics with Gemini AI.
                </p>
              </div>
            ) : (
              <InterviewRoomView
                config={activeConfig!}
                questions={activeQuestions}
                onComplete={handleInterviewComplete}
                onExit={() => {
                  if (window.confirm('Are you sure you want to exit the interview?')) {
                    ApiService.stopSpeech();
                    setCurrentTab('dashboard');
                  }
                }}
                soundEnabled={settings.soundEffects}
              />
            )}
          </>
        )}

        {currentTab === 'results' && activeResult && (
          <ResultsView
            result={activeResult}
            onRetake={() => setCurrentTab('setup')}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            onPracticeTopic={handleExploreQuestions}
          />
        )}

        {currentTab === 'questions' && (
          <QuestionBankView
            onStartCustomInterview={handlePracticeTopicFromBank}
            initialTopic={selectedBankTopic}
          />
        )}

        {currentTab === 'scenarios' && (
          <ScenariosView />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            user={user}
            interviews={interviews}
            onStartInterview={() => setCurrentTab('setup')}
            onPracticeTopic={handleExploreQuestions}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onToggleTheme={handleToggleTheme}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Candidate Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
