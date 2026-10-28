import { InterviewConfig, Question, AnswerEvaluation, InterviewQuestionExchange, InterviewResult } from '../types';
import { QUESTION_BANK } from '../data/questionBank';
import { SCENARIOS } from '../data/scenarios';

export const ApiService = {
  async generateQuestions(config: InterviewConfig): Promise<{ questions: Question[]; isDemoMode: boolean }> {
    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          return { questions: data.questions, isDemoMode: false };
        }
      }
    } catch (err) {
      console.warn('API error generating questions, falling back to offline question bank:', err);
    }

    // Curated fallback generator
    const curated = selectCuratedQuestions(config);
    return { questions: curated, isDemoMode: true };
  },

  async evaluateAnswer(params: {
    question: Question;
    userAnswer: string;
    topic: string;
    difficulty: string;
    experienceLevel: string;
    scenarioContext?: string;
  }): Promise<{ evaluation: AnswerEvaluation; isDemoMode: boolean }> {
    try {
      const res = await fetch('/api/gemini/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.evaluation) {
          return { evaluation: data.evaluation, isDemoMode: Boolean(data.fallback) };
        }
      }
    } catch (err) {
      console.warn('API error evaluating answer, using client fallback:', err);
    }

    // Client-side fallback if server unreachable
    return {
      evaluation: evaluateLocally(params.question, params.userAnswer),
      isDemoMode: true,
    };
  },

  async getHint(params: {
    question: Question;
    hintIndex: number;
    currentAnswerSoFar?: string;
  }): Promise<{ hint: string }> {
    try {
      const res = await fetch('/api/gemini/get-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hint) return { hint: data.hint };
      }
    } catch (err) {
      console.warn('API error getting hint:', err);
    }

    const defaultHints = params.question.hints || [
      'Focus on the standard CLI tools or configuration directives used for this problem.',
      'Consider the difference between runtime state and declarative definitions.',
      'Think about security, network boundaries, and logging output.',
    ];
    return { hint: defaultHints[Math.min(params.hintIndex, defaultHints.length - 1)] };
  },

  async generateSummary(params: {
    exchanges: InterviewQuestionExchange[];
    config: InterviewConfig;
  }): Promise<{ summary: Partial<InterviewResult>; isDemoMode: boolean }> {
    try {
      const res = await fetch('/api/gemini/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          return { summary: data.summary, isDemoMode: Boolean(data.fallback) };
        }
      }
    } catch (err) {
      console.warn('API error generating summary, using client calculation:', err);
    }

    return {
      summary: computeLocalSummary(params.exchanges, params.config),
      isDemoMode: true,
    };
  },

  async playSpeech(text: string, rate: number = 1.0): Promise<void> {
    const cleanText = text.replace(/[`*_#]/g, '').trim();

    // Try Gemini TTS first
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.playbackRate = rate;
          await audio.play();
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    // Web Speech API fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David')));
      if (englishVoice) utterance.voice = englishVoice;
      window.speechSynthesis.speak(utterance);
    }
  },

  stopSpeech(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};

function selectCuratedQuestions(config: InterviewConfig): Question[] {
  let pool: Question[] = [];

  if (config.interviewType === 'scenario') {
    pool = SCENARIOS.map((scen, idx) => ({
      id: scen.id,
      topic: 'troubleshooting' as const,
      difficulty: config.difficulty,
      question: `Troubleshooting Scenario: ${scen.title}. ${scen.description} How do you investigate, diagnose, and resolve this incident step by step?`,
      scenarioContext: scen.incidentBrief,
      hints: scen.investigationSteps.slice(0, 3),
      expectedKeywords: scen.diagnosticCommands.slice(0, 5),
      referenceAnswer: scen.expectedResolution,
      practicalCommand: scen.diagnosticCommands[0],
    }));
  } else {
    // Filter questions by selected topics
    pool = QUESTION_BANK.filter((q) => {
      const matchesTopic = config.topics.length === 0 || config.topics.includes(q.topic);
      return matchesTopic;
    });

    if (pool.length < config.questionCount) {
      pool = [...QUESTION_BANK];
    }
  }

  // Shuffle pool to ensure varied interview every time
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, config.questionCount);
}

function evaluateLocally(question: Question, answer: string): AnswerEvaluation {
  const answerLower = answer.toLowerCase();
  const keywords = question.expectedKeywords || [];
  let hits = 0;
  keywords.forEach((kw) => {
    if (answerLower.includes(kw.toLowerCase())) hits++;
  });

  const wordCount = answer.trim().split(/\s+/).length;
  const lengthBonus = Math.min(wordCount / 50, 1.0);
  const keywordRatio = keywords.length > 0 ? hits / keywords.length : 0.6;
  const raw = Math.round((keywordRatio * 6.5 + lengthBonus * 3.5) * 10) / 10;
  const score = Math.max(Math.min(raw, 9.8), 4.5);

  return {
    score,
    technicalCorrectnessScore: Math.min(score + 0.2, 10),
    clarityScore: Math.min(score + 0.4, 10),
    troubleshootingScore: Math.min(score, 10),
    answeredWell: [
      'Identified critical operational components and target systems.',
      wordCount > 30 ? 'Described troubleshooting steps in a coherent sequence.' : 'Directly targeted the core question intent.',
      hits > 0 ? `Mentioned key DevOps tools/terms: ${keywords.slice(0, 3).join(', ')}.` : 'Addressed common failure vectors.',
    ],
    missingPoints: [
      'Comprehensive verification and post-change testing steps.',
      'Specifying rollback conditions and blast radius containment.',
      'Logging, metrics, and alerting to detect future regressions.',
    ],
    areasToImprove: [
      'Be specific about command flags and configuration syntax.',
      'Always state what checks you run BEFORE and AFTER taking corrective action.',
    ],
    idealAnswer: question.referenceAnswer,
    practicalExampleOrCommand: question.practicalCommand || 'systemctl status <service> && journalctl -u <service> -n 50',
    followUpQuestion: 'How would you write an automated smoke test in CI/CD to prevent this issue from recurring?',
  };
}

function computeLocalSummary(exchanges: InterviewQuestionExchange[], config: InterviewConfig): Partial<InterviewResult> {
  const evaluated = exchanges.filter((e) => e.evaluation);
  const avg = evaluated.length > 0
    ? evaluated.reduce((s, e) => s + (e.evaluation?.score || 7), 0) / evaluated.length
    : 7.5;

  const totalScore = Math.min(Math.round(avg * 10), 100);

  const topicScores: Record<string, number> = {};
  exchanges.forEach((e) => {
    const t = e.question.topic;
    topicScores[t] = Math.min(Math.round((e.evaluation?.score || 7) * 10), 100);
  });

  return {
    totalScore,
    technicalScore: Math.min(Math.round(totalScore * 0.96), 100),
    troubleshootingScore: Math.min(Math.round(totalScore * 0.94), 100),
    communicationScore: Math.min(Math.round(totalScore * 1.02), 100),
    strongestTopics: ['Linux Administration', 'Docker Containers', 'CI/CD Pipelines'],
    topicsToImprove: ['Kubernetes Pod Lifecycle', 'AWS VPC Routing', 'Prometheus Alerting'],
    topicScores,
    sevenDayPlan: [
      {
        day: 1,
        title: 'Linux Deep Diagnostics',
        focusArea: 'Kernel ring buffer, lsof, /proc filesystem',
        tasks: ['Track deleted files held open by processes', 'Review oom_score_adj mechanism in systemd'],
        recommendedCommands: ['lsof +L1', 'cat /proc/sys/vm/swappiness'],
      },
      {
        day: 2,
        title: 'Kubernetes CrashLoop Investigation',
        focusArea: 'Exit codes, OOMKilled, startup probes',
        tasks: ['Configure startup probes for slow boot containers', 'Debug Service endpoints with kubectl get ep'],
        recommendedCommands: ['kubectl describe pod -l app=prod', 'kubectl logs -p'],
      },
      {
        day: 3,
        title: 'AWS Network Perimeters',
        focusArea: 'VPC Gateway Endpoints & NACLs',
        tasks: ['Audit route tables for private vs public routing', 'Implement AWS SSM Session Manager'],
        recommendedCommands: ['aws ec2 describe-route-tables'],
      },
      {
        day: 4,
        title: 'Terraform State Drift',
        focusArea: 'Remote backends, state locks, refresh-only',
        tasks: ['Simulate manual drift and reconcile with terraform plan', 'Practice safe force-unlock operations'],
        recommendedCommands: ['terraform plan -refresh-only'],
      },
      {
        day: 5,
        title: 'CI/CD & Canary Rollouts',
        focusArea: 'ArgoCD / Jenkins canary traffic shifting',
        tasks: ['Build automated rollback trigger on 5xx spike', 'Scan git commit history for leaked secrets'],
        recommendedCommands: ['kubectl rollout undo deployment/web'],
      },
      {
        day: 6,
        title: 'Observability & PromQL',
        focusArea: 'Rate calculations & error budget burn rates',
        tasks: ['Write histogram_quantile queries for P99 latency', 'Configure Alertmanager alert inhibition'],
        recommendedCommands: ['rate(http_requests_total[5m])'],
      },
      {
        day: 7,
        title: 'SRE Post-Mortem & Timed Drill',
        focusArea: 'Blameless RCA & full mock interview drill',
        tasks: ['Run 30-minute timed 5-question mock interview', 'Review missing technical points in history'],
        recommendedCommands: ['uptime', 'free -m', 'ss -tulpn'],
      },
    ],
    overallFeedbackSummary: 'Good performance across foundational DevOps topics. Solid diagnostic logic. Focus on precise command flags and automated rollback patterns.',
  };
}
