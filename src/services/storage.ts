import { UserProfile, InterviewResult, TopicId, ExperienceLevel } from '../types';

const STORAGE_KEYS = {
  USER: 'devops_ai_user',
  INTERVIEWS: 'devops_ai_interviews',
  BOOKMARKS: 'devops_ai_bookmarked_questions',
  THEME: 'devops_ai_theme',
  SETTINGS: 'devops_ai_settings',
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-default',
  name: 'Alex Mercer',
  email: 'alex.mercer@devops.cloud',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  experienceLevel: '3-5',
  targetRole: 'Senior DevOps / SRE Engineer',
  interviewReadinessScore: 78,
  interviewsCompleted: 4,
  questionsAnswered: 24,
  topicsMastered: ['linux', 'docker', 'cicd', 'git'],
  createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
};

export interface AppSettings {
  ttsEnabled: boolean;
  voiceRate: number;
  autoPlayAudio: boolean;
  theme: 'dark' | 'light';
  soundEffects: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  ttsEnabled: true,
  voiceRate: 1.0,
  autoPlayAudio: true,
  theme: 'dark',
  soundEffects: true,
};

export const StorageService = {
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage', e);
    }
    this.saveUser(DEFAULT_USER);
    return DEFAULT_USER;
  },

  saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user profile', e);
    }
  },

  getInterviews(): InterviewResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse interviews from localStorage', e);
    }
    return getSamplePastInterviews();
  },

  saveInterview(interview: InterviewResult): void {
    try {
      const current = this.getInterviews();
      const updated = [interview, ...current.filter((i) => i.id !== interview.id)];
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(updated));

      // Update user aggregate stats
      const user = this.getUser();
      user.interviewsCompleted = updated.length;
      user.questionsAnswered += interview.exchanges.length;

      // Recalculate dynamic readiness score (weighted moving average of last 5 interviews)
      const recentScores = updated.slice(0, 5).map((i) => i.totalScore);
      const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      user.interviewReadinessScore = Math.round(avg);

      // Update topics mastered
      const masterySet = new Set(user.topicsMastered);
      Object.entries(interview.topicScores || {}).forEach(([topic, score]) => {
        if (score >= 80) masterySet.add(topic as TopicId);
      });
      user.topicsMastered = Array.from(masterySet);

      this.saveUser(user);
    } catch (e) {
      console.warn('Failed to save interview result', e);
    }
  },

  getBookmarkedQuestions(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : ['linux-2', 'k8s-1', 'terraform-2'];
    } catch {
      return ['linux-2', 'k8s-1'];
    }
  },

  toggleBookmark(questionId: string): boolean {
    const list = this.getBookmarkedQuestions();
    let updated: string[];
    let isBookmarked = false;
    if (list.includes(questionId)) {
      updated = list.filter((id) => id !== questionId);
      isBookmarked = false;
    } else {
      updated = [...list, questionId];
      isBookmarked = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    return isBookmarked;
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.INTERVIEWS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  },
};

function getSamplePastInterviews(): InterviewResult[] {
  return [
    {
      id: 'mock-session-101',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      config: {
        experienceLevel: '3-5',
        interviewType: 'technical',
        topics: ['kubernetes', 'docker', 'linux'],
        difficulty: 'intermediate',
        questionCount: 3,
        durationMinutes: 15,
        enableAudioTTS: true,
        enableVoiceInput: true,
      },
      totalScore: 84,
      technicalScore: 88,
      troubleshootingScore: 82,
      communicationScore: 83,
      totalDurationSeconds: 740,
      exchanges: [
        {
          questionIndex: 0,
          question: {
            id: 'k8s-1',
            topic: 'kubernetes',
            difficulty: 'intermediate',
            question: 'A Kubernetes Pod is stuck in CrashLoopBackOff. Walk through your exact step-by-step troubleshooting workflow.',
            hints: ['kubectl describe pod', 'kubectl logs --previous'],
            expectedKeywords: ['describe', 'logs -p', 'exit code 137', 'OOMKilled'],
            referenceAnswer: 'Inspect pod events using kubectl describe, check previous container logs with -p flag, review memory limits and probe definitions.',
          },
          userAnswer: 'First I would run kubectl describe pod to see the events at the bottom and check the exit code. If it says 137, that means OOMKilled so memory limit is too low. Then I run kubectl logs with --previous to see why it terminated.',
          timeSpentSeconds: 180,
          hintsUsed: 1,
          evaluation: {
            score: 8.8,
            technicalCorrectnessScore: 9.0,
            clarityScore: 8.8,
            troubleshootingScore: 8.7,
            answeredWell: ['Rightly pointed out kubectl describe pod for events', 'Accurately recognized Exit Code 137 as OOMKilled', 'Used kubectl logs --previous properly'],
            missingPoints: ['Checking Liveness probe initialDelaySeconds', 'Inspecting ConfigMap or Secret volume mounts'],
            areasToImprove: ['Structure the response with systematic triage order before diving into remediation.'],
            idealAnswer: 'Start with kubectl describe pod to inspect Termination state and Events, check logs via -p, verify secrets/configs, and validate probes.',
            practicalExampleOrCommand: 'kubectl describe pod <name> && kubectl logs <name> --previous',
            followUpQuestion: 'How would you prevent similar OOM events cluster-wide without overprovisioning RAM?',
          },
        },
      ],
      strongestTopics: ['Kubernetes', 'Linux Administration'],
      topicsToImprove: ['Terraform Remote State', 'PromQL Rate Queries'],
      topicScores: {
        kubernetes: 88,
        linux: 85,
        docker: 80,
      },
      sevenDayPlan: [
        {
          day: 1,
          title: 'Linux Kernel & Systemd',
          focusArea: 'cgroups and memory debugging',
          tasks: ['Inspect /proc/sys/vm/overcommit_memory', 'Analyze memory leaks with valgrind or smem'],
          recommendedCommands: ['vmstat -s', 'free -h'],
        },
      ],
      overallFeedbackSummary: 'Demonstrated strong grasp of container orchestration and Kubernetes diagnostics. Strong candidate for mid-senior DevOps roles.',
    },
  ];
}
