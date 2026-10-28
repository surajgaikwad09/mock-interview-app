import React, { useState } from 'react';
import { 
  Settings, 
  Volume2, 
  Sliders, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Zap, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { AppSettings, StorageService } from '../services/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onToggleTheme,
}) => {
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled);
  const [voiceRate, setVoiceRate] = useState(settings.voiceRate);
  const [autoPlayAudio, setAutoPlayAudio] = useState(settings.autoPlayAudio);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      ttsEnabled,
      voiceRate,
      autoPlayAudio,
      soundEffects,
    };
    onUpdateSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <Settings className="h-3.5 w-3.5" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Application & Interviewer Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure speech synthesis, interface aesthetics, and AI interaction rules.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Audio & Speech */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>Voice & Audio Synthesis</span>
            </h2>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-white block">Enable Spoken Questions (TTS)</span>
                  <span className="text-[11px] text-slate-400">Interviewer speaks questions aloud using Gemini TTS or Web Speech</span>
                </div>
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-xs font-semibold text-white block">Auto-Play Audio on Question Load</span>
                  <span className="text-[11px] text-slate-400">Play question speech automatically upon advancing</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlayAudio}
                  onChange={(e) => setAutoPlayAudio(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">Speech Rate</span>
                  <span className="font-mono text-emerald-400">{voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.75x (Deliberate)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.5x (Fast)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme & Sound Effects */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Interface & Feedback</span>
            </h2>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Theme Mode</span>
                  <span className="text-[11px] text-slate-400">Currently using {settings.theme === 'dark' ? 'Dark Console Mode' : 'Light Clean Mode'}</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  {settings.theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                  <span>Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-xs font-semibold text-white block">Audio Sound Effects</span>
                  <span className="text-[11px] text-slate-400">Subtle chimes on hint request, submission, and celebration</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* AI Engine Info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Zap className="h-4 w-4" />
              <span>AI Engine Architecture</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              - Question Generation & Evaluation Model: <strong className="text-slate-200 font-mono">gemini-3.8-flash</strong> (Server-side @google/genai SDK)<br />
              - Text-to-Speech Model: <strong className="text-slate-200 font-mono">gemini-3.8-flash-lite-tts</strong> (Charon voice persona)<br />
              - Speech Recognition: Web Speech API with fallback<br />
              - Fallback Safety: Curated question bank with heuristic grading engine when offline.
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
          >
            {saved ? <Check className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            <span>{saved ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
