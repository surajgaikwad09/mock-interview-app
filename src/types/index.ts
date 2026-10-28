export type ExperienceLevel = 'fresher' | '1-2' | '3-5' | '5+';

export type InterviewType = 
  | 'technical' 
  | 'scenario' 
  | 'hr' 
  | 'full';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type TopicId = 
  | 'linux'
  | 'aws'
  | 'git'
  | 'cicd'
  | 'docker'
  | 'kubernetes'
  | 'terraform'
  | 'ansible'
  | 'networking'
  | 'bash'
  | 'python'
  | 'monitoring'
  | 'troubleshooting'
  | 'sre';

export interface TopicInfo {
  id: TopicId;
  name: string;
  icon: string;
  description: string;
  tags: string[];
}

export interface InterviewConfig {
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  topics: TopicId[];
  difficulty: Difficulty;
  questionCount: number;
  durationMinutes: number;
  enableAudioTTS: boolean;
  enableVoiceInput: boolean;
}

export interface Question {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  question: string;
  scenarioContext?: string;
  hints: string[];
  expectedKeywords: string[];
  referenceAnswer: string;
  practicalCommand?: string;
}

export interface AnswerEvaluation {
  score: number; // 0 - 10
  answeredWell: string[];
  missingPoints: string[];
  areasToImprove: string[];
  idealAnswer: string;
  practicalExampleOrCommand?: string;
  followUpQuestion?: string;
  technicalCorrectnessScore: number; // 0 - 10
  clarityScore: number; // 0 - 10
  troubleshootingScore: number; // 0 - 10
}

export interface InterviewQuestionExchange {
  questionIndex: number;
  question: Question;
  userAnswer: string;
  timeSpentSeconds: number;
  hintsUsed: number;
  evaluation?: AnswerEvaluation;
  skipped?: boolean;
}

export interface DayStudyPlan {
  day: number;
  title: string;
  focusArea: string;
  tasks: string[];
  recommendedCommands: string[];
}

export interface InterviewResult {
  id: string;
  timestamp: number;
  config: InterviewConfig;
  totalScore: number; // 0 - 100
  technicalScore: number; // 0 - 100
  troubleshootingScore: number; // 0 - 100
  communicationScore: number; // 0 - 100
  totalDurationSeconds: number;
  exchanges: InterviewQuestionExchange[];
  strongestTopics: string[];
  topicsToImprove: string[];
  topicScores: Record<string, number>;
  sevenDayPlan: DayStudyPlan[];
  overallFeedbackSummary: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  experienceLevel: ExperienceLevel;
  targetRole: string;
  interviewReadinessScore: number;
  interviewsCompleted: number;
  questionsAnswered: number;
  topicsMastered: TopicId[];
  createdAt: number;
}
