import React, { useState } from 'react';
import { 
  PlayCircle, 
  Clock, 
  HelpCircle, 
  Volume2, 
  Mic, 
  Check, 
  Terminal, 
  Sparkles, 
  Layers, 
  Sliders, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  InterviewConfig, 
  ExperienceLevel, 
  InterviewType, 
  Difficulty, 
  TopicId 
} from '../types';
import { TOPICS } from '../data/topics';

interface SetupViewProps {
  onStart: (config: InterviewConfig) => void;
  initialExperience?: ExperienceLevel;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStart, initialExperience = '3-5' }) => {
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialExperience);
  const [interviewType, setInterviewType] = useState<InterviewType>('full');
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>([
    'linux',
    'aws',
    'docker',
    'kubernetes',
    'cicd',
    'terraform',
    'troubleshooting'
  ]);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [enableAudioTTS, setEnableAudioTTS] = useState<boolean>(true);
  const [enableVoiceInput, setEnableVoiceInput] = useState<boolean>(true);

  const toggleTopic = (id: TopicId) => {
    if (selectedTopics.includes(id)) {
      if (selectedTopics.length === 1) return; // keep at least one
      setSelectedTopics(selectedTopics.filter((t) => t !== id));
    } else {
      setSelectedTopics([...selectedTopics, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedTopics(TOPICS.map((t) => t.id));
  };

  const handleClearSelection = () => {
    setSelectedTopics(['linux', 'kubernetes', 'troubleshooting']);
  };

  const handleLaunch = () => {
    onStart({
      experienceLevel,
      interviewType,
      topics: selectedTopics,
      difficulty,
      questionCount,
      durationMinutes,
      enableAudioTTS,
      enableVoiceInput,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Sliders className="h-3.5 w-3.5" />
          <span>Interview Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Configure Your DevOps Mock Interview
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Customize difficulty, domain topics, and duration. The AI interviewer adapts dynamically based on your responses.
        </p>
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-xl">
        {/* 1. Experience Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            1. Candidate Experience Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'fresher', label: 'Fresher', sub: '0 years / Entry' },
              { id: '1-2', label: '1–2 Years', sub: 'Junior DevOps' },
              { id: '3-5', label: '3–5 Years', sub: 'Mid-Senior DevOps' },
              { id: '5+', label: '5+ Years', sub: 'Staff / Principal / SRE' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setExperienceLevel(item.id as ExperienceLevel)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
                  experienceLevel === item.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/15'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-bold text-white">{item.label}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interview Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Interview Type & Focus
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'technical',
                title: 'Technical Interview',
                desc: 'Architecture, command flags, internals, and IaC design.',
                color: 'emerald',
              },
              {
                id: 'scenario',
                title: 'Scenario-Based',
                desc: 'Real production outages: 502s, CrashLoop, high CPU, disk full.',
                color: 'amber',
              },
              {
                id: 'hr',
                title: 'HR & Behavioral',
                desc: 'Incident leadership, on-call culture, conflict resolution.',
                color: 'indigo',
              },
              {
                id: 'full',
                title: 'Full DevOps Mock',
                desc: 'Comprehensive mix of technical, scenario, and behavioral questions.',
                color: 'cyan',
              },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setInterviewType(type.id as InterviewType)}
                className={`flex flex-col text-left rounded-2xl border p-4 transition-all ${
                  interviewType === type.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/15'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-bold text-white">{type.title}</span>
                <span className="text-xs text-slate-400 mt-1">{type.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Topics Multi-Select */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Target Topics ({selectedTopics.length} Selected)
            </label>
            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-emerald-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-slate-400 hover:text-slate-200"
              >
                Reset Core
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex items-center space-x-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    isSelected
                      ? 'border-emerald-500/80 bg-emerald-500/15 text-white font-medium shadow-sm'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{topic.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Difficulty Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            4. Difficulty Target
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'beginner', label: 'Beginner', sub: 'Foundations & Common Tools' },
              { id: 'intermediate', label: 'Intermediate', sub: 'Real Architecture & Flags' },
              { id: 'advanced', label: 'Advanced', sub: 'Kernel, Scale & Disaster Recovery' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDifficulty(item.id as Difficulty)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                  difficulty === item.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/15'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-bold text-white">{item.label}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Duration & Questions Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Number of Questions: <span className="text-emerald-400 font-bold">{questionCount} questions</span>
            </label>
            <div className="flex items-center space-x-2">
              {[3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                    questionCount === num
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Duration Target: <span className="text-emerald-400 font-bold">{durationMinutes} Minutes</span>
            </label>
            <div className="flex items-center space-x-2">
              {[10, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                    durationMinutes === mins
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio / Voice Options */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-emerald-400" />
                <span>Interactivity: Speech & Audio Options</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Spoken questions via AI Text-to-Speech and voice dictation via browser Speech API.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={enableAudioTTS}
                  onChange={(e) => setEnableAudioTTS(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Voice Audio (TTS)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={enableVoiceInput}
                  onChange={(e) => setEnableVoiceInput(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Microphone Dictation</span>
              </label>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleLaunch}
            className="flex w-full items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-4 text-sm sm:text-base font-extrabold text-slate-950 hover:opacity-95 transition-all shadow-xl shadow-emerald-500/25 active:scale-[0.99]"
          >
            <PlayCircle className="h-5 w-5" />
            <span>Launch Live Interview Room</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
