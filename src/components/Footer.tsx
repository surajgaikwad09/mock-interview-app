import React from 'react';
import { Terminal, Shield, GitBranch, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 text-slate-400 py-8 text-xs transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">DevOps AI Interview Coach</span>
              <p className="text-[11px] text-slate-500">Autonomous Technical Screening & Incident Readiness</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Google Gemini 3.8 Flash Evaluator</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span>Realistic Grading & SRE Runbooks</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
              <span>14 Core DevOps Domains</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 text-center md:text-right">
            <span>Built for DevOps & SRE Candidates · AI Studio</span>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-900 pt-4 text-center text-[10px] text-slate-600">
          Disclaimer: AI-generated evaluations and scores are diagnostic preparation indicators, not official recruitment or hiring commitments.
        </div>
      </div>
    </footer>
  );
};
