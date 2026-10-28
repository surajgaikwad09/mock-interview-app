import React from 'react';
import { 
  PlayCircle, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Layers, 
  BarChart2, 
  Terminal,
  Zap,
  RotateCcw
} from 'lucide-react';
import { UserProfile, InterviewResult } from '../types';
import { TOPICS } from '../data/topics';

interface DashboardViewProps {
  user: UserProfile;
  interviews: InterviewResult[];
  onStartInterview: () => void;
  onExploreQuestions: (topicId?: string) => void;
  onOpenScenarios: (scenarioId?: string) => void;
  onViewResults: (interview: InterviewResult) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  interviews,
  onStartInterview,
  onExploreQuestions,
  onOpenScenarios,
  onViewResults,
  onNavigate,
}) => {
  const readiness = user.interviewReadinessScore || 75;
  const recentInterview = interviews.length > 0 ? interviews[0] : null;

  // Calculate readiness status badge & color
  let readinessLabel = 'Solid Progress';
  let readinessColor = 'text-emerald-400';
  let readinessBg = 'bg-emerald-500/10 border-emerald-500/30';
  if (readiness >= 85) {
    readinessLabel = 'Interview Ready (Senior Tier)';
    readinessColor = 'text-emerald-400';
    readinessBg = 'bg-emerald-500/10 border-emerald-500/30';
  } else if (readiness >= 70) {
    readinessLabel = 'Strong Candidate (Mid-Senior)';
    readinessColor = 'text-cyan-400';
    readinessBg = 'bg-cyan-500/10 border-cyan-500/30';
  } else if (readiness >= 50) {
    readinessLabel = 'Developing Core Foundations';
    readinessColor = 'text-amber-400';
    readinessBg = 'bg-amber-500/10 border-amber-500/30';
  } else {
    readinessLabel = 'Needs Targeted Practice';
    readinessColor = 'text-rose-400';
    readinessBg = 'bg-rose-500/10 border-rose-500/30';
  }

  // Recommended topics based on unmastered or lowest scored
  const unmastered = TOPICS.filter((t) => !user.topicsMastered.includes(t.id));
  const recommendedTopics = unmastered.slice(0, 3);

  // SVG gauge calculations
  const strokeDash = (readiness / 100) * 283;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DevOps AI Interview Coach Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{user.name}</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Targeting <span className="font-semibold text-white">{user.targetRole}</span> with{' '}
              <span className="font-semibold text-white">{user.experienceLevel} years</span> experience. Practice realistic technical questions, live incident root cause analysis, and receive actionable 10-point AI feedback.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartInterview}
                className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Start Mock Interview</span>
              </button>

              <button
                onClick={() => onOpenScenarios()}
                className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Simulate Production Outage</span>
              </button>

              <button
                onClick={() => onExploreQuestions()}
                className="inline-flex items-center space-x-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span>Question Bank ({TOPICS.length} Domains)</span>
              </button>
            </div>
          </div>

          {/* Overall Readiness Gauge */}
          <div className="shrink-0 flex items-center justify-center p-2 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <div className="relative flex flex-col items-center justify-center text-center p-4">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="url(#readinessGrad)"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - strokeDash}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{readiness}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Readiness</span>
                </div>
              </div>

              <div className={`mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${readinessBg} ${readinessColor}`}>
                {readinessLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Interviews Completed</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{user.interviewsCompleted}</span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>+1 completed this week</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Questions Answered</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Terminal className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{user.questionsAnswered}</span>
            <span className="text-xs text-slate-400">graded</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Avg. score: <span className="text-white font-medium">8.1 / 10</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Topics Mastered</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{user.topicsMastered.length}</span>
            <span className="text-xs text-slate-400">of {TOPICS.length} domains</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-400">
            {Math.round((user.topicsMastered.length / TOPICS.length) * 100)}% syllabus covered
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">AI Feedback Mode</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-sm font-bold text-white">Gemini 3.8 Flash</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ready with Voice TTS</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Topics & Practice Cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Practice Topics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Recommended Study Areas</h2>
                <p className="text-xs text-slate-400">High-yield interview topics based on target role: {user.targetRole}</p>
              </div>
              <button
                onClick={() => onExploreQuestions()}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <span>View All 14</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => onExploreQuestions(topic.id)}
                  className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/50 p-4 hover:border-emerald-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {topic.id}
                      </span>
                      <Terminal className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{topic.tags.slice(0, 2).join(' · ')}</span>
                    <span className="text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">Practice →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Incident Drills Highlight */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-slate-900/80 to-slate-900 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-sm">Production Incident Simulator</h3>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">P1 Outage</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Practice realistic troubleshooting: HTTP 502 bad gateways, Kubernetes CrashLoopBackOff, AWS SSH dropouts, and runaway database CPU load.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenScenarios()}
                className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-amber-500/20"
              >
                Launch Simulator
              </button>
            </div>
          </div>

          {/* Interview History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Interview History & Reviews</h2>
                <p className="text-xs text-slate-400">Review detailed transcripts, scores, and 7-day study plans</p>
              </div>
            </div>

            {interviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No mock interviews recorded yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Take your first timed mock interview to generate personalized performance analytics and study roadmaps.
                </p>
                <button
                  onClick={onStartInterview}
                  className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  Start Your First Interview
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white capitalize">
                          {item.config.interviewType} Interview
                        </span>
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 uppercase font-medium">
                          {item.config.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{item.exchanges.length} questions</span>
                        <span>•</span>
                        <span>{Math.round(item.totalDurationSeconds / 60)} mins</span>
                        <span>•</span>
                        <span className="text-emerald-400">Tech: {item.technicalScore}%</span>
                        <span>•</span>
                        <span className="text-cyan-400">Troubleshooting: {item.troubleshootingScore}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-white">
                          {item.totalScore}
                          <span className="text-xs text-slate-400">/100</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewResults(item)}
                        className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Performance Breakdown & 7-Day Plan Widget */}
        <div className="space-y-6">
          {/* Performance Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <BarChart2 className="h-4 w-4 text-emerald-400" />
                <span>Performance Breakdown</span>
              </h3>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Full Analytics
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Technical Correctness</span>
                  <span className="text-emerald-400 font-bold">85%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Troubleshooting Methodology</span>
                  <span className="text-cyan-400 font-bold">78%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500 w-[78%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Communication & Clarity</span>
                  <span className="text-indigo-400 font-bold">82%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 w-[82%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              Top strength: <span className="text-emerald-300 font-medium">Containerization & Linux</span>
              <br />
              Growth area: <span className="text-amber-300 font-medium">PromQL alerting & Canary rules</span>
            </div>
          </div>

          {/* Active 7-Day Roadmap Snippet */}
          {recentInterview && recentInterview.sevenDayPlan && recentInterview.sevenDayPlan.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Personalized 7-Day Study Plan</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Day 1 Active
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-200">
                  {recentInterview.sevenDayPlan[0].title}
                </p>
                <p className="text-[11px] text-slate-400">
                  Focus: {recentInterview.sevenDayPlan[0].focusArea}
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {recentInterview.sevenDayPlan[0].tasks.slice(0, 2).map((t, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onViewResults(recentInterview)}
                className="w-full mt-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-slate-200 transition-colors"
              >
                View Full 7-Day Roadmap →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
