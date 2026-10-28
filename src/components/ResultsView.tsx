import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Download, 
  RotateCcw, 
  LayoutDashboard, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  FileText,
  Clock,
  Layers,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { InterviewResult } from '../types';

interface ResultsViewProps {
  result: InterviewResult;
  onRetake: () => void;
  onGoToDashboard: () => void;
  onPracticeTopic: (topicId: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onRetake,
  onGoToDashboard,
  onPracticeTopic,
}) => {
  const [expandedExchangeIdx, setExpandedExchangeIdx] = useState<number | null>(0);
  const [copiedDayCommand, setCopiedDayCommand] = useState<string | null>(null);

  useEffect(() => {
    if (result.totalScore >= 65) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // graceful
      }
    }
  }, [result.totalScore]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDayCommand(text);
    setTimeout(() => setCopiedDayCommand(null), 2000);
  };

  const handleDownloadReport = () => {
    const reportText = `=== DEVOPS AI INTERVIEW REPORT ===
Candidate Score: ${result.totalScore}/100
Date: ${new Date(result.timestamp).toLocaleDateString()}
Duration: ${Math.round(result.totalDurationSeconds / 60)} minutes
Experience Target: ${result.config.experienceLevel} (${result.config.interviewType})

SCORES BREAKDOWN:
- Overall Score: ${result.totalScore}/100
- Technical Knowledge: ${result.technicalScore}/100
- Troubleshooting Approach: ${result.troubleshootingScore}/100
- Communication & Clarity: ${result.communicationScore}/100

STRONGEST TOPICS:
${result.strongestTopics.map((t) => `* ${t}`).join('\n')}

TOPICS TO IMPROVE:
${result.topicsToImprove.map((t) => `* ${t}`).join('\n')}

7-DAY PERSONALIZED STUDY PLAN:
${result.sevenDayPlan
  .map(
    (d) =>
      `Day ${d.day}: ${d.title} (${d.focusArea})\n` +
      d.tasks.map((task) => `  - ${task}`).join('\n') +
      '\n  Commands: ' +
      d.recommendedCommands.join(', ')
  )
  .join('\n\n')}

QUESTION TRANSCRIPTS:
${result.exchanges
  .map(
    (ex, idx) =>
      `Q${idx + 1} [${ex.question.topic} - Score: ${ex.evaluation?.score || 0}/10]:\n` +
      `Question: ${ex.question.question}\n` +
      `Your Answer: ${ex.userAnswer}\n` +
      `Ideal Answer: ${ex.evaluation?.idealAnswer}\n`
  )
  .join('\n------------------------\n')}

DISCLAIMER: AI-generated evaluations and scores are diagnostic indicators, not official recruitment guarantees.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DevOps_Interview_Report_${new Date(result.timestamp).toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Celebration & Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interview Complete & Evaluated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              DevOps Performance Scorecard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Completed {result.exchanges.length} questions in {Math.round(result.totalDurationSeconds / 60)} minutes. Review category mastery, question-by-question ideal answers, and your personalized 7-day study plan.
            </p>
          </div>

          {/* Big Score Card */}
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/80 p-5 text-center min-w-[160px] shadow-lg shadow-emerald-500/10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Score</span>
            <div className="text-4xl font-black text-emerald-400 mt-1">
              {result.totalScore}
              <span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
            <div className="mt-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
              {result.totalScore >= 85 ? 'Senior Ready' : result.totalScore >= 70 ? 'Mid-Senior Tier' : 'Foundation Level'}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRetake}
              className="flex items-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Interview</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export Report (.txt)</span>
            </button>
          </div>

          <button
            onClick={onGoToDashboard}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Sub-Scores & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Technical Knowledge</span>
            <span className="font-bold text-emerald-400 text-sm">{result.technicalScore}/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${result.technicalScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Understanding of internals, tool architecture, and CLI options.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Troubleshooting Strategy</span>
            <span className="font-bold text-cyan-400 text-sm">{result.troubleshootingScore}/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${result.troubleshootingScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Isolating root cause, examining logs, and safe mitigation steps.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Communication & Clarity</span>
            <span className="font-bold text-indigo-400 text-sm">{result.communicationScore}/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${result.communicationScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Structured verbal or written articulation of complex systems.
          </p>
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Strongest Topics</span>
          </div>
          <div className="space-y-2">
            {result.strongestTopics.map((topic, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="h-5 w-5" />
            <span>Topics Requiring Improvement</span>
          </div>
          <div className="space-y-2">
            {result.topicsToImprove.map((topic, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="font-semibold">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized 7-Day Study Plan */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Calendar className="h-4 w-4" />
              <span>Tailored Action Plan</span>
            </div>
            <h2 className="text-xl font-bold text-white">Your Personalized 7-Day Study Plan</h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Targeted for your next technical round</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.sevenDayPlan.map((day) => (
            <div
              key={day.day}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-400">
                  Day {day.day}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{day.focusArea}</span>
              </div>

              <h3 className="font-bold text-sm text-white">{day.title}</h3>

              <ul className="space-y-1.5 text-xs text-slate-300">
                {day.tasks.map((task, tidx) => (
                  <li key={tidx} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>

              {day.recommendedCommands && day.recommendedCommands.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Practice:</span>
                  {day.recommendedCommands.map((cmd, cidx) => (
                    <div
                      key={cidx}
                      className="flex items-center justify-between rounded bg-slate-900 p-1.5 text-[11px] font-mono text-emerald-400"
                    >
                      <span className="truncate">{cmd}</span>
                      <button
                        onClick={() => copyToClipboard(cmd)}
                        className="ml-2 text-slate-400 hover:text-white"
                      >
                        {copiedDayCommand === cmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Question Transcripts & Answers Breakdown */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Full Question & Answer Review</h2>
            <p className="text-xs text-slate-400">Examine how you answered vs the ideal senior answer</p>
          </div>
          <span className="text-xs text-slate-400">{result.exchanges.length} Exchanges Graded</span>
        </div>

        <div className="space-y-4">
          {result.exchanges.map((ex, idx) => {
            const isExpanded = expandedExchangeIdx === idx;
            const evalData = ex.evaluation;
            const score = evalData?.score || 0;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all"
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedExchangeIdx(isExpanded ? null : idx)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {ex.question.topic}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">• {ex.timeSpentSeconds}s</span>
                      </div>
                      <p className="text-sm font-semibold text-white line-clamp-1 mt-0.5">
                        {ex.question.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-base font-bold text-emerald-400">{score}</span>
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 space-y-4 border-t border-slate-800/80 bg-slate-950/40">
                    {/* User's Answer */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Your Submitted Answer:</span>
                      <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap">
                        {ex.userAnswer}
                      </p>
                    </div>

                    {/* What went well / missing */}
                    {evalData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                          <span className="font-bold text-emerald-400 block">Answered Well:</span>
                          <ul className="space-y-1 text-slate-300">
                            {evalData.answeredWell.map((pt, i) => (
                              <li key={i}>• {pt}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
                          <span className="font-bold text-amber-400 block">Missing Points:</span>
                          <ul className="space-y-1 text-slate-300">
                            {evalData.missingPoints.map((pt, i) => (
                              <li key={i}>• {pt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Reference Ideal Answer */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Code2 className="h-4 w-4 text-emerald-400" />
                        <span>Recommended Ideal Answer:</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evalData?.idealAnswer || ex.question.referenceAnswer}
                      </p>

                      {evalData?.practicalExampleOrCommand && (
                        <div className="mt-2 rounded bg-slate-950 p-2 text-xs font-mono text-emerald-400 border border-slate-800">
                          {evalData.practicalExampleOrCommand}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Notice */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center text-xs text-slate-500">
        <ShieldCheck className="inline-block h-4 w-4 mr-1 text-slate-400" />
        AI-generated scores and evaluations are simulated diagnostic estimates to assist in interview preparation and do not represent formal certification or guarantees of company hiring decisions.
      </div>
    </div>
  );
};
