import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, BookOpen, Play, FileText, HelpCircle, CheckCircle,
  ChevronDown, ChevronRight, Download, ExternalLink, X, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { COURSES } from '@/lib/mockData';
import type { Course } from '@/types';
import { toast } from 'sonner';

// Progress stored per-student in localStorage
const PROGRESS_KEY = 'philmac_lesson_progress';

function loadProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; }
}

function saveProgress(data: Record<string, boolean>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

interface QuizQuestion { q: string; options: string[]; answer: number; }
const SAMPLE_QUIZ: QuizQuestion[] = [
  { q: 'What does "pip" stand for in forex trading?', options: ['Price in Point', 'Percentage in Point', 'Profit in Percentage', 'Price Index Point'], answer: 1 },
  { q: 'Which currency pair is known as "Cable"?', options: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'AUD/USD'], answer: 2 },
  { q: 'What is a stop-loss order used for?', options: ['To maximize profit', 'To limit potential losses', 'To place market orders', 'To leverage position size'], answer: 1 },
];

function QuizModal({ onClose, lessonId }: { onClose: () => void; lessonId: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = submitted ? SAMPLE_QUIZ.filter((q, i) => answers[i] === q.answer).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-lg">Lesson Quiz</h2>
            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">Answer all questions to complete this lesson</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-6">
          {submitted ? (
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: score >= 2 ? '#dcfce7' : '#fee2e2' }}
              >
                {score >= 2
                  ? <Award className="w-8 h-8" style={{ color: '#16a34a' }} />
                  : <X className="w-8 h-8" style={{ color: '#dc2626' }} />}
              </div>
              <h3 style={{ color: 'hsl(218,72%,12%)' }} className="text-xl font-black mb-2">
                {score >= 2 ? 'Quiz Passed!' : 'Quiz Failed'}
              </h3>
              <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm mb-1">
                Score: <strong style={{ color: score >= 2 ? '#16a34a' : '#dc2626' }}>{score}/{SAMPLE_QUIZ.length}</strong>
              </p>
              {score >= 2
                ? <p style={{ color: '#16a34a' }} className="text-sm font-semibold">Lesson marked as complete!</p>
                : <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm">Review the lesson and try again.</p>}
              <Button onClick={onClose} className="mt-5 brand-gradient text-white font-bold">
                {score >= 2 ? 'Continue Learning' : 'Back to Lesson'}
              </Button>
            </div>
          ) : (
            <>
              {SAMPLE_QUIZ.map((q, qi) => (
                <div key={qi}>
                  <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-3">
                    {qi + 1}. {q.q}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                        className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                        style={{
                          borderColor: answers[qi] === oi ? 'hsl(18,90%,54%)' : 'hsl(215,18%,85%)',
                          background: answers[qi] === oi ? 'rgba(234,88,12,0.08)' : '#ffffff',
                          color: answers[qi] === oi ? 'hsl(18,90%,40%)' : 'hsl(218,72%,12%)',
                          fontWeight: answers[qi] === oi ? 600 : 400,
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < SAMPLE_QUIZ.length}
                className="w-full brand-gradient text-white font-bold"
              >
                Submit Quiz
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCourses() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();
  const [expanded, setExpanded] = useState<string | null>('basic');
  const [progress, setProgress] = useState<Record<string, boolean>>(loadProgress());
  const [activeLesson, setActiveLesson] = useState<{ courseId: string; lessonId: string } | null>(null);
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);

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

  const lessonIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />;
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
              style={{
                borderColor: isLocked ? 'hsl(215,18%,85%)' : 'hsl(215,18%,80%)',
                opacity: isLocked ? 0.75 : 1,
              }}
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
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black">{pct}<span style={{ color: 'hsl(218,35%,52%)' }} className="text-sm font-normal">%</span></p>
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

                    return (
                      <div key={lesson.id}>
                        {/* Lesson Row */}
                        <div
                          className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 last:border-0 transition-colors cursor-pointer"
                          style={{ background: isActive ? 'rgba(234,88,12,0.04)' : isDone ? '#f0fdf4' : '#ffffff' }}
                          onClick={() => setActiveLesson(isActive ? null : { courseId: course.id, lessonId: lesson.id })}
                        >
                          <span style={{ color: 'hsl(218,35%,58%)' }} className="text-xs w-5 shrink-0 text-center">
                            {idx + 1}
                          </span>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: isDone ? '#dcfce7' : lesson.type === 'quiz' ? '#ede9fe' : lesson.type === 'pdf' ? '#dbeafe' : 'rgba(234,88,12,0.10)' }}
                          >
                            {lessonIcon(lesson.type, isDone)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: isDone ? 'hsl(218,35%,55%)' : 'hsl(218,72%,12%)', textDecoration: isDone ? 'line-through' : undefined }}
                            >
                              {lesson.title}
                            </p>
                            <p style={{ color: 'hsl(218,35%,58%)' }} className="text-xs mt-0.5 capitalize">
                              {lesson.duration} · {lesson.type}
                            </p>
                          </div>
                          {isDone
                            ? <span style={{ color: '#16a34a' }} className="text-xs font-semibold shrink-0">✓ Done</span>
                            : <ChevronDown
                                className="w-3.5 h-3.5 shrink-0 transition-transform"
                                style={{ color: 'hsl(218,35%,58%)', transform: isActive ? 'rotate(180deg)' : undefined }}
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
                                <div className="aspect-video relative flex items-center justify-center">
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
                                  onClick={() => toast.info('PDF download will be available after connecting Supabase Storage.')}
                                  className="gap-1.5 text-xs font-semibold"
                                  style={{ background: '#2563eb', color: '#ffffff' }}
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </Button>
                              </div>
                            )}

                            {/* Quiz */}
                            {lesson.type === 'quiz' && (
                              <div
                                className="rounded-xl p-4 flex items-center justify-between"
                                style={{ background: '#ede9fe', border: '1px solid #ddd6fe' }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#7c3aed' }}>
                                    <HelpCircle className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p style={{ color: '#4c1d95' }} className="font-semibold text-sm">{lesson.title}</p>
                                    <p style={{ color: '#7c3aed' }} className="text-xs">{SAMPLE_QUIZ.length} questions · {lesson.duration}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => setQuizLessonId(lesson.id)}
                                  className="gap-1.5 text-xs font-semibold"
                                  style={{ background: '#7c3aed', color: '#ffffff' }}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Take Quiz
                                </Button>
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
                                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs truncate">
                                  Supplementary reading and reference materials available after connecting Supabase.
                                </p>
                              </div>
                            </div>

                            {/* Mark Complete */}
                            {!isDone && (
                              <Button
                                onClick={() => markComplete(lesson.id, course.id)}
                                className="w-full gap-2 font-bold brand-gradient text-white"
                              >
                                <CheckCircle className="w-4 h-4" /> Mark as Complete
                              </Button>
                            )}
                            {isDone && (
                              <div
                                className="w-full rounded-xl py-3 text-center text-sm font-bold flex items-center justify-center gap-2"
                                style={{ background: '#dcfce7', color: '#166534' }}
                              >
                                <CheckCircle className="w-4 h-4" /> Lesson Completed
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Course Summary Footer */}
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
      {quizLessonId && (
        <QuizModal
          lessonId={quizLessonId}
          onClose={() => {
            markComplete(quizLessonId, '');
            setQuizLessonId(null);
          }}
        />
      )}
    </StudentLayout>
  );
}
