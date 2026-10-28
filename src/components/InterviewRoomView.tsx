import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  HelpCircle, 
  Send, 
  SkipForward, 
  XOctagon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Copy, 
  Check, 
  Code2, 
  ChevronRight, 
  Terminal,
  MessageSquare,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  InterviewConfig, 
  Question, 
  AnswerEvaluation, 
  InterviewQuestionExchange, 
  InterviewResult 
} from '../types';
import { ApiService } from '../services/api';
import { SoundEffects } from '../utils/audio';

interface InterviewRoomViewProps {
  config: InterviewConfig;
  questions: Question[];
  onComplete: (result: InterviewResult) => void;
  onExit: () => void;
  soundEnabled: boolean;
}

export const InterviewRoomView: React.FC<InterviewRoomViewProps> = ({
  config,
  questions,
  onComplete,
  onExit,
  soundEnabled,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [exchanges, setExchanges] = useState<InterviewQuestionExchange[]>([]);
  
  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(config.durationMinutes * 60);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);

  // Audio / Speech states
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex] || questions[0];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListeningMic(false);
      };

      rec.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      ApiService.stopSpeech();
    };
  }, []);

  // Main countdown timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleFinishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, []);

  // Read question aloud when question changes if TTS enabled
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setUserAnswer('');
    setCurrentEvaluation(null);
    setCurrentHint(null);
    setHintsUsedCount(0);

    if (config.enableAudioTTS && currentQuestion) {
      handleSpeakQuestion(currentQuestion.question);
    }
  }, [currentIndex]);

  const handleSpeakQuestion = async (text: string) => {
    setIsPlayingAudio(true);
    await ApiService.playSpeech(text);
    setIsPlayingAudio(false);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (e) {
        console.warn('Mic start failed:', e);
      }
    }
  };

  const handleRequestHint = async () => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    if (soundEnabled) SoundEffects.playChime('hint');

    const nextHintIdx = hintsUsedCount;
    const res = await ApiService.getHint({
      question: currentQuestion,
      hintIndex: nextHintIdx,
      currentAnswerSoFar: userAnswer,
    });

    setCurrentHint(res.hint);
    setHintsUsedCount((prev) => prev + 1);
    setIsLoadingHint(false);
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    if (soundEnabled) SoundEffects.playChime('click');

    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    }

    const res = await ApiService.evaluateAnswer({
      question: currentQuestion,
      userAnswer: userAnswer.trim(),
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      experienceLevel: config.experienceLevel,
      scenarioContext: currentQuestion.scenarioContext,
    });

    setCurrentEvaluation(res.evaluation);
    setIsEvaluating(false);
    if (soundEnabled) SoundEffects.playChime('success');

    // Record exchange
    const timeSpent = Math.max(Math.round((Date.now() - questionStartTime) / 1000), 5);
    const exchange: InterviewQuestionExchange = {
      questionIndex: currentIndex,
      question: currentQuestion,
      userAnswer: userAnswer.trim(),
      timeSpentSeconds: timeSpent,
      hintsUsed: hintsUsedCount,
      evaluation: res.evaluation,
    };

    setExchanges((prev) => [...prev, exchange]);
  };

  const handleSkipQuestion = () => {
    if (soundEnabled) SoundEffects.playChime('click');
    const timeSpent = Math.max(Math.round((Date.now() - questionStartTime) / 1000), 5);
    const exchange: InterviewQuestionExchange = {
      questionIndex: currentIndex,
      question: currentQuestion,
      userAnswer: '(Skipped by candidate)',
      timeSpentSeconds: timeSpent,
      hintsUsed: hintsUsedCount,
      skipped: true,
      evaluation: {
        score: 0,
        technicalCorrectnessScore: 0,
        clarityScore: 0,
        troubleshootingScore: 0,
        answeredWell: [],
        missingPoints: ['Question was skipped without an answer.'],
        areasToImprove: ['Review this topic in the question bank.'],
        idealAnswer: currentQuestion.referenceAnswer,
        practicalExampleOrCommand: currentQuestion.practicalCommand,
        followUpQuestion: 'Would you like to revisit the core principles of this domain?',
      },
    };

    const updated = [...exchanges, exchange];
    setExchanges(updated);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishInterview(updated);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishInterview();
    }
  };

  const handleFinishInterview = async (finalExchanges?: InterviewQuestionExchange[]) => {
    clearInterval(timerIntervalRef.current);
    ApiService.stopSpeech();
    if (soundEnabled) SoundEffects.playChime('complete');

    const completedExchanges = finalExchanges || exchanges;
    
    // Generate overall end-of-interview summary
    const summaryRes = await ApiService.generateSummary({
      exchanges: completedExchanges,
      config,
    });

    const summary = summaryRes.summary;

    const result: InterviewResult = {
      id: `interview-${Date.now()}`,
      timestamp: Date.now(),
      config,
      totalScore: summary.totalScore || 78,
      technicalScore: summary.technicalScore || 80,
      troubleshootingScore: summary.troubleshootingScore || 75,
      communicationScore: summary.communicationScore || 80,
      totalDurationSeconds: config.durationMinutes * 60 - secondsRemaining,
      exchanges: completedExchanges,
      strongestTopics: summary.strongestTopics || ['Linux Administration', 'Docker'],
      topicsToImprove: summary.topicsToImprove || ['Kubernetes CrashLoop', 'PromQL'],
      topicScores: summary.topicScores || {},
      sevenDayPlan: summary.sevenDayPlan || [],
      overallFeedbackSummary: summary.overallFeedbackSummary || 'Solid technical performance. Continue refining SRE runbook structure.',
    };

    onComplete(result);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Top HUD: Interviewer Status, Timer, Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur-md shadow-lg gap-4">
        {/* Interviewer Persona */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Terminal className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            {isPlayingAudio && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">Alex · Principal DevOps Interviewer</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Live Session
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {config.experienceLevel} Level · {config.difficulty} · {config.interviewType}
            </p>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2 rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800">
            <Clock className={`h-4 w-4 ${secondsRemaining < 180 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span className={`font-mono text-sm font-bold ${secondsRemaining < 180 ? 'text-rose-400' : 'text-white'}`}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSpeakQuestion(currentQuestion.question)}
              title={isPlayingAudio ? 'Speaking...' : 'Replay question audio'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {isPlayingAudio ? <VolumeX className="h-4 w-4 text-emerald-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <button
              onClick={() => handleFinishInterview()}
              className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors"
            >
              <XOctagon className="h-3.5 w-3.5" />
              <span>End Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Question <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{questions.length}</strong></span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              {currentQuestion.topic}
            </span>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold uppercase text-slate-300">
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isLoadingHint || hintsUsedCount >= 3}
              onClick={handleRequestHint}
              className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                hintsUsedCount >= 3
                  ? 'border-slate-800 text-slate-600 bg-slate-950/40 cursor-not-allowed'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>
                {isLoadingHint ? 'Generating Hint...' : hintsUsedCount === 0 ? 'Request Hint' : `Hint (${hintsUsedCount}/3)`}
              </span>
            </button>
          </div>
        </div>

        {/* Scenario Context (if present) */}
        {currentQuestion.scenarioContext && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">Incident Scenario Context:</strong>
            {currentQuestion.scenarioContext}
          </div>
        )}

        {/* The Spoken Question */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            "{currentQuestion.question}"
          </h2>
          <p className="text-xs text-slate-400">
            Explain your reasoning, diagnostic tools, and command-line steps clearly.
          </p>
        </div>

        {/* Hint Display */}
        {currentHint && (
          <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-4 text-xs text-amber-200 animate-fadeIn">
            <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Interviewer Hint #{hintsUsedCount}:</span>
            </div>
            <p className="leading-relaxed">{currentHint}</p>
          </div>
        )}

        {/* Answer Input Section */}
        {!currentEvaluation ? (
          <div className="space-y-3 pt-2">
            <div className="relative rounded-2xl border border-slate-700 bg-slate-950 p-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <textarea
                rows={7}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your technical explanation or diagnosis here... (e.g. commands, architectural decisions, root cause reasoning)"
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-mono"
              />

              {/* Bottom bar inside textarea */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 gap-2">
                <div className="flex items-center space-x-3">
                  <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>•</span>
                  <span>{userAnswer.length} chars</span>
                </div>

                <div className="flex items-center space-x-2">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        isListeningMic
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isListeningMic ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
                      <span>{isListeningMic ? 'Listening...' : 'Voice Dictate'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <SkipForward className="h-4 w-4" />
                <span>Skip Question</span>
              </button>

              <button
                type="button"
                disabled={!userAnswer.trim() || isEvaluating}
                onClick={handleSubmitAnswer}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-md ${
                  !userAnswer.trim() || isEvaluating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AI Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Answer for AI Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Post-Answer Live Evaluation Display */
          <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
            {/* Score Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Evaluation Report</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Score: <span className="text-emerald-400">{currentEvaluation.score}</span> / 10
                </h3>
              </div>

              {/* Sub-scores */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-center border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Technical</span>
                  <span className="font-bold text-emerald-300">{currentEvaluation.technicalCorrectnessScore}/10</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-center border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Clarity</span>
                  <span className="font-bold text-cyan-300">{currentEvaluation.clarityScore}/10</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-center border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Troubleshoot</span>
                  <span className="font-bold text-indigo-300">{currentEvaluation.troubleshootingScore}/10</span>
                </div>
              </div>
            </div>

            {/* Answered Well & Missing Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>What You Answered Well</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentEvaluation.answeredWell.map((pt, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>Missing Technical Points</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentEvaluation.missingPoints.map((pt, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Areas to Improve */}
            {currentEvaluation.areasToImprove.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>Areas to Improve</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {currentEvaluation.areasToImprove.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ideal Answer & Command */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Code2 className="h-4 w-4 text-emerald-400" />
                  <span>Senior DevOps Ideal Answer Reference</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentEvaluation.idealAnswer}
              </p>

              {currentEvaluation.practicalExampleOrCommand && (
                <div className="mt-2 rounded-xl bg-slate-900 border border-slate-800 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Practical Command / Code Snippet
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCommand(currentEvaluation.practicalExampleOrCommand!)}
                      className="flex items-center space-x-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      {copiedCommand ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCommand ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                    {currentEvaluation.practicalExampleOrCommand}
                  </pre>
                </div>
              )}
            </div>

            {/* Follow-up Question */}
            {currentEvaluation.followUpQuestion && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-200">
                <span className="font-bold text-indigo-300 block mb-1">
                  Interviewer Follow-Up Drill:
                </span>
                "{currentEvaluation.followUpQuestion}"
              </div>
            )}

            {/* Advance to Next Question */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'Next Question →' : 'View Full Performance Results →'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
