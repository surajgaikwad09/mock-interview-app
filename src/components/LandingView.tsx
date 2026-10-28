import React, { useState } from 'react';
import { 
  PlayCircle, 
  Terminal, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Lock,
  GitBranch,
  Boxes,
  Zap
} from 'lucide-react';
import { TOPICS } from '../data/topics';

interface LandingViewProps {
  onStartInterview: () => void;
  onExploreQuestions: () => void;
  onOpenScenarios: () => void;
  onOpenAuth: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartInterview,
  onExploreQuestions,
  onOpenScenarios,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'k8s' | 'linux' | 'aws'>('k8s');

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[400px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
          <div className="h-[300px] w-[500px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        </div>

        <div className="mx-auto max-w-4xl space-y-6 px-4">
          <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Autonomous DevOps Screening · Gemini 3.8</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Master Senior DevOps Interviews with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Realistic AI Simulations
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Practice real-world production outages, architectural trade-offs, and live CLI diagnostics. Receive instant 10-point scoring, what you answered well, missing technical nuances, and a personalized 7-day study roadmap.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartInterview}
              className="flex items-center space-x-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-sm sm:text-base font-extrabold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
            >
              <PlayCircle className="h-5 w-5" />
              <span>Start Free Mock Interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenScenarios}
              className="flex items-center space-x-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-slate-700 transition-all shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Production Incident Lab</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Voice Speech + Typed Answers</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>14 DevOps & SRE Domains</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>Zero-Setup Demo Mode Included</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Live Terminal Showcase */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">devops-interview-session-p1-outage.sh</span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('k8s')}
                className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                  activeTab === 'k8s' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kubernetes CrashLoop
              </button>
              <button
                onClick={() => setActiveTab('linux')}
                className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                  activeTab === 'linux' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Linux Deleted FD
              </button>
              <button
                onClick={() => setActiveTab('aws')}
                className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                  activeTab === 'aws' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                AWS SSH Timeout
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-xs text-slate-300 space-y-4 bg-slate-950/90">
            {activeTab === 'k8s' && (
              <>
                <p className="text-slate-500"># Interviewer asks: "Your worker pod is restarting repeatedly. How do you isolate the issue?"</p>
                <div className="text-emerald-400">$ kubectl describe pod worker-7b89d-x92zk | grep -A 5 "Last State"</div>
                <div className="text-slate-400 pl-4">
                  Last State:     Terminated<br />
                  &nbsp;&nbsp;Reason:         OOMKilled<br />
                  &nbsp;&nbsp;Exit Code:      137 (128 + 9 SIGKILL)
                </div>
                <div className="text-emerald-400">$ kubectl logs worker-7b89d-x92zk --previous --tail=20</div>
                <div className="text-cyan-400 pl-4">
                  [Celery Worker] Processing batch invoice export #99102...<br />
                  [Celery Worker] Loading 450,000 records into memory...<br />
                  [Kubelet] cgroup memory limit 512Mi reached, process killed.
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-slate-200 mt-2">
                  <span className="text-emerald-400 font-bold">AI Coach Evaluation: 9.5/10</span>
                  <p className="mt-1 font-sans text-xs">
                    "Excellent identification of Exit Code 137 and proper usage of --previous flag. Good recommendation to stream data rather than buffering in memory."
                  </p>
                </div>
              </>
            )}

            {activeTab === 'linux' && (
              <>
                <p className="text-slate-500"># Interviewer asks: "df -h shows / at 100%, but rm deleted the 20GB log file. Why is space not freed?"</p>
                <div className="text-emerald-400">$ sudo lsof +L1 | grep deleted</div>
                <div className="text-slate-400 pl-4">
                  COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NLINK NODE NAME<br />
                  nginx    1429 root    3w   REG    8,1 21474836480     0 41920 /var/log/nginx/access.log (deleted)
                </div>
                <div className="text-emerald-400">$ : &gt; /proc/1429/fd/3 && df -h /</div>
                <div className="text-cyan-400 pl-4">
                  Filesystem      Size  Used Avail Use% Mounted on<br />
                  /dev/sda1        50G   28G   22G  56% /
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-slate-200 mt-2">
                  <span className="text-emerald-400 font-bold">AI Coach Evaluation: 9.8/10</span>
                  <p className="mt-1 font-sans text-xs">
                    "Mastery of Linux inode unlinking and open file descriptors. Zero-downtime truncation via /proc without restarting NGINX."
                  </p>
                </div>
              </>
            )}

            {activeTab === 'aws' && (
              <>
                <p className="text-slate-500"># Interviewer asks: "SSH connection to EC2 bastion times out. How do you troubleshoot?"</p>
                <div className="text-emerald-400">$ ssh -vvv user@54.210.12.34 -p 22</div>
                <div className="text-amber-400 pl-4">
                  debug1: Connecting to 54.210.12.34 [54.210.12.34] port 22.<br />
                  ssh: connect to host 54.210.12.34 port 22: Connection timed out
                </div>
                <div className="text-emerald-400">$ aws ssm start-session --target i-0123456789abcdef0</div>
                <div className="text-cyan-400 pl-4">
                  Starting session with SessionManagerPlugin... Connected to Amazon Linux 2023.
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-slate-200 mt-2">
                  <span className="text-emerald-400 font-bold">AI Coach Evaluation: 9.4/10</span>
                  <p className="mt-1 font-sans text-xs">
                    "Recognized 'Connection timed out' as packet drop at Security Group/NACL level and bypassed SSH using AWS SSM Session Manager."
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mx-auto max-w-6xl px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built by Senior DevOps Engineers for Candidates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to turn ambiguous technical rounds into confident offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white">Adaptive Difficulty Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              From freshers to Staff SREs, questions dynamically adjust to probe your deepest competencies and edge case handling.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white">Production Outage Drills</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step into high-stakes P1 alerts. Practice root cause analysis, MTTR reduction, rollback mechanics, and blameless post-mortems.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-indigo-500/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white">Personalized 7-Day Roadmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive a concrete day-by-day study calendar targeting the exact concepts and CLI commands where you lost points.
            </p>
          </div>
        </div>
      </div>

      {/* 14 Domain Badges Carousel */}
      <div className="mx-auto max-w-6xl px-4 space-y-4">
        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Comprehensive Syllabus Coverage</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={onExploreQuestions}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-emerald-500/40 hover:text-white transition-colors"
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Ace Your Next DevOps Round?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Start a 15-minute mock interview right now. Zero setup required, works with voice and typed responses.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onStartInterview}
              className="flex items-center space-x-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <PlayCircle className="h-5 w-5" />
              <span>Launch Mock Interview Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
