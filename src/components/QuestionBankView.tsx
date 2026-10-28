import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Terminal, 
  PlayCircle, 
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Question, TopicId, Difficulty } from '../types';
import { QUESTION_BANK } from '../data/questionBank';
import { TOPICS } from '../data/topics';
import { StorageService } from '../services/storage';

interface QuestionBankViewProps {
  onStartCustomInterview: (topicId: TopicId) => void;
  initialTopic?: TopicId;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  onStartCustomInterview,
  initialTopic,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>(() => StorageService.getBookmarkedQuestions());
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowBookmarked = StorageService.toggleBookmark(id);
    if (isNowBookmarked) {
      setBookmarks((prev) => [...prev, id]);
    } else {
      setBookmarks((prev) => prev.filter((b) => b !== id));
    }
  };

  const handleCopyCommand = (cmd: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = QUESTION_BANK.filter((q) => {
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (onlyBookmarks && !bookmarks.includes(q.id)) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inQuestion = q.question.toLowerCase().includes(query);
      const inAnswer = q.referenceAnswer.toLowerCase().includes(query);
      const inCommand = q.practicalCommand?.toLowerCase().includes(query) || false;
      const inKeywords = q.expectedKeywords.some((kw) => kw.toLowerCase().includes(query));
      return inQuestion || inAnswer || inCommand || inKeywords;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>DevOps Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Curated Question Bank & Command Recipes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse real-world questions, ideal answers, expected keywords, and battle-tested terminal commands.
          </p>
        </div>

        {selectedTopic !== 'all' && (
          <button
            onClick={() => onStartCustomInterview(selectedTopic as TopicId)}
            className="flex items-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Practice {selectedTopic.toUpperCase()} Only</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, command (e.g. 'CrashLoopBackOff', 'lsof', 'boto3')..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Bookmarks Toggle */}
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                onlyBookmarks
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-950/80 text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved ({bookmarks.length})</span>
            </button>
          </div>
        </div>

        {/* Topics Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
              selectedTopic === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Topics ({QUESTION_BANK.length})
          </button>
          {TOPICS.map((topic) => {
            const count = QUESTION_BANK.filter((q) => q.topic === topic.id).length;
            const active = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors flex items-center space-x-1.5 ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{topic.name}</span>
                {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-2">
            <HelpCircle className="mx-auto h-8 w-8 text-slate-600" />
            <h3 className="text-base font-semibold text-white">No questions matched your search criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your topic filter or searching for another keyword like "Docker", "S3", or "systemd".
            </p>
            <button
              onClick={() => {
                setSelectedTopic('all');
                setSelectedDifficulty('all');
                setSearchQuery('');
                setOnlyBookmarks(false);
              }}
              className="mt-3 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isBookmarked = bookmarks.includes(q.id);

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-all hover:border-slate-700 shadow-sm"
              >
                {/* Collapsed Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="flex items-start justify-between p-5 cursor-pointer hover:bg-slate-900/90 transition-colors gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {q.topic}
                      </span>
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
                        {q.difficulty}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {q.question}
                    </h2>

                    {/* Keywords pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {q.expectedKeywords.slice(0, 4).map((kw, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => toggleBookmark(q.id, e)}
                      title={isBookmarked ? 'Remove bookmark' : 'Save question'}
                      className={`p-2 rounded-xl border transition-colors ${
                        isBookmarked
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 text-slate-500 hover:text-white'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>

                    <div className="p-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-5 space-y-4 bg-slate-950/70">
                    {/* Reference Answer */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Staff DevOps Ideal Explanation:</span>
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {q.referenceAnswer}
                      </p>
                    </div>

                    {/* Practical CLI Command */}
                    {q.practicalCommand && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                            <Terminal className="h-3 w-3 text-emerald-400" />
                            <span>Practical Command / Recipe</span>
                          </span>
                          <button
                            onClick={(e) => handleCopyCommand(q.practicalCommand!, q.id, e)}
                            className="flex items-center space-x-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300"
                          >
                            {copiedId === q.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                          {q.practicalCommand}
                        </pre>
                      </div>
                    )}

                    {/* Hints */}
                    {q.hints && q.hints.length > 0 && (
                      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-400 space-y-1">
                        <span className="font-bold text-slate-300 block text-[11px]">Key Interviewer Clues / Hints:</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {q.hints.map((hint, hidx) => (
                            <li key={hidx}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
