import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  GripVertical, ToggleLeft, ToggleRight, Users, CheckCircle, Play,
  FileText, HelpCircle, Upload, AlertCircle, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { COURSES } from '@/lib/mockData';
import { toast } from 'sonner';
import type { Course } from '@/types';

const COURSES_KEY = 'philmac_admin_courses';

interface AdminLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'quiz';
  completed: boolean;
}

interface AdminCourse extends Omit<Course, 'lessons'> {
  active: boolean;
  thumbnail?: string;
  lessons: AdminLesson[];
}

function loadCourses(): AdminCourse[] {
  try {
    const stored = localStorage.getItem(COURSES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return COURSES.map(c => ({ ...c, active: true, lessons: c.lessons as AdminLesson[] }));
}

function saveCourses(courses: AdminCourse[]) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

const TYPE_META = {
  video: { icon: Play,      color: 'hsl(18,90%,48%)', bg: 'rgba(234,88,12,0.10)', label: 'Video' },
  pdf:   { icon: FileText,  color: '#2563eb',          bg: '#dbeafe',               label: 'PDF' },
  quiz:  { icon: HelpCircle,color: '#7c3aed',          bg: '#ede9fe',               label: 'Quiz' },
};

type ModalMode = { type: 'add-course' } | { type: 'edit-course'; courseIdx: number } | { type: 'assign'; courseIdx: number } | null;

export default function AdminCourses() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [courses, setCourses] = useState<AdminCourse[]>(loadCourses());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ courseIdx: number; lessonId: string | null } | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', duration: '', type: 'video' as AdminLesson['type'] });
  const [modal, setModal] = useState<ModalMode>(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', requiredForUnlock: '' });
  const [dragIdx, setDragIdx] = useState<{ courseIdx: number; lessonIdx: number } | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const students = getStudentsStore();

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const persist = (updated: AdminCourse[]) => {
    setCourses(updated);
    saveCourses(updated);
  };

  const toggleActive = (idx: number) => {
    const updated = courses.map((c, i) => i === idx ? { ...c, active: !c.active } : c);
    persist(updated);
    toast.success(`Course "${courses[idx].title}" ${!courses[idx].active ? 'activated' : 'deactivated'}`);
  };

  const deleteCourse = (idx: number) => {
    if (!confirm(`Delete "${courses[idx].title}"? This cannot be undone.`)) return;
    persist(courses.filter((_, i) => i !== idx));
    toast.success('Course deleted');
  };

  const openAddCourse = () => {
    setCourseForm({ title: '', description: '', requiredForUnlock: '' });
    setModal({ type: 'add-course' });
  };

  const openEditCourse = (idx: number) => {
    setCourseForm({
      title: courses[idx].title,
      description: courses[idx].description,
      requiredForUnlock: courses[idx].requiredForUnlock,
    });
    setModal({ type: 'edit-course', courseIdx: idx });
  };

  const saveCourseMeta = () => {
    if (!courseForm.title.trim()) { toast.error('Course title is required'); return; }
    if (modal?.type === 'add-course') {
      const newCourse: AdminCourse = {
        id: `course-${Date.now()}`,
        title: courseForm.title,
        description: courseForm.description,
        requiredForUnlock: courseForm.requiredForUnlock,
        active: true,
        lessons: [],
      };
      persist([...courses, newCourse]);
      toast.success('Course added');
    } else if (modal?.type === 'edit-course') {
      const updated = courses.map((c, i) =>
        i === modal.courseIdx ? { ...c, ...courseForm } : c
      );
      persist(updated);
      toast.success('Course updated');
    }
    setModal(null);
  };

  // Lesson CRUD
  const addLesson = (courseIdx: number) => {
    if (!lessonForm.title.trim()) { toast.error('Lesson title required'); return; }
    const newLesson: AdminLesson = {
      id: `lesson-${Date.now()}`,
      title: lessonForm.title,
      duration: lessonForm.duration || '30 min',
      type: lessonForm.type,
      completed: false,
    };
    const updated = courses.map((c, i) =>
      i === courseIdx ? { ...c, lessons: [...c.lessons, newLesson] } : c
    );
    persist(updated);
    setLessonForm({ title: '', duration: '', type: 'video' });
    setEditingLesson(null);
    toast.success('Lesson added');
  };

  const updateLesson = (courseIdx: number, lessonId: string) => {
    if (!lessonForm.title.trim()) { toast.error('Lesson title required'); return; }
    const updated = courses.map((c, i) =>
      i === courseIdx
        ? { ...c, lessons: c.lessons.map(l => l.id === lessonId ? { ...l, ...lessonForm } : l) }
        : c
    );
    persist(updated);
    setEditingLesson(null);
    toast.success('Lesson updated');
  };

  const deleteLesson = (courseIdx: number, lessonId: string) => {
    const updated = courses.map((c, i) =>
      i === courseIdx ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c
    );
    persist(updated);
    toast.success('Lesson removed');
  };

  const moveLesson = (courseIdx: number, fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= courses[courseIdx].lessons.length) return;
    const lessons = [...courses[courseIdx].lessons];
    const [moved] = lessons.splice(fromIdx, 1);
    lessons.splice(toIdx, 0, moved);
    const updated = courses.map((c, i) => i === courseIdx ? { ...c, lessons } : c);
    persist(updated);
  };

  // Assign course to student
  const assignCourseToStudent = (courseIdx: number, studentId: string) => {
    const course = courses[courseIdx];
    const statusField = course.id === 'basic' ? 'basicCourseStatus'
      : course.id === 'next' ? 'nextCourseStatus' : 'finalCourseStatus';
    const updated = students.map(s =>
      s.id === studentId ? { ...s, [statusField]: 'in_progress' } : s
    );
    updateStudentsStore(updated as typeof students);
    toast.success(`Course assigned to student`);
  };

  const getEnrollmentStats = (course: AdminCourse) => {
    const key = course.id === 'basic' ? 'basicCourseStatus'
      : course.id === 'next' ? 'nextCourseStatus' : 'finalCourseStatus';
    return {
      enrolled: students.filter(s => (s as Record<string, unknown>)[key] !== 'locked').length,
      inProgress: students.filter(s => (s as Record<string, unknown>)[key] === 'in_progress').length,
      completed: students.filter(s => (s as Record<string, unknown>)[key] === 'completed').length,
    };
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Course Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{courses.length} courses · manage lessons, status, and student assignments.</p>
          </div>
          <Button
            onClick={openAddCourse}
            className="brand-gradient text-white font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Course
          </Button>
        </div>

        {/* Course Cards */}
        <div className="space-y-4">
          {courses.map((course, courseIdx) => {
            const stats = getEnrollmentStats(course);
            const isExpanded = expanded === course.id;
            const isAddingLesson = editingLesson?.courseIdx === courseIdx && editingLesson?.lessonId === null;

            return (
              <div
                key={course.id}
                className="bg-white border rounded-2xl overflow-hidden transition-all"
                style={{
                  borderColor: course.active ? 'hsl(215,18%,80%)' : 'hsl(215,18%,88%)',
                  opacity: course.active ? 1 : 0.72,
                }}
              >
                {/* Course Header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        background: course.thumbnail
                          ? `url(${course.thumbnail}) center/cover`
                          : 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))',
                      }}
                      onClick={() => toast.info('Thumbnail upload available after connecting Supabase Storage.')}
                    >
                      {!course.thumbnail && (
                        <div className="flex flex-col items-center gap-0.5">
                          <BookOpen className="w-5 h-5 text-white" />
                          <Upload className="w-2.5 h-2.5 text-white/60" />
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">{course.title}</h2>
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: course.active ? '#dcfce7' : '#f3f4f6',
                                color: course.active ? '#166534' : '#6b7280',
                              }}
                            >
                              {course.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs leading-relaxed mb-2">{course.description}</p>
                          <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                            <strong style={{ color: 'hsl(218,72%,20%)' }}>Unlock:</strong> {course.requiredForUnlock}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-2 flex-wrap mt-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                          <Users className="w-3 h-3 inline mr-1" />{stats.enrolled} enrolled
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#fef3c7', color: '#92400e' }}>
                          {stats.inProgress} in progress
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
                          <CheckCircle className="w-3 h-3 inline mr-1" />{stats.completed} completed
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'hsl(215,18%,90%)', color: 'hsl(218,35%,48%)' }}>
                          {course.lessons.length} lessons
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(courseIdx)}
                        title={course.active ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {course.active
                          ? <ToggleRight className="w-5 h-5" style={{ color: '#22c55e' }} />
                          : <ToggleLeft className="w-5 h-5" style={{ color: 'hsl(218,35%,60%)' }} />}
                      </button>
                      <button
                        onClick={() => openEditCourse(courseIdx)}
                        className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" style={{ color: 'hsl(218,35%,50%)' }} />
                      </button>
                      <button
                        onClick={() => setModal({ type: 'assign', courseIdx })}
                        className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                        title="Assign to students"
                      >
                        <UserCheck className="w-4 h-4" style={{ color: 'hsl(218,35%,50%)' }} />
                      </button>
                      <button
                        onClick={() => deleteCourse(courseIdx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                      </button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : course.id)}
                        className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors ml-1"
                      >
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" style={{ color: 'hsl(218,35%,50%)' }} />
                          : <ChevronDown className="w-4 h-4" style={{ color: 'hsl(218,35%,50%)' }} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lesson Editor */}
                {isExpanded && (
                  <div className="border-t border-border" style={{ background: 'hsl(210,20%,97.5%)' }}>
                    <div className="px-5 py-3 flex items-center justify-between border-b border-border/60">
                      <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide">
                        Lessons ({course.lessons.length})
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setLessonForm({ title: '', duration: '', type: 'video' });
                          setEditingLesson({ courseIdx, lessonId: null });
                        }}
                        className="gap-1 text-xs brand-gradient text-white font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Lesson
                      </Button>
                    </div>

                    {/* Add Lesson Form */}
                    {isAddingLesson && (
                      <div className="px-5 py-4 border-b border-border/60" style={{ background: '#ffffff' }}>
                        <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-3">New Lesson</p>
                        <LessonForm form={lessonForm} setForm={setLessonForm} />
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => addLesson(courseIdx)}
                            className="brand-gradient text-white font-semibold gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Add Lesson
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Lesson List */}
                    {course.lessons.length === 0 && !isAddingLesson && (
                      <div className="px-5 py-8 text-center">
                        <p style={{ color: 'hsl(218,35%,55%)' }} className="text-sm">No lessons yet. Click "Add Lesson" to get started.</p>
                      </div>
                    )}

                    <div className="divide-y divide-border/40">
                      {course.lessons.map((lesson, lessonIdx) => {
                        const meta = TYPE_META[lesson.type];
                        const LessonIcon = meta.icon;
                        const isEditingThis = editingLesson?.courseIdx === courseIdx && editingLesson?.lessonId === lesson.id;

                        return (
                          <div key={lesson.id}>
                            {isEditingThis ? (
                              <div className="px-5 py-4" style={{ background: '#ffffff' }}>
                                <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-3">Edit Lesson {lessonIdx + 1}</p>
                                <LessonForm form={lessonForm} setForm={setLessonForm} />
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    onClick={() => updateLesson(courseIdx, lesson.id)}
                                    className="brand-gradient text-white font-semibold gap-1"
                                  >
                                    <Save className="w-3.5 h-3.5" /> Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="flex items-center gap-3 px-5 py-3 group"
                                draggable
                                onDragStart={() => setDragIdx({ courseIdx, lessonIdx })}
                                onDragOver={e => { e.preventDefault(); setDragOverIdx(lessonIdx); }}
                                onDrop={() => {
                                  if (dragIdx?.courseIdx === courseIdx && dragOverIdx !== null) {
                                    moveLesson(courseIdx, dragIdx.lessonIdx, dragOverIdx);
                                  }
                                  setDragIdx(null); setDragOverIdx(null);
                                }}
                                style={{
                                  background: dragOverIdx === lessonIdx ? 'rgba(234,88,12,0.04)' : 'transparent',
                                  cursor: 'grab',
                                }}
                              >
                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
                                <span style={{ color: 'hsl(218,35%,58%)' }} className="text-xs w-5 shrink-0 text-center">{lessonIdx + 1}</span>
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: meta.bg }}
                                >
                                  <LessonIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold truncate">{lesson.title}</p>
                                  <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs capitalize">{lesson.duration} · {lesson.type}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={() => { setLessonForm({ title: lesson.title, duration: lesson.duration, type: lesson.type }); setEditingLesson({ courseIdx, lessonId: lesson.id }); }}
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,50%)' }} />
                                  </button>
                                  <button
                                    onClick={() => moveLesson(courseIdx, lessonIdx, lessonIdx - 1)}
                                    disabled={lessonIdx === 0}
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,50%)' }} />
                                  </button>
                                  <button
                                    onClick={() => moveLesson(courseIdx, lessonIdx, lessonIdx + 1)}
                                    disabled={lessonIdx === course.lessons.length - 1}
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,50%)' }} />
                                  </button>
                                  <button
                                    onClick={() => deleteLesson(courseIdx, lesson.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16 bg-white border border-border rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'hsl(218,35%,70%)' }} />
            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No courses yet</p>
            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm mb-4">Click "Add Course" to create your first course.</p>
            <Button onClick={openAddCourse} className="brand-gradient text-white font-bold gap-1.5">
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          </div>
        )}
      </div>

      {/* ── Course Modal ── */}
      {(modal?.type === 'add-course' || modal?.type === 'edit-course') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">
                {modal.type === 'add-course' ? 'Add New Course' : 'Edit Course'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Course Title *</Label>
                <Input
                  value={courseForm.title}
                  onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Basic Forex Trading Course"
                  style={{ color: 'hsl(218,72%,12%)' }}
                  className="placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Description</Label>
                <Textarea
                  value={courseForm.description}
                  onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What students will learn in this course..."
                  rows={3}
                  style={{ color: 'hsl(218,72%,12%)' }}
                  className="resize-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Unlock Requirement</Label>
                <Input
                  value={courseForm.requiredForUnlock}
                  onChange={e => setCourseForm(p => ({ ...p, requiredForUnlock: e.target.value }))}
                  placeholder="e.g. 3 direct paid referrals"
                  style={{ color: 'hsl(218,72%,12%)' }}
                  className="placeholder:text-muted-foreground"
                />
              </div>
              <div
                className="rounded-xl p-3 flex gap-2"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                <p style={{ color: '#92400e' }} className="text-xs">
                  Course thumbnail upload requires Supabase Storage. The thumbnail can be set after connecting your backend.
                </p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  onClick={saveCourseMeta}
                  className="flex-1 brand-gradient text-white font-bold gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {modal.type === 'add-course' ? 'Add Course' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setModal(null)} className="border-border">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign to Students Modal ── */}
      {modal?.type === 'assign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Assign Course to Student</h2>
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{courses[modal.courseIdx].title}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {students.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border hover:bg-muted/20 transition-colors"
                  style={{ borderColor: 'hsl(215,18%,85%)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                    >
                      {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold">{s.fullName}</p>
                      <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{s.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => assignCourseToStudent(modal.courseIdx, s.id)}
                    className="text-xs font-semibold gap-1"
                    style={{ background: 'hsl(218,72%,18%)', color: '#ffffff' }}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border shrink-0">
              <Button variant="outline" onClick={() => setModal(null)} className="w-full border-border">Close</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function LessonForm({
  form,
  setForm,
}: {
  form: { title: string; duration: string; type: 'video' | 'pdf' | 'quiz' };
  setForm: (f: typeof form) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2 space-y-1">
        <Label style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold">Lesson Title *</Label>
        <Input
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Introduction to Candlestick Charts"
          style={{ color: 'hsl(218,72%,12%)' }}
          className="text-sm placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-1">
        <Label style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold">Duration</Label>
        <Input
          value={form.duration}
          onChange={e => setForm({ ...form, duration: e.target.value })}
          placeholder="e.g. 45 min"
          style={{ color: 'hsl(218,72%,12%)' }}
          className="text-sm placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-1">
        <Label style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold">Type</Label>
        <select
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value as 'video' | 'pdf' | 'quiz' })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: 'hsl(215,18%,85%)', color: 'hsl(218,72%,12%)', background: '#ffffff' }}
        >
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="quiz">Quiz</option>
        </select>
      </div>
    </div>
  );
}
