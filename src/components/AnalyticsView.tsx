import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Terminal, 
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { UserProfile, InterviewResult } from '../types';
import { TOPICS } from '../data/topics';

interface AnalyticsViewProps {
  user: UserProfile;
  interviews: InterviewResult[];
  onStartInterview: () => void;
  onPracticeTopic: (topicId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  interviews,
  onStartInterview,
  onPracticeTopic,
}) => {
  // Compute aggregate stats
  const totalInterviews = interviews.length;
  const avgScore = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, i) => acc + i.totalScore, 0) / totalInterviews)
    : user.interviewReadinessScore || 75;

  const avgTechnical = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, i) => acc + i.technicalScore, 0) / totalInterviews)
    : 80;

  const avgTroubleshooting = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, i) => acc + i.troubleshootingScore, 0) / totalInterviews)
    : 76;

  const avgCommunication = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, i) => acc + i.communicationScore, 0) / totalInterviews)
    : 82;

  // Compute topic mastery scores
  const topicStats: Record<string, { total: number; count: number }> = {};
  interviews.forEach((interview) => {
    Object.entries(interview.topicScores || {}).forEach(([topic, score]) => {
      if (!topicStats[topic]) topicStats[topic] = { total: 0, count: 0 };
      topicStats[topic].total += score;
      topicStats[topic].count += 1;
    });
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Diagnostic Analytics & Readiness Growth</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          DevOps Engineering Competency Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Longitudinal performance tracking across technical knowledge, troubleshooting methodology, and systems communication.
        </p>
      </div>

      {/* Aggregate Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Mean Total Score</span>
          <div className="text-3xl font-black text-emerald-400">{avgScore}%</div>
          <div className="text-[11px] text-slate-400">Across {totalInterviews} sessions</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Technical Depth</span>
          <div className="text-3xl font-black text-cyan-400">{avgTechnical}%</div>
          <div className="text-[11px] text-slate-400">Architectures & Flags</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Troubleshooting</span>
          <div className="text-3xl font-black text-amber-400">{avgTroubleshooting}%</div>
          <div className="text-[11px] text-slate-400">Triage & Root Cause</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Communication</span>
          <div className="text-3xl font-black text-indigo-400">{avgCommunication}%</div>
          <div className="text-[11px] text-slate-400">Clarity & Precision</div>
        </div>
      </div>

      {/* Domain Mastery Matrix */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">14 DevOps Domain Mastery</h2>
            <p className="text-xs text-slate-400">Estimated skill proficiency based on interview question responses</p>
          </div>
          <button
            onClick={onStartInterview}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors"
          >
            Start Drill
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOPICS.map((topic) => {
            const hasData = topicStats[topic.id];
            const score = hasData ? Math.round(hasData.total / hasData.count) : user.topicsMastered.includes(topic.id) ? 82 : 65;

            return (
              <div
                key={topic.id}
                onClick={() => onPracticeTopic(topic.id)}
                className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {topic.name}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-400' : score >= 70 ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {score}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-emerald-500' : score >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{topic.tags.slice(0, 3).join(', ')}</span>
                  <span className="text-emerald-400 font-medium group-hover:underline flex items-center space-x-1">
                    <span>Practice</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
