import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK safely
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);

let ai: GoogleGenAI | null = null;
if (hasGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey,
    timestamp: new Date().toISOString(),
  });
});

// 1. Generate Interview Questions
app.post('/api/gemini/generate-questions', async (req: Request, res: Response) => {
  const { experienceLevel, interviewType, topics, difficulty, questionCount } = req.body;
  const count = Math.min(Math.max(Number(questionCount) || 3, 1), 10);

  if (!ai || !hasGeminiKey) {
    return res.status(200).json({
      fallback: true,
      message: 'Using curated DevOps question bank (offline / demo mode).',
      questions: null,
    });
  }

  try {
    const prompt = `You are a Principal DevOps / SRE Engineering Interviewer conducting a realistic interview.
Candidate Profile:
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType} (technical, scenario, hr, or full mock)
- Topics Selected: ${Array.isArray(topics) ? topics.join(', ') : 'DevOps core'}
- Difficulty Target: ${difficulty}
- Number of Questions Needed: ${count}

Generate exactly ${count} distinct, high-quality, practical DevOps interview questions.
For scenario or troubleshooting questions, include a realistic production scenario context.
Avoid generic trivia questions; prefer real architecture, troubleshooting, CLI commands, and design trade-offs.

Output strictly valid JSON matching this schema:
An array of objects, each containing:
- id: string (unique)
- topic: string (one of: linux, aws, git, cicd, docker, kubernetes, terraform, ansible, networking, bash, python, monitoring, troubleshooting, sre)
- difficulty: string (beginner, intermediate, or advanced)
- question: string (the actual interviewer prompt spoken to candidate)
- scenarioContext: string (optional, brief context if this is a scenario question)
- hints: array of 3 progressive hint strings
- expectedKeywords: array of 5-8 key technical terms
- referenceAnswer: string (concise ideal technical answer)
- practicalCommand: string (optional command or config snippet)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              question: { type: Type.STRING },
              scenarioContext: { type: Type.STRING },
              hints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              expectedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              referenceAnswer: { type: Type.STRING },
              practicalCommand: { type: Type.STRING },
            },
            required: ['id', 'topic', 'difficulty', 'question', 'hints', 'expectedKeywords', 'referenceAnswer'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return res.json({ fallback: false, questions: parsed });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error?.message || error);
    return res.status(200).json({
      fallback: true,
      error: error?.message,
      questions: null,
    });
  }
});

// 2. Evaluate Candidate's Answer
app.post('/api/gemini/evaluate-answer', async (req: Request, res: Response) => {
  const { question, userAnswer, topic, difficulty, experienceLevel, scenarioContext } = req.body;

  if (!userAnswer || typeof userAnswer !== 'string' || userAnswer.trim().length === 0) {
    return res.status(400).json({ error: 'User answer is required' });
  }

  if (!ai || !hasGeminiKey) {
    // Intelligent heuristic evaluation fallback
    return res.json({
      fallback: true,
      evaluation: buildHeuristicEvaluation(question, userAnswer),
    });
  }

  try {
    const prompt = `You are a Principal DevOps Staff Engineer and hiring manager evaluating a candidate's answer during a technical interview.

Context:
- Candidate Experience Level: ${experienceLevel || '3-5 years'}
- Topic: ${topic || 'DevOps'}
- Difficulty: ${difficulty || 'intermediate'}
- Question Asked: "${question.question || question}"
${scenarioContext ? `- Scenario Context: ${scenarioContext}` : ''}
${question.referenceAnswer ? `- Expected reference answer points: "${question.referenceAnswer}"` : ''}

Candidate's Answer:
"${userAnswer}"

Evaluation Rules:
1. Fair and objective: Accept technically correct alternative explanations, different tooling (e.g. Helm vs Kustomize, GitLab vs Jenkins), or reasonable wording.
2. Score out of 10 based on: technical correctness, practical depth, troubleshooting approach, and communication clarity.
3. Explicitly list:
   - What the candidate answered well (bullet points of sound reasoning and correct terminology).
   - Missing technical points (what a senior DevOps engineer would have mentioned).
   - Areas to improve (e.g., edge cases, security considerations, rollback plan, metrics/observability).
   - A suggested ideal answer in simple, human-readable English.
   - One practical command or configuration snippet when relevant.
   - A follow-up interview question to probe deeper.
4. Provide sub-scores out of 10 for:
   - technicalCorrectnessScore (0-10)
   - clarityScore (0-10)
   - troubleshootingScore (0-10)

Return strictly JSON matching this structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Overall score from 0 to 10' },
            technicalCorrectnessScore: { type: Type.NUMBER },
            clarityScore: { type: Type.NUMBER },
            troubleshootingScore: { type: Type.NUMBER },
            answeredWell: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            areasToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            idealAnswer: { type: Type.STRING },
            practicalExampleOrCommand: { type: Type.STRING },
            followUpQuestion: { type: Type.STRING },
          },
          required: [
            'score',
            'technicalCorrectnessScore',
            'clarityScore',
            'troubleshootingScore',
            'answeredWell',
            'missingPoints',
            'areasToImprove',
            'idealAnswer',
            'followUpQuestion',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ fallback: false, evaluation: parsed });
  } catch (error: any) {
    console.error('Error evaluating answer with Gemini:', error?.message || error);
    return res.json({
      fallback: true,
      error: error?.message,
      evaluation: buildHeuristicEvaluation(question, userAnswer),
    });
  }
});

// 3. Progressive Hints
app.post('/api/gemini/get-hint', async (req: Request, res: Response) => {
  const { question, hintIndex, currentAnswerSoFar } = req.body;

  if (!ai || !hasGeminiKey) {
    const defaultHints = question?.hints || [
      'Focus on the standard CLI tools or configuration directives used for this problem.',
      'Consider the difference between runtime state and declarative definitions.',
      'Think about security, network boundaries, and logging output.',
    ];
    return res.json({
      fallback: true,
      hint: defaultHints[Math.min(hintIndex || 0, defaultHints.length - 1)],
    });
  }

  try {
    const prompt = `You are a supportive technical interviewer. The candidate is stuck on this DevOps question:
"${question.question || question}"
${question.scenarioContext ? `Scenario: ${question.scenarioContext}` : ''}
Candidate's partial thought so far: "${currentAnswerSoFar || 'None yet'}"
This is Hint level ${Number(hintIndex || 0) + 1} of 3.
Give a concise, encouraging hint (1-2 sentences) that nudges the candidate towards the right direction without revealing the complete solution directly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ fallback: false, hint: response.text?.trim() });
  } catch (error: any) {
    return res.json({
      fallback: true,
      hint: question?.hints?.[hintIndex || 0] || 'Consider inspecting logs, network connectivity, and state files first.',
    });
  }
});

// 4. End-of-Interview Comprehensive Summary & 7-Day Plan
app.post('/api/gemini/generate-summary', async (req: Request, res: Response) => {
  const { exchanges, config } = req.body;

  if (!ai || !hasGeminiKey) {
    return res.json({
      fallback: true,
      summary: buildHeuristicSummary(exchanges, config),
    });
  }

  try {
    const summaryPrompt = `You are a Principal DevOps Staff Engineer generating a comprehensive interview report for a candidate.
Interview Configuration:
- Experience Level: ${config?.experienceLevel || '3-5 years'}
- Target Type: ${config?.interviewType || 'Full DevOps Mock'}
- Questions Answered: ${exchanges?.length || 0}

Candidate's Question Exchanges and Scores:
${JSON.stringify(
  exchanges.map((e: any, idx: number) => ({
    qIndex: idx + 1,
    topic: e.question?.topic,
    question: e.question?.question,
    userAnswer: e.userAnswer,
    score: e.evaluation?.score,
    technicalScore: e.evaluation?.technicalCorrectnessScore,
    troubleshootingScore: e.evaluation?.troubleshootingScore,
  })),
  null,
  2
)}

Compute and generate:
1. Total score out of 100 (aggregated from performance).
2. Technical knowledge score out of 100.
3. Troubleshooting score out of 100.
4. Communication score out of 100.
5. Strongest topics (names of DevOps areas where candidate excelled).
6. Topics to improve (areas needing study).
7. Topic scores object mapping topic name to a score 0-100.
8. A personalized 7-Day Study Plan with actionable items for each day (Day 1 through Day 7) focusing on weak spots.
9. Overall feedback summary in constructive, professional tone. Clearly note that AI scores are estimates, not official hiring decisions.

Return strictly JSON matching this structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: summaryPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.NUMBER },
            technicalScore: { type: Type.NUMBER },
            troubleshootingScore: { type: Type.NUMBER },
            communicationScore: { type: Type.NUMBER },
            strongestTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            topicsToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            topicScores: {
              type: Type.OBJECT,
              description: 'Key value map of topic names to numeric score 0-100',
            },
            sevenDayPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedCommands: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['day', 'title', 'focusArea', 'tasks', 'recommendedCommands'],
              },
            },
            overallFeedbackSummary: { type: Type.STRING },
          },
          required: [
            'totalScore',
            'technicalScore',
            'troubleshootingScore',
            'communicationScore',
            'strongestTopics',
            'topicsToImprove',
            'sevenDayPlan',
            'overallFeedbackSummary',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ fallback: false, summary: parsed });
  } catch (error: any) {
    console.error('Error generating summary with Gemini:', error?.message || error);
    return res.json({
      fallback: true,
      summary: buildHeuristicSummary(exchanges, config),
    });
  }
});

// 5. Spoken Interviewer Audio via Gemini TTS
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  if (!ai || !hasGeminiKey) {
    return res.status(200).json({
      fallback: true,
      message: 'Gemini TTS unavailable; using browser Web Speech API fallback.',
    });
  }

  try {
    const cleanText = text.replace(/[`*_#]/g, '').slice(0, 500);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Professional, articulate, calm senior engineering interviewer',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ fallback: false, audioBase64: base64Audio });
    }
    return res.json({ fallback: true });
  } catch (error: any) {
    console.error('Error generating TTS:', error?.message || error);
    return res.json({ fallback: true, error: error?.message });
  }
});

// Heuristic Fallback Evaluator when API key is not present or offline
function buildHeuristicEvaluation(question: any, userAnswer: string) {
  const answerLower = userAnswer.toLowerCase();
  const expectedKeywords: string[] = question?.expectedKeywords || [];

  let matchedKeywords = 0;
  expectedKeywords.forEach((kw) => {
    if (answerLower.includes(kw.toLowerCase())) {
      matchedKeywords++;
    }
  });

  const lengthFactor = Math.min(userAnswer.split(/\s+/).length / 40, 1.2);
  const keywordRatio = expectedKeywords.length > 0 ? matchedKeywords / expectedKeywords.length : 0.6;
  const rawScore = Math.min(Math.round((keywordRatio * 7 + lengthFactor * 3) * 10) / 10, 10);
  const score = Math.max(rawScore, 4.0);

  const answeredWell = [
    'Addressed the fundamental intent of the interview question.',
    userAnswer.length > 80 ? 'Provided a structured step-by-step technical explanation.' : 'Directly targeted core operational concepts.',
  ];
  if (matchedKeywords > 0) {
    answeredWell.push(`Accurately highlighted key DevOps terminology: ${expectedKeywords.slice(0, 3).join(', ')}.`);
  }

  const missingPoints = [
    'Deep dive into operational failure modes and edge case handling.',
    'Mentioning observability metrics, alert thresholds, and log aggregation.',
    'Security considerations such as principle of least privilege and secrets rotation.',
  ];

  const areasToImprove = [
    'Practice explaining the exact command flags (e.g. -p, -f, -v, --dry-run).',
    'Structure answers with SRE methodology: Detect -> Mitigate -> Resolve -> Post-mortem.',
    'Be explicit about rollback strategies before executing breaking changes in production.',
  ];

  return {
    score,
    technicalCorrectnessScore: Math.min(Math.round((score * 0.95 + 0.3) * 10) / 10, 10),
    clarityScore: Math.min(Math.round((score * 1.0) * 10) / 10, 10),
    troubleshootingScore: Math.min(Math.round((score * 0.9 + 0.5) * 10) / 10, 10),
    answeredWell,
    missingPoints,
    areasToImprove,
    idealAnswer: question?.referenceAnswer || 'In production, verify service status using systemd/kubectl, inspect logs for error signatures, isolate network routes and security groups, and ensure atomic rollbacks if health checks fail.',
    practicalExampleOrCommand: question?.practicalCommand || 'kubectl logs -l app=service --tail=100 -f',
    followUpQuestion: 'How would you automate this recovery process and alert the on-call team using Prometheus Alertmanager or Datadog?',
  };
}

function buildHeuristicSummary(exchanges: any[], config: any) {
  const validExchanges = exchanges.filter((e) => e.evaluation);
  const avgScore = validExchanges.length > 0
    ? validExchanges.reduce((acc, curr) => acc + (curr.evaluation?.score || 6), 0) / validExchanges.length
    : 7.5;

  const totalScore = Math.min(Math.round(avgScore * 10), 100);
  const technicalScore = Math.min(Math.round(totalScore * 0.98), 100);
  const troubleshootingScore = Math.min(Math.round(totalScore * 0.94), 100);
  const communicationScore = Math.min(Math.round(totalScore * 1.02), 100);

  const topicScores: Record<string, number> = {};
  exchanges.forEach((e) => {
    const topic = e.question?.topic || 'General DevOps';
    topicScores[topic] = Math.min(Math.round((e.evaluation?.score || 7) * 10), 100);
  });

  return {
    totalScore,
    technicalScore,
    troubleshootingScore,
    communicationScore,
    strongestTopics: ['Linux Administration', 'Containerization & Docker', 'CI/CD Pipelines'],
    topicsToImprove: ['Kubernetes CrashLoop Diagnosis', 'Terraform State Drift', 'PromQL Alerting'],
    topicScores,
    sevenDayPlan: [
      {
        day: 1,
        title: 'Linux Kernel & Process Troubleshooting',
        focusArea: 'Linux Inodes, OOM-Killer, and Systemd',
        tasks: [
          'Practice tracking unlinked files held open by processes with lsof +L1',
          'Inspect kernel ring buffer with dmesg -T and understand oom_score_adj',
          'Write custom systemd service override files with resource limits',
        ],
        recommendedCommands: ['lsof +L1 | grep deleted', 'journalctl -k -g "Out of memory"', 'systemctl edit --full myapp'],
      },
      {
        day: 2,
        title: 'Kubernetes Debugging & Pod Lifecycle',
        focusArea: 'CrashLoopBackOff & Probe Engineering',
        tasks: [
          'Simulate OOMKilled Exit Code 137 in a test minikube/kind pod',
          'Tune startup probes for slow JVM and Spring Boot services',
          'Debug Service endpoint drops with kubectl get endpoints -w',
        ],
        recommendedCommands: ['kubectl describe pod -l app=api', 'kubectl logs --previous -p', 'kubectl top nodes --use-protocol-buffers'],
      },
      {
        day: 3,
        title: 'AWS Cloud Networking & Security Perimeters',
        focusArea: 'VPC Routing, Security Groups & Gateway Endpoints',
        tasks: [
          'Audit subnet route tables and NAT Gateway redundancy per AZ',
          'Configure free S3 VPC Gateway Endpoints to eliminate NAT egress costs',
          'Review AWS SSM Session Manager setup to replace direct port 22 SSH',
        ],
        recommendedCommands: ['aws ec2 describe-route-tables', 'aws ssm start-session --target <i-id>'],
      },
      {
        day: 4,
        title: 'Terraform State Management & Drift Reconciliation',
        focusArea: 'IaC Remote Backends, State Locking & Modules',
        tasks: [
          'Practice resolving state locks safely without data corruption',
          'Run terraform plan -refresh-only to detect manual console modifications',
          'Refactor hardcoded resources into reusable module patterns',
        ],
        recommendedCommands: ['terraform state list', 'terraform plan -refresh-only', 'terraform force-unlock <ID>'],
      },
      {
        day: 5,
        title: 'CI/CD Pipeline Security & Deployment Strategies',
        focusArea: 'Canary Releases, Blue/Green & Secret Management',
        tasks: [
          'Build declarative multi-stage Jenkinsfile with post-actions',
          'Implement automated rollback triggers when canary HTTP 5xx exceeds 1%',
          'Integrate secret scanning (git-secrets, Trufflehog) into pull request checks',
        ],
        recommendedCommands: ['trufflehog git file://. --since-commit HEAD~5', 'kubectl rollout undo deployment/api'],
      },
      {
        day: 6,
        title: 'Prometheus, PromQL & Incident Alerting',
        focusArea: 'Multi-Window Multi-Burn-Rate Alerts & SLOs',
        tasks: [
          'Write PromQL queries for P95 and P99 latency using histogram_quantile()',
          'Calculate error budget burn rate over 1h and 6h windows',
          'Set up Alertmanager routing rules with inhibition to avoid alert storms',
        ],
        recommendedCommands: ['rate(http_requests_total[5m])', 'histogram_quantile(0.95, sum(rate(http_duration_bucket[5m])) by (le))'],
      },
      {
        day: 7,
        title: 'SRE Post-Mortem & Full Mock Interview',
        focusArea: 'Blameless RCAs, 5 Whys & Timed Interview Drill',
        tasks: [
          'Draft a blameless post-mortem for a 502 Bad Gateway incident',
          'Conduct a full 10-question timed interview simulation under 30 minutes',
          'Review weak answers and refine concise technical communication',
        ],
        recommendedCommands: ['uptime', 'vmstat 1 5', 'ss -s'],
      },
    ],
    overallFeedbackSummary: 'The candidate demonstrates solid grasp of baseline DevOps concepts. With targeted focus on multi-stage incident diagnostics, deep Linux kernel internals, and automated rollback architectures, they are well on track for mid-to-senior DevOps engineering interviews.',
  };
}

// Development and Production server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DevOps AI Interview Coach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
