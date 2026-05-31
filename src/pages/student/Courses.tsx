import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, BookOpen, Play, FileText, HelpCircle, CheckCircle,
  ChevronDown, ChevronRight, Download, ExternalLink, X, Award,
  RotateCcw, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { COURSES } from '@/lib/mockData';
import type { Course } from '@/types';
import { toast } from 'sonner';

// ── localStorage keys ────────────────────────────────────────────────────────
const PROGRESS_KEY = 'philmac_lesson_progress';
const QUIZ_SCORES_KEY = 'philmac_quiz_scores';

function loadProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; }
}
function saveProgress(data: Record<string, boolean>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}
function loadQuizScores(): Record<string, { score: number; total: number; passed: boolean; attempts: number }> {
  try { return JSON.parse(localStorage.getItem(QUIZ_SCORES_KEY) || '{}'); } catch { return {}; }
}
function saveQuizScore(lessonId: string, score: number, total: number) {
  const all = loadQuizScores();
  const prev = all[lessonId];
  all[lessonId] = {
    score,
    total,
    passed: score / total >= 0.7,
    attempts: (prev?.attempts || 0) + 1,
  };
  localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(all));
  return all[lessonId];
}

// ── Quiz questions per lesson (stored in localStorage on first load) ─────────
interface QuizQuestion { q: string; options: string[]; answer: number; }

const LESSON_QUIZZES: Record<string, QuizQuestion[]> = {
  // Basic course quizzes
  'basic-1': [
    { q: 'What does "pip" stand for in forex trading?', options: ['Price in Point', 'Percentage in Point', 'Profit in Percentage', 'Price Index Point'], answer: 1 },
    { q: 'Which currency pair is known as "The Cable"?', options: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'AUD/USD'], answer: 2 },
    { q: 'What is a stop-loss order used for?', options: ['To maximize profit', 'To limit potential losses', 'To place market orders', 'To leverage position size'], answer: 1 },
    { q: 'Which session overlaps with both European and US trading?', options: ['Asian-European', 'European-US', 'US-Asian', 'Pacific-US'], answer: 1 },
  ],
  'basic-2': [
    { q: 'A bullish engulfing pattern signals...', options: ['Continuation of downtrend', 'Potential reversal upward', 'Market indecision', 'Strong resistance'], answer: 1 },
    { q: 'The Doji candlestick indicates...', options: ['Strong bullish momentum', 'Strong bearish momentum', 'Market indecision', 'High volume breakout'], answer: 2 },
    { q: 'Support levels are areas where price tends to...', options: ['Break through easily', 'Find buying interest and bounce', 'Reverse downward', 'Stay flat for days'], answer: 1 },
  ],
  'basic-3': [
    { q: 'The recommended risk per trade for beginners is?', options: ['10-20%', '5-10%', '1-2%', '20-30%'], answer: 2 },
    { q: 'FOMO in trading stands for?', options: ['Follow On Market Operations', 'Fear Of Missing Out', 'Forward Order Management Operations', 'Fear Of Market Opening'], answer: 1 },
    { q: 'A trading journal is used to...', options: ['Predict market prices', 'Track and review your trades', 'Calculate leverage', 'Alert entry signals'], answer: 1 },
  ],
};

// Fallback quiz for any lesson without specific questions
const DEFAULT_QUIZ: QuizQuestion[] = [
  { q: 'What is the primary goal of technical analysis?', options: ['Predict company earnings', 'Analyze price action and chart patterns', 'Study economic reports', 'Track central bank policies'], answer: 1 },
  { q: 'A trend line is drawn by connecting...', options: ['Random high points', 'Two or more significant highs or lows', 'Opening and closing prices', 'Moving average crossovers'], answer: 1 },
  { q: 'Which indicator measures market momentum?', options: ['Bollinger Bands', 'Volume Profile', 'RSI (Relative Strength Index)', 'Fibonacci Retracement'], answer: 2 },
  { q: 'What is a "confluence" in trading?', options: ['A type of order', 'Multiple signals pointing to same trade idea', 'A market session', 'A chart pattern'], answer: 1 },
];

function getQuizForLesson(lessonId: string): QuizQuestion[] {
  return LESSON_QUIZZES[lessonId] || DEFAULT_QUIZ;
}

// ── Quiz Modal ───────────────────────────────────────────────────────────────
function QuizModal({
  lessonId,
  lessonTitle,
  onClose,
  onPass,
}: {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
  onPass: () => void;
}) {
  const questions = getQuizForLesson(lessonId);
  const PASS_THRESHOLD = 0.7;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; attempts: number } | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    const score = questions.filter((q, i) => answers[i] === q.answer).length;
    const saved = saveQuizScore(lessonId, score, questions.length);
    setResult(saved);
    setSubmitted(true);
    if (saved.passed) {
      setTimeout(() => onPass(), 1800);
    }
    console.log('Quiz submitted:', { lessonId, score, total: questions.length, passed: saved.passed });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setShowAnswers(false);
  };

  const scorePct = result ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,12,35,0.80)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white z-10"
          style={{ borderRadius: '16px 16px 0 0' }}
        >
          <div>
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: '#7c3aed' }} />
              Lesson Quiz
            </h2>
            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5 truncate max-w-[280px]">{lessonTitle}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: '#ede9fe', color: '#4c1d95' }}
            >
              {questions.length} questions
            </span>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: '#fef3c7', color: '#92400e' }}
            >
              Pass: 70%
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* ── Results View ── */}
          {submitted && result && (
            <div>
              {/* Score Card */}
              <div
                className="rounded-2xl p-6 text-center mb-5"
                style={{
                  background: result.passed
                    ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                    : 'linear-gradient(135deg, #fff1f2, #fee2e2)',
                  border: `2px solid ${result.passed ? '#bbf7d0' : '#fecdd3'}`,
                }}
              >
                {/* Donut score */}
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke={result.passed ? '#bbf7d0' : '#fecdd3'} strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke={result.passed ? '#16a34a' : '#dc2626'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(scorePct / 100) * 201} 201`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      style={{ fontSize: 17, fontWeight: 900, lineHeight: 1, color: result.passed ? '#16a34a' : '#dc2626' }}
                    >
                      {scorePct}%
                    </span>
                  </div>
                </div>

                <h3 style={{ color: result.passed ? '#166534' : '#9f1239' }} className="text-xl font-black mb-1">
                  {result.passed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'}
                </h3>
                <p style={{ color: result.passed ? '#15803d' : '#be123c' }} className="text-sm font-semibold">
                  Score: {result.score} / {result.total} correct
                </p>
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-1">
                  {result.passed
                    ? 'Excellent work! Lesson is being marked complete...'
                    : `Need ${Math.ceil(result.total * 0.7)} correct to pass (70%). Attempt ${result.attempts}.`}
                </p>
              </div>

              {/* Review answers toggle */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-4 text-sm font-semibold transition-all hover:bg-muted/10"
                style={{ borderColor: 'hsl(215,18%,85%)', color: 'hsl(218,72%,12%)' }}
                onClick={() => setShowAnswers(s => !s)}
              >
                <span>Review Answers</span>
                <ChevronDown
                  className="w-4 h-4 transition-transform"
                  style={{ transform: showAnswers ? 'rotate(180deg)' : undefined, color: 'hsl(218,35%,55%)' }}
                />
              </button>

              {showAnswers && (
                <div className="space-y-4 mb-5">
                  {questions.map((q, qi) => {
                    const userAns = answers[qi];
                    const isCorrect = userAns === q.answer;
                    return (
                      <div key={qi} className="space-y-2">
                        <p className="text-sm font-semibold" style={{ color: 'hsl(218,72%,12%)' }}>
                          {qi + 1}. {q.q}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oi) => {
                            const isUserChoice = userAns === oi;
                            const isCorrectAns = q.answer === oi;
                            let bg = '#ffffff';
                            let border = 'hsl(215,18%,85%)';
                            let color = 'hsl(218,35%,48%)';
                            if (isCorrectAns) { bg = '#f0fdf4'; border = '#86efac'; color = '#166534'; }
                            if (isUserChoice && !isCorrect) { bg = '#fff1f2'; border = '#fca5a5'; color = '#991b1b'; }
                            return (
                              <div
                                key={oi}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs"
                                style={{ background: bg, borderColor: border, color }}
                              >
                                {isCorrectAns
                                  ? <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#16a34a' }} />
                                  : isUserChoice
                                  ? <X className="w-3.5 h-3.5 shrink-0" style={{ color: '#dc2626' }} />
                                  : <div className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ borderColor: 'hsl(215,18%,72%)' }} />}
                                <span className={isUserChoice || isCorrectAns ? 'font-semibold' : ''}>{opt}</span>
                                {isCorrectAns && <span className="ml-auto font-bold" style={{ color: '#16a34a', fontSize: 10 }}>CORRECT</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!result.passed && (
                  <Button
                    onClick={handleRetry}
                    className="flex-1 gap-2 font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                  >
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={result.passed ? 'w-full font-bold' : 'flex-1 font-bold border-border'}
                  style={{ color: 'hsl(218,72%,12%)' }}
                >
                  {result.passed ? '✓ Continue Learning' : 'Back to Lesson'}
                </Button>
              </div>
            </div>
          )}

          {/* ── Questions View ── */}
          {!submitted && (
            <div className="space-y-6">
              {/* Progress indicator */}
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                  {Object.keys(answers).length} / {questions.length} answered
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: answers[i] !== undefined ? 16 : 8,
                        background: answers[i] !== undefined ? '#7c3aed' : 'hsl(215,18%,88%)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {questions.map((q, qi) => (
                <div key={qi}>
                  <div className="flex items-start gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                      style={{
                        background: answers[qi] !== undefined ? '#ede9fe' : 'hsl(215,18%,90%)',
                        color: answers[qi] !== undefined ? '#7c3aed' : 'hsl(218,35%,52%)',
                      }}
                    >
                      {qi + 1}
                    </div>
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm leading-snug">
                      {q.q}
                    </p>
                  </div>
                  <div className="space-y-2 ml-8">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                          className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all hover:scale-[1.01]"
                          style={{
                            borderColor: isSelected ? '#7c3aed' : 'hsl(215,18%,85%)',
                            background: isSelected ? '#ede9fe' : '#ffffff',
                            color: isSelected ? '#4c1d95' : 'hsl(218,72%,12%)',
                            fontWeight: isSelected ? 600 : 400,
                            boxShadow: isSelected ? '0 0 0 2px rgba(124,58,237,0.15)' : undefined,
                          }}
                        >
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-2 shrink-0"
                            style={{
                              background: isSelected ? '#7c3aed' : 'hsl(215,18%,90%)',
                              color: isSelected ? '#ffffff' : 'hsl(218,35%,52%)',
                            }}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full gap-2 font-bold text-white"
                style={{ background: allAnswered ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : undefined }}
              >
                <Star className="w-4 h-4" />
                {allAnswered ? 'Submit Quiz' : `Answer all ${questions.length - Object.keys(answers).length} remaining questions`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StudentCourses() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();
  const [expanded, setExpanded] = useState<string | null>('basic');
  const [progress, setProgress] = useState<Record<string, boolean>>(loadProgress());
  const [quizScores, setQuizScores] = useState(loadQuizScores());
  const [activeLesson, setActiveLesson] = useState<{ courseId: string; lessonId: string } | null>(null);
  const [quizLesson, setQuizLesson] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const getCourseStatus = (id: string) => {
    if (id === 'basic') return student.basicCourseStatus;
    if (id === 'next') return student.nextCourseStatus;
    return student.finalCourseStatus;
  };

  const getCompletedCount = (course: Course) =>
    course.lessons.filter(l => progress[l.id] || l.completed).length;

  const getProgressPct = (course: Course) => {
    if (course.lessons.length === 0) return 0;
    return Math.round((getCompletedCount(course) / course.lessons.length) * 100);
  };

  const markComplete = (lessonId: string, courseId: string) => {
    const updated = { ...progress, [lessonId]: true };
    setProgress(updated);
    saveProgress(updated);
    toast.success('Lesson marked as complete!');
    console.log('Lesson marked complete:', lessonId, courseId);
  };

  const handleQuizPass = (lessonId: string, courseId: string) => {
    setQuizScores(loadQuizScores());
    markComplete(lessonId, courseId);
    setQuizLesson(null);
    toast.success('Quiz passed — lesson completed! 🎉');
  };

  const lessonIcon = (type: string, done: boolean) => {
    if (done) return <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />;
    if (type === 'video') return <Play className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />;
    if (type === 'pdf') return <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />;
    return <HelpCircle className="w-4 h-4" style={{ color: '#7c3aed' }} />;
  };

  return (
    <StudentLayout>
      <div className="max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-black text-foreground">My Courses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your progress and complete lessons to advance.</p>
        </div>

        {COURSES.map((course: Course) => {
          const status = getCourseStatus(course.id);
          const isLocked = status === 'locked';
          const isExpanded = expanded === course.id;
          const completedCount = getCompletedCount(course);
          const pct = getProgressPct(course);

          return (
            <div
              key={course.id}
              className="bg-white border rounded-2xl overflow-hidden transition-all"
              style={{ borderColor: isLocked ? 'hsl(215,18%,85%)' : 'hsl(215,18%,80%)', opacity: isLocked ? 0.75 : 1 }}
            >
              {/* Course Header */}
              <button
                className="w-full text-left p-5 hover:bg-muted/20 transition-colors"
                onClick={() => !isLocked && setExpanded(isExpanded ? null : course.id)}
                disabled={isLocked}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {isLocked
                        ? <Lock className="w-4 h-4 text-muted-foreground" />
                        : <BookOpen className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />}
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                        style={{
                          background: isLocked ? '#f3f4f6' : status === 'completed' ? '#dcfce7' : '#dbeafe',
                          color: isLocked ? '#6b7280' : status === 'completed' ? '#166534' : '#1e40af',
                        }}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">{course.title}</h2>
                    <p style={{ color: 'hsl(218,35%,48%)' }} className="text-xs mt-1">{course.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black">
                      {pct}<span style={{ color: 'hsl(218,35%,52%)' }} className="text-sm font-normal">%</span>
                    </p>
                    <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{completedCount}/{course.lessons.length}</p>
                    {!isLocked && (isExpanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />)}
                  </div>
                </div>

                {!isLocked && (
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : 'linear-gradient(90deg, hsl(218,72%,22%), hsl(18,90%,54%))',
                        }}
                      />
                    </div>
                  </div>
                )}

                {isLocked && (
                  <div className="mt-3 rounded-lg p-3 text-xs" style={{ background: 'hsl(210,20%,97%)', color: 'hsl(218,35%,48%)' }}>
                    <strong style={{ color: 'hsl(218,72%,12%)' }}>Required to unlock:</strong> {course.requiredForUnlock}
                  </div>
                )}
              </button>

              {/* Lessons List */}
              {isExpanded && !isLocked && (
                <div className="border-t border-border">
                  {course.lessons.map((lesson, idx) => {
                    const isDone = progress[lesson.id] || lesson.completed;
                    const isActive = activeLesson?.lessonId === lesson.id;
                    const quizScore = quizScores[lesson.id];

                    return (
                      <div key={lesson.id}>
                        {/* Lesson Row */}
                        <div
                          className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 last:border-0 transition-colors cursor-pointer"
                          style={{ background: isActive ? 'rgba(234,88,12,0.04)' : isDone ? '#f0fdf4' : '#ffffff' }}
                          onClick={() => setActiveLesson(isActive ? null : { courseId: course.id, lessonId: lesson.id })}
                        >
                          <span style={{ color: 'hsl(218,35%,58%)' }} className="text-xs w-5 shrink-0 text-center">{idx + 1}</span>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: isDone ? '#dcfce7'
                                : lesson.type === 'quiz' ? '#ede9fe'
                                : lesson.type === 'pdf' ? '#dbeafe'
                                : 'rgba(234,88,12,0.10)',
                            }}
                          >
                            {lessonIcon(lesson.type, isDone)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{
                                color: isDone ? 'hsl(218,35%,55%)' : 'hsl(218,72%,12%)',
                                textDecoration: isDone ? 'line-through' : undefined,
                              }}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span style={{ color: 'hsl(218,35%,58%)' }} className="text-xs capitalize">
                                {lesson.duration} · {lesson.type}
                              </span>
                              {lesson.type === 'quiz' && quizScore && (
                                <span
                                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: quizScore.passed ? '#dcfce7' : '#fee2e2',
                                    color: quizScore.passed ? '#16a34a' : '#dc2626',
                                  }}
                                >
                                  {quizScore.score}/{quizScore.total} · {quizScore.passed ? 'Passed' : 'Failed'}
                                </span>
                              )}
                            </div>
                          </div>
                          {isDone
                            ? <span style={{ color: '#16a34a' }} className="text-xs font-semibold shrink-0">✓ Done</span>
                            : <ChevronDown
                                className="w-3.5 h-3.5 shrink-0 transition-transform"
                                style={{
                                  color: 'hsl(218,35%,58%)',
                                  transform: isActive ? 'rotate(180deg)' : undefined,
                                }}
                              />}
                        </div>

                        {/* Lesson Detail Panel */}
                        {isActive && (
                          <div
                            className="px-5 pb-5 pt-3 space-y-4"
                            style={{ background: '#fafafa', borderBottom: '1px solid hsl(215,18%,88%)' }}
                          >
                            {/* Video Embed */}
                            {lesson.type === 'video' && (
                              <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(218,72%,8%)' }}>
                                <div className="aspect-video relative">
                                  <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                                    title={lesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                  <div>
                                    <p style={{ color: '#ffffff' }} className="text-sm font-semibold">{lesson.title}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs">{lesson.duration}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Play className="w-3 h-3 fill-current" style={{ color: 'hsl(18,90%,54%)' }} />
                                    <span style={{ color: 'hsl(18,90%,54%)' }} className="text-xs font-semibold">Video Lesson</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* PDF Material */}
                            {lesson.type === 'pdf' && (
                              <div
                                className="rounded-xl p-4 flex items-center justify-between"
                                style={{ background: '#dbeafe', border: '1px solid #bfdbfe' }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#2563eb' }}>
                                    <FileText className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p style={{ color: '#1e40af' }} className="font-semibold text-sm">{lesson.title}</p>
                                    <p style={{ color: '#3b82f6' }} className="text-xs">PDF Study Material · {lesson.duration} read time</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => toast.info('PDF download available after connecting Supabase Storage.')}
                                  className="gap-1.5 text-xs font-semibold"
                                  style={{ background: '#2563eb', color: '#ffffff' }}
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </Button>
                              </div>
                            )}

                            {/* Quiz Launcher */}
                            {lesson.type === 'quiz' && (
                              <div
                                className="rounded-xl p-4"
                                style={{ background: '#ede9fe', border: '1px solid #ddd6fe' }}
                              >
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#7c3aed' }}>
                                      <HelpCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p style={{ color: '#4c1d95' }} className="font-semibold text-sm">{lesson.title}</p>
                                      <p style={{ color: '#7c3aed' }} className="text-xs">
                                        {getQuizForLesson(lesson.id).length} questions · Pass threshold: 70%
                                        {quizScore && ` · Best: ${quizScore.score}/${quizScore.total}`}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => setQuizLesson({ id: lesson.id, title: lesson.title })}
                                    className="gap-1.5 text-xs font-semibold shrink-0"
                                    style={{ background: '#7c3aed', color: '#ffffff' }}
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    {quizScore ? (quizScore.passed ? 'Retake Quiz' : 'Retry Quiz') : 'Take Quiz'}
                                  </Button>
                                </div>
                                {quizScore && (
                                  <div
                                    className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg"
                                    style={{ background: quizScore.passed ? '#f0fdf4' : '#fff1f2', border: `1px solid ${quizScore.passed ? '#bbf7d0' : '#fecdd3'}` }}
                                  >
                                    <div className="flex items-center gap-2">
                                      {quizScore.passed
                                        ? <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                                        : <X className="w-4 h-4" style={{ color: '#dc2626' }} />}
                                      <span className="text-xs font-semibold" style={{ color: quizScore.passed ? '#166534' : '#9f1239' }}>
                                        Last attempt: {quizScore.score}/{quizScore.total} ({Math.round((quizScore.score / quizScore.total) * 100)}%)
                                        {' '}— {quizScore.passed ? 'Passed' : 'Failed'}
                                      </span>
                                    </div>
                                    <span style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">
                                      {quizScore.attempts} attempt{quizScore.attempts !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* External Resource Link */}
                            <div
                              className="rounded-xl p-3 flex items-center gap-3"
                              style={{ background: '#ffffff', border: '1px solid hsl(215,18%,85%)' }}
                            >
                              <ExternalLink className="w-4 h-4 shrink-0" style={{ color: 'hsl(18,90%,54%)' }} />
                              <div className="flex-1 min-w-0">
                                <p style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold">Additional Resources</p>
                                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                                  Supplementary reading and reference materials available after connecting Supabase.
                                </p>
                              </div>
                            </div>

                            {/* Mark Complete / Done state */}
                            {!isDone ? (
                              lesson.type === 'quiz' ? (
                                <div
                                  className="rounded-xl p-3 flex items-center gap-2"
                                  style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                                >
                                  <HelpCircle className="w-4 h-4 shrink-0" style={{ color: '#d97706' }} />
                                  <p style={{ color: '#92400e' }} className="text-xs font-semibold">
                                    Pass the quiz above to automatically complete this lesson (score ≥ 70%).
                                  </p>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => markComplete(lesson.id, course.id)}
                                  className="w-full gap-2 font-bold text-white"
                                  style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                                >
                                  <CheckCircle className="w-4 h-4" /> Mark as Complete
                                </Button>
                              )
                            ) : (
                              <div
                                className="w-full rounded-xl py-3 text-center text-sm font-bold flex items-center justify-center gap-2"
                                style={{ background: '#dcfce7', color: '#166534' }}
                              >
                                <CheckCircle className="w-4 h-4" /> Lesson Completed
                                {quizScore && <span className="text-xs font-normal">({quizScore.score}/{quizScore.total} quiz score)</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Course Footer */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ background: 'hsl(210,20%,97%)', borderTop: '1px solid hsl(215,18%,88%)' }}
                  >
                    <p style={{ color: 'hsl(218,35%,48%)' }} className="text-xs">
                      {completedCount} of {course.lessons.length} lessons complete
                    </p>
                    {pct === 100 && (
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: '#dcfce7', color: '#166534' }}
                      >
                        ✅ Course Complete
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Modal */}
      {quizLesson && (
        <QuizModal
          lessonId={quizLesson.id}
          lessonTitle={quizLesson.title}
          onClose={() => setQuizLesson(null)}
          onPass={() => {
            // Find which course this lesson belongs to
            const courseId = COURSES.find(c => c.lessons.some(l => l.id === quizLesson.id))?.id || '';
            handleQuizPass(quizLesson.id, courseId);
          }}
        />
      )}
    </StudentLayout>
  );
}
