import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Send, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  Check, 
  Copy, 
  RotateCcw,
  Zap,
  Flame
} from 'lucide-react';
import { SCENARIOS, Scenario } from '../data/scenarios';
import { ApiService } from '../services/api';
import { AnswerEvaluation } from '../types';

export const ScenariosView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [candidateResponse, setCandidateResponse] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleSelectScenario = (scen: Scenario) => {
    setSelectedScenario(scen);
    setCandidateResponse('');
    setEvaluation(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSubmitTriage = async () => {
    if (!candidateResponse.trim() || isEvaluating) return;
    setIsEvaluating(true);

    const questionMock = {
      id: selectedScenario.id,
      topic: 'troubleshooting' as const,
      difficulty: 'advanced' as const,
      question: `Production Incident Drill: ${selectedScenario.title}. ${selectedScenario.description} Explain your step-by-step investigation, diagnosis commands, immediate mitigation, and recovery plan.`,
      scenarioContext: selectedScenario.incidentBrief,
      hints: selectedScenario.investigationSteps,
      expectedKeywords: selectedScenario.diagnosticCommands,
      referenceAnswer: selectedScenario.expectedResolution,
      practicalCommand: selectedScenario.diagnosticCommands[0],
    };

    const res = await ApiService.evaluateAnswer({
      question: questionMock,
      userAnswer: candidateResponse.trim(),
      topic: 'troubleshooting',
      difficulty: 'advanced',
      experienceLevel: '3-5 years',
      scenarioContext: selectedScenario.incidentBrief,
    });

    setEvaluation(res.evaluation);
    setIsEvaluating(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            <span>Interactive Production Incident Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            SRE & Production Troubleshooting Scenarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real production disasters: 502 Bad Gateways, OOMKilled CrashLoops, runaway database CPU, and state locks. Explain your triage step by step.
          </p>
        </div>
      </div>

      {/* Scenario Selector Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIOS.map((scen) => {
          const isSelected = selectedScenario.id === scen.id;
          return (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              className={`rounded-2xl border p-4 text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 text-white'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5 ${
                    scen.severity.includes('P1') ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {scen.severity}
                  </span>
                  <Activity className="h-3.5 w-3.5 opacity-60" />
                </div>
                <h2 className="text-xs font-bold text-white line-clamp-2">{scen.title}</h2>
              </div>
              <span className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80 block">
                {scen.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Incident Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Incident Telemetry & Symptoms) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>Incident Brief</span>
              </span>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                ACTIVE OUTAGE
              </span>
            </div>

            <h2 className="text-base font-bold text-white leading-snug">{selectedScenario.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedScenario.description}</p>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Affected Service:</span>
                <span className="font-mono text-emerald-400">{selectedScenario.initialState.service}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Triggered Alert:</span>
                <span className="font-mono text-rose-400">{selectedScenario.initialState.alert}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Recent Changes:</span>
                <span className="text-slate-300">{selectedScenario.initialState.recentChanges}</span>
              </div>
            </div>

            {/* Observed Symptoms */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 block">Observed Symptoms & Logs:</span>
              <div className="space-y-1.5">
                {selectedScenario.symptoms.map((sym, idx) => (
                  <div key={idx} className="rounded bg-slate-950/80 p-2 text-xs font-mono text-slate-300 border border-slate-800/80">
                    {sym}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Diagnostic Commands */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Standard Triage Commands:</span>
              <div className="space-y-1.5">
                {selectedScenario.diagnosticCommands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded bg-slate-950 p-2 text-xs font-mono text-emerald-400 border border-slate-800"
                  >
                    <span className="truncate">{cmd}</span>
                    <button
                      onClick={() => handleCopy(cmd)}
                      className="ml-2 text-slate-500 hover:text-white"
                      title="Copy command"
                    >
                      {copiedCmd === cmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Candidate Investigation Workspace & AI Feedback) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Your Investigation & Mitigation Plan</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Walk the interviewer through: 1) Diagnostic commands you run first, 2) Root cause deduction, 3) Immediate rollback or mitigation to restore users, 4) Permanent fix.
              </p>
            </div>

            <textarea
              rows={8}
              value={candidateResponse}
              onChange={(e) => setCandidateResponse(e.target.value)}
              placeholder="Step 1: Check system logs and container exit code...&#10;Step 2: Isolate upstream proxy connection...&#10;Step 3: Execute immediate mitigation (e.g. rollback / resource adjustment)...&#10;Step 4: Verify metrics return to baseline..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {candidateResponse.trim().split(/\s+/).filter(Boolean).length} words entered
              </span>

              <button
                disabled={!candidateResponse.trim() || isEvaluating}
                onClick={handleSubmitTriage}
                className={`flex items-center space-x-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  !candidateResponse.trim() || isEvaluating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Triage Quality...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Triage for AI Grading</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Evaluation Report on this Scenario */}
            {evaluation && (
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400">SRE Triage Score</span>
                    <div className="text-2xl font-black text-white">
                      {evaluation.score} <span className="text-xs text-slate-400">/ 10</span>
                    </div>
                  </div>
                  <div className="flex space-x-3 text-xs">
                    <span className="rounded bg-slate-950 px-2 py-1 text-slate-300">
                      Troubleshoot: <strong className="text-cyan-300">{evaluation.troubleshootingScore}/10</strong>
                    </span>
                    <span className="rounded bg-slate-950 px-2 py-1 text-slate-300">
                      Tech Accuracy: <strong className="text-emerald-300">{evaluation.technicalCorrectnessScore}/10</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                    <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Sound Diagnostic Steps:</span>
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {evaluation.answeredWell.map((pt, i) => (
                        <li key={i}>• {pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                    <span className="font-bold text-amber-400 flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Missing Critical Points:</span>
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {evaluation.missingPoints.map((pt, i) => (
                        <li key={i}>• {pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SRE Reference Solution */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Incident Commander Expected Resolution:</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedScenario.expectedResolution}
                  </p>
                </div>

                {/* Post-Mortem Focus */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block">Blameless Post-Mortem & Preventative Actions:</span>
                  <ul className="space-y-1 text-slate-400">
                    {selectedScenario.postMortemFocus.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400">→</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
