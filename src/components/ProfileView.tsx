import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Award, 
  Clock, 
  Save, 
  Check, 
  Trash2, 
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { UserProfile, ExperienceLevel } from '../types';
import { StorageService } from '../services/storage';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user.experienceLevel);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      email,
      targetRole,
      experienceLevel,
    };
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all interview history and start fresh?')) {
      StorageService.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <User className="h-3.5 w-3.5" />
          <span>Candidate Information</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Candidate Profile & Career Targets
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your experience level, desired DevOps role, and target interview standards.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950 text-xl font-bold text-emerald-400">
                {name.charAt(0) || 'D'}
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{name}</h2>
              <p className="text-xs text-slate-400">{targetRole} · {experienceLevel} Years</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Readiness: {user.interviewReadinessScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior DevOps / Platform Engineer"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="fresher">Fresher (0 years)</option>
                <option value="1-2">1–2 years</option>
                <option value="3-5">3–5 years</option>
                <option value="5+">5+ years (Staff/Lead)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            <button
              type="submit"
              className="flex items-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaved ? 'Saved Successfully!' : 'Save Profile Changes'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Local History</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
