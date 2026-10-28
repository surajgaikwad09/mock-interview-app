import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { UserProfile, ExperienceLevel } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('3-5');
  const [targetRole, setTargetRole] = useState('DevOps Engineer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name || (email.split('@')[0] || 'DevOps Candidate'),
      email: email || 'candidate@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      experienceLevel,
      targetRole,
      interviewReadinessScore: 72,
      interviewsCompleted: 1,
      questionsAnswered: 5,
      topicsMastered: ['linux', 'docker'],
      createdAt: Date.now(),
    };
    onLogin(newUser);
    onClose();
  };

  const handleDemoLogin = (exp: ExperienceLevel, role: string, demoName: string) => {
    const demoUser: UserProfile = {
      id: `usr-demo-${exp}`,
      name: demoName,
      email: `${demoName.toLowerCase().replace(' ', '.')}@devops.cloud`,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      experienceLevel: exp,
      targetRole: role,
      interviewReadinessScore: exp === 'fresher' ? 62 : exp === '1-2' ? 70 : exp === '3-5' ? 82 : 91,
      interviewsCompleted: exp === 'fresher' ? 2 : 5,
      questionsAnswered: exp === 'fresher' ? 10 : 28,
      topicsMastered: exp === 'fresher' ? ['linux', 'git'] : ['linux', 'aws', 'docker', 'kubernetes', 'cicd'],
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    };
    onLogin(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'signin' ? 'Welcome Back Candidate' : 'Create Candidate Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track interview transcripts, customized study plans, and diagnostic readiness scores.
          </p>
        </div>

        {/* Google One-Click Sign In */}
        <button
          type="button"
          onClick={() => handleDemoLogin('3-5', 'Senior SRE / DevOps Engineer', 'Alex Mercer')}
          className="mb-4 flex w-full items-center justify-center space-x-3 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 hover:border-slate-600 transition-all shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google Account</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or email login</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devops@engineer.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="fresher">Fresher (0 yr)</option>
                  <option value="1-2">1–2 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SRE"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-semibold text-slate-950 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/20"
          >
            {mode === 'signin' ? 'Sign In to Dashboard' : 'Register & Start Preparing'}
          </button>
        </form>

        {/* Quick Demo profiles */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Instant Demo Personas (No Password Needed)</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleDemoLogin('fresher', 'Junior DevOps Engineer', 'Sam Rivera')}
              className="text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 p-2 text-[11px] text-slate-300 transition-colors border border-slate-700/50"
            >
              <span className="font-semibold text-emerald-400 block">Fresher Candidate</span>
              <span className="text-[10px] text-slate-400">Zero experience drill</span>
            </button>
            <button
              onClick={() => handleDemoLogin('5+', 'Staff Site Reliability Engineer', 'Elena Rostova')}
              className="text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 p-2 text-[11px] text-slate-300 transition-colors border border-slate-700/50"
            >
              <span className="font-semibold text-cyan-400 block">Staff / Senior SRE</span>
              <span className="text-[10px] text-slate-400">Deep architecture drill</span>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-xs text-emerald-400 hover:underline"
          >
            {mode === 'signin' ? "Don't have an account? Sign up free" : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
