import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Lock, Clock, Users, BookOpen, TrendingUp,
  Trophy, Award, Star, ChevronRight, AlertCircle, Zap, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';

interface StageData {
  id: number;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  requirement: string;
  description: string;
  unlocks: string;
  status: 'completed' | 'active' | 'locked' | 'pending';
  progressValue?: number;
  progressMax?: number;
  progressLabel?: string;
  actionLabel?: string;
  actionPath?: string;
  completionPct: number;
}

function buildStages(student: NonNullable<ReturnType<typeof useStudentAuth>['student']>): StageData[] {
  const allStudents = getStudentsStore();
  const directStudents = allStudents.filter(s => student.directReferrals.includes(s.id));
  const directs3Done = directStudents.filter(d => d.directReferrals.length >= 3).length;

  const isActive = !['pending', 'payment_review'].includes(student.status);
  const basicDone = student.basicCourseStatus === 'completed';
  const nextDone = student.nextCourseStatus === 'completed';
  const finalDone = student.finalCourseStatus === 'completed';
  const direct3Met = student.directReferrals.length >= 3;
  const threeByThreeMet = directs3Done >= 3;
  const trainingPassed = student.challengeTrainingStatus === 'passed';
  const profirmPassed = student.challengeProfirmStatus === 'passed';
  const certIssued = student.certificateIssued;
  const logCount = JSON.parse(localStorage.getItem(`philmac_training_logs_${student.id}`) || '[]').length as number;

  return [
    {
      id: 1,
      label: 'Register & Subscribe',
      subtitle: 'Stage 1',
      icon: Star,
      accentColor: '#d97706',
      accentBg: '#fef3c7',
      requirement: 'Submit registration form and pay $100 subscription',
      description: 'Create your PHILMAC Cebu account, submit registration details, and complete the $100 training subscription to activate your student portal.',
      unlocks: 'Student portal access, referral code, and Basic Course',
      status: isActive ? 'completed' : student.status === 'payment_review' ? 'pending' : 'active',
      completionPct: isActive ? 100 : student.status === 'payment_review' ? 50 : 0,
      progressLabel: isActive ? 'Subscription verified' : student.status === 'payment_review' ? 'Payment under review' : 'Not started',
    },
    {
      id: 2,
      label: 'Basic Forex Course',
      subtitle: 'Stage 2',
      icon: BookOpen,
      accentColor: '#2563eb',
      accentBg: '#dbeafe',
      requirement: 'Complete all Basic Course lessons (video + quizzes)',
      description: 'Learn forex fundamentals, market structure, candlestick patterns, support & resistance, and trading psychology through structured lesson modules.',
      unlocks: 'Eligibility to invite referrals and unlock Next Course',
      status: !isActive ? 'locked' : basicDone ? 'completed' : 'active',
      progressValue: student.basicCourseProgress,
      progressMax: 100,
      progressLabel: `${student.basicCourseProgress}% complete`,
      actionLabel: 'Go to Basic Course',
      actionPath: '/student/courses',
      completionPct: student.basicCourseProgress,
    },
    {
      id: 3,
      label: 'Invite 3 Direct Referrals',
      subtitle: 'Stage 3',
      icon: Users,
      accentColor: '#7c3aed',
      accentBg: '#ede9fe',
      requirement: '3 direct contacts must sign up and pay $100 each',
      description: 'Share your unique referral code with friends or contacts. They must register and complete the $100 subscription to count as your direct referral.',
      unlocks: 'Technical Analysis Training (Next Course)',
      status: !isActive ? 'locked' : direct3Met ? 'completed' : basicDone ? 'active' : 'locked',
      progressValue: student.directReferrals.length,
      progressMax: 3,
      progressLabel: `${student.directReferrals.length} of 3 direct referrals subscribed`,
      actionLabel: 'Share Referral Link',
      actionPath: '/student/referrals',
      completionPct: Math.min(Math.round((student.directReferrals.length / 3) * 100), 100),
    },
    {
      id: 4,
      label: 'Technical Analysis Training',
      subtitle: 'Stage 4',
      icon: TrendingUp,
      accentColor: '#0891b2',
      accentBg: '#cffafe',
      requirement: 'Complete all Technical Analysis Training lessons',
      description: 'Advanced chart patterns, trend indicators, RSI/MACD analysis, entry and exit strategies, and a structured trading journal setup.',
      unlocks: 'Eligibility for Final Course once 3×3 network is complete',
      status: !direct3Met ? 'locked' : nextDone ? 'completed' : direct3Met ? 'active' : 'locked',
      progressValue: student.nextCourseProgress,
      progressMax: 100,
      progressLabel: `${student.nextCourseProgress}% complete`,
      actionLabel: 'Continue Next Course',
      actionPath: '/student/courses',
      completionPct: student.nextCourseProgress,
    },
    {
      id: 5,
      label: 'Build 3×3 Referral Network',
      subtitle: 'Stage 5',
      icon: Users,
      accentColor: '#6d28d9',
      accentBg: '#ede9fe',
      requirement: 'Each of your 3 directs must invite 3 paid students (9 total)',
      description: 'Your 3 direct referrals each need to bring in 3 paid subscribers — creating a 3×3 network of 9 second-level students to unlock the Final Course.',
      unlocks: 'Advanced Trading Mentorship (Final Course)',
      status: !direct3Met ? 'locked' : threeByThreeMet ? 'completed' : 'active',
      progressValue: directs3Done,
      progressMax: 3,
      progressLabel: `${directs3Done} of 3 directs have 3+ paid sub-referrals`,
      actionLabel: 'View Referral Tree',
      actionPath: '/student/referrals',
      completionPct: Math.min(Math.round((directs3Done / 3) * 100), 100),
    },
    {
      id: 6,
      label: 'Advanced Trading Mentorship',
      subtitle: 'Stage 6',
      icon: BookOpen,
      accentColor: '#0f766e',
      accentBg: '#ccfbf1',
      requirement: 'Complete all Advanced Mentorship lessons',
      description: 'Strategy refinement, position sizing mastery, professional risk management frameworks, trading routine building, and challenge preparation.',
      unlocks: '30-Day Training Challenge access',
      status: !threeByThreeMet ? 'locked' : finalDone ? 'completed' : threeByThreeMet ? 'active' : 'locked',
      progressValue: student.finalCourseProgress,
      progressMax: 100,
      progressLabel: `${student.finalCourseProgress}% complete`,
      actionLabel: 'Continue Final Course',
      actionPath: '/student/courses',
      completionPct: student.finalCourseProgress,
    },
    {
      id: 7,
      label: '30-Day Training Challenge',
      subtitle: 'Stage 7',
      icon: Trophy,
      accentColor: '#b45309',
      accentBg: '#fef3c7',
      requirement: 'Submit 30 daily trading logs and pass admin review',
      description: 'Complete 30 consecutive days of trading journal entries, market analysis notes, risk management checklists, and screenshot documentation.',
      unlocks: '30-Day Pro Firm Challenge access',
      status: !finalDone ? 'locked'
        : trainingPassed ? 'completed'
        : student.challengeTrainingStatus === 'active' ? 'active'
        : finalDone ? 'active'
        : 'locked',
      progressValue: logCount,
      progressMax: 30,
      progressLabel: trainingPassed ? '30/30 days — Passed!' : `${logCount}/30 logs submitted`,
      actionLabel: 'Go to Training Challenge',
      actionPath: '/student/challenge-training',
      completionPct: trainingPassed ? 100 : Math.min(Math.round((logCount / 30) * 100), 100),
    },
    {
      id: 8,
      label: '30-Day Pro Firm Challenge',
      subtitle: 'Stage 8',
      icon: Trophy,
      accentColor: '#dc2626',
      accentBg: '#fee2e2',
      requirement: 'Complete 30-day Pro Firm evaluation and pass admin review',
      description: 'Final evaluation: 30-day trading discipline, real-time risk monitoring, daily performance reporting, and professional evaluation by PHILMAC mentors.',
      unlocks: 'PHILMAC Certificate + $500 Completion Award',
      status: !trainingPassed ? 'locked'
        : profirmPassed ? 'completed'
        : student.challengeProfirmStatus === 'active' ? 'active'
        : trainingPassed ? 'active'
        : 'locked',
      progressValue: profirmPassed ? 30 : student.challengeProfirmStatus === 'active' ? 8 : 0,
      progressMax: 30,
      progressLabel: profirmPassed ? '30/30 days — Passed!' : student.challengeProfirmStatus === 'active' ? 'Day 8 of 30 in progress' : 'Locked until Training Challenge passes',
      actionLabel: 'Go to Pro Firm Challenge',
      actionPath: '/student/challenge-profirm',
      completionPct: profirmPassed ? 100 : student.challengeProfirmStatus === 'active' ? Math.round((8 / 30) * 100) : 0,
    },
    {
      id: 9,
      label: 'Certification & $500 Award',
      subtitle: 'Stage 9',
      icon: Award,
      accentColor: '#065f46',
      accentBg: '#d1fae5',
      requirement: 'Pass Pro Firm Challenge — admin verifies all requirements',
      description: 'Admin reviews all completed requirements and issues your official PHILMAC Cebu Training Certificate and the $500 Completion Award.',
      unlocks: 'Certified PHILMAC Trader — your journey complete!',
      status: certIssued ? 'completed' : profirmPassed ? 'pending' : 'locked',
      completionPct: certIssued ? 100 : profirmPassed ? 75 : 0,
      progressLabel: certIssued ? 'Certificate issued' : profirmPassed ? 'Awaiting admin verification' : 'Locked',
      actionLabel: 'View Certificate & Award',
      actionPath: '/student/certificates',
    },
  ];
}

// ── Status metadata ─────────────────────────────────────────────────────────
const STATUS_META = {
  completed: { label: 'Completed',     ringColor: '#16a34a', textColor: '#166534', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
  active:    { label: 'In Progress',   ringColor: 'hsl(18,90%,48%)', textColor: '#9a3412', bgColor: '#fff7ed', borderColor: '#fed7aa' },
  pending:   { label: 'Pending Review',ringColor: '#d97706', textColor: '#92400e', bgColor: '#fffbeb', borderColor: '#fde68a' },
  locked:    { label: 'Locked',        ringColor: 'hsl(215,18%,75%)', textColor: 'hsl(218,35%,52%)', bgColor: '#ffffff', borderColor: 'hsl(215,18%,88%)' },
};

// ── Donut ring SVG ──────────────────────────────────────────────────────────
function DonutRing({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', shrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(215,18%,90%)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

export default function StudentStages() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const stages = buildStages(student);
  const completedCount = stages.filter(s => s.status === 'completed').length;
  const overallPct = Math.round((completedCount / stages.length) * 100);
  const currentStage = stages.find(s => s.status === 'active' || s.status === 'pending');

  return (
    <StudentLayout>
      <div className="max-w-3xl space-y-5">

        {/* ── Header ── */}
        <div>
          <h1 className="text-xl font-black" style={{ color: 'hsl(218,72%,12%)' }}>Training Stage Map</h1>
          <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm mt-0.5">
            Your complete 9-stage journey from registration to Certified PHILMAC Trader.
          </p>
        </div>

        {/* ── Overall Progress Banner ── */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(218,72%,14%), hsl(218,72%,8%))' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 90% 50%, rgba(234,88,12,0.18) 0%, transparent 60%)' }}
          />
          <div className="relative flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Big ring */}
              <div className="relative shrink-0">
                <DonutRing pct={overallPct} color="hsl(18,90%,54%)" size={72} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 900, lineHeight: 1 }}>{overallPct}%</span>
                </div>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs font-semibold uppercase tracking-wide mb-1">
                  Overall Progress
                </p>
                <p style={{ color: '#ffffff', fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
                  {completedCount}
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, fontWeight: 400 }}> / {stages.length} stages</span>
                </p>
                {currentStage && (
                  <p style={{ color: 'hsl(18,90%,60%)' }} className="text-xs font-semibold mt-1">
                    Active: {currentStage.label}
                  </p>
                )}
              </div>
            </div>

            {/* Mini milestone markers */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Completed', val: completedCount, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                { label: 'Remaining', val: stages.length - completedCount, color: 'rgba(255,255,255,0.60)', bg: 'rgba(255,255,255,0.06)' },
                { label: 'Locked',    val: stages.filter(s => s.status === 'locked').length, color: 'rgba(255,255,255,0.40)', bg: 'rgba(255,255,255,0.04)' },
              ].map(m => (
                <div key={m.label} className="text-center px-3 py-2 rounded-xl" style={{ background: m.bg }}>
                  <p style={{ color: m.color, fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{m.val}</p>
                  <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 10 }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-4">
            <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.10)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, hsl(218,72%,38%), hsl(18,90%,54%))' }}
              />
            </div>
          </div>
        </div>

        {/* ── Active Stage Spotlight ── */}
        {currentStage && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: currentStage.accentBg,
              border: `2px solid ${currentStage.accentColor}40`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" style={{ color: currentStage.accentColor }} />
              <span className="text-xs font-black uppercase tracking-wide" style={{ color: currentStage.accentColor }}>
                {currentStage.status === 'pending' ? 'Pending Review' : 'Currently Active'} — {currentStage.subtitle}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black leading-tight mb-1" style={{ color: 'hsl(218,72%,12%)' }}>
                  {currentStage.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(218,35%,38%)' }}>
                  {currentStage.description}
                </p>
              </div>
              {currentStage.actionLabel && currentStage.actionPath && (
                <Button
                  asChild size="sm"
                  className="shrink-0 gap-1.5 font-bold text-white"
                  style={{ background: currentStage.accentColor }}
                >
                  <Link to={currentStage.actionPath}>
                    {currentStage.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            {currentStage.progressValue !== undefined && currentStage.progressMax !== undefined && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'hsl(218,72%,12%)' }}>{currentStage.progressLabel}</span>
                  <span className="text-xs font-black" style={{ color: currentStage.accentColor }}>
                    {currentStage.progressValue}/{currentStage.progressMax}
                  </span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((currentStage.progressValue / currentStage.progressMax) * 100, 100)}%`,
                      background: currentStage.accentColor,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Stage Cards Grid ── */}
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const meta = STATUS_META[stage.status];
            const StageIcon = stage.icon;
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const isPending = stage.status === 'pending';
            const isLocked = stage.status === 'locked';

            return (
              <div
                key={stage.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  border: `1.5px solid ${meta.borderColor}`,
                  background: meta.bgColor,
                  opacity: isLocked ? 0.65 : 1,
                }}
              >
                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Stage Icon + Donut */}
                    <div className="relative shrink-0">
                      <DonutRing pct={stage.completionPct} color={isLocked ? 'hsl(215,18%,78%)' : stage.accentColor} size={52} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4" style={{ color: 'hsl(215,18%,65%)' }} />
                        ) : isPending ? (
                          <Clock className="w-4 h-4" style={{ color: '#d97706' }} />
                        ) : (
                          <StageIcon className="w-4 h-4" style={{ color: stage.accentColor }} />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs font-semibold" style={{ color: 'hsl(218,35%,55%)' }}>
                              {stage.subtitle}
                            </span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: meta.bgColor === '#ffffff' ? 'hsl(215,18%,90%)' : 'rgba(0,0,0,0.07)', color: meta.textColor }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <h3
                            className="font-black text-sm sm:text-base leading-tight"
                            style={{ color: isLocked ? 'hsl(218,35%,52%)' : 'hsl(218,72%,12%)' }}
                          >
                            {stage.label}
                          </h3>
                        </div>

                        {/* Completion % badge */}
                        <div
                          className="text-right shrink-0 px-2 py-1 rounded-xl"
                          style={{ background: isCompleted ? '#dcfce7' : isLocked ? 'hsl(215,18%,92%)' : stage.accentBg }}
                        >
                          <span
                            className="font-black"
                            style={{
                              fontSize: 18,
                              lineHeight: 1,
                              color: isCompleted ? '#16a34a' : isLocked ? 'hsl(215,18%,62%)' : stage.accentColor,
                            }}
                          >
                            {stage.completionPct}%
                          </span>
                        </div>
                      </div>

                      {/* Description for active/completed stages */}
                      {(isActive || isCompleted || isPending) && (
                        <p className="text-xs leading-relaxed mt-1.5" style={{ color: 'hsl(218,35%,42%)' }}>
                          {stage.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for active stages */}
                  {(isActive || isPending) && stage.progressValue !== undefined && stage.progressMax !== undefined && (
                    <div className="mt-3 ml-16">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-xs" style={{ color: 'hsl(218,35%,48%)' }}>{stage.progressLabel}</span>
                        <span className="text-xs font-bold" style={{ color: stage.accentColor }}>
                          {stage.progressValue}/{stage.progressMax}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((stage.progressValue / stage.progressMax) * 100, 100)}%`,
                            background: stage.accentColor,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded footer for non-locked stages */}
                {!isLocked && (
                  <div
                    className="px-4 pb-4 pt-0 ml-16 space-y-3"
                  >
                    {/* Requirement chip */}
                    <div
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{
                        background: isCompleted ? '#f0fdf4' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${isCompleted ? '#bbf7d0' : 'rgba(0,0,0,0.06)'}`,
                      }}
                    >
                      {isCompleted
                        ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                        : isPending
                        ? <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                        : <div className="w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border-2" style={{ borderColor: stage.accentColor }} />}
                      <div>
                        <span className="text-xs font-semibold" style={{ color: 'hsl(218,35%,48%)' }}>Requirement: </span>
                        <span className="text-xs" style={{ color: isCompleted ? '#166534' : 'hsl(218,72%,12%)' }}>
                          {stage.requirement}
                        </span>
                      </div>
                    </div>

                    {/* Unlocks row */}
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 shrink-0" style={{ color: stage.accentColor }} />
                      <p className="text-xs" style={{ color: 'hsl(218,35%,42%)' }}>
                        <span className="font-semibold" style={{ color: 'hsl(218,72%,12%)' }}>Unlocks: </span>
                        {stage.unlocks}
                      </p>
                    </div>

                    {/* Action button */}
                    {isActive && stage.actionLabel && stage.actionPath && (
                      <Button
                        asChild size="sm"
                        className="gap-1.5 font-bold text-white h-8 text-xs"
                        style={{ background: stage.accentColor }}
                      >
                        <Link to={stage.actionPath}>
                          {stage.actionLabel} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#d97706' }} />
                        <span className="text-xs font-semibold" style={{ color: '#92400e' }}>
                          Waiting for admin verification — usually within 24 hours
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Locked footer */}
                {isLocked && (
                  <div className="px-4 pb-3 ml-16">
                    <p className="text-xs" style={{ color: 'hsl(218,35%,58%)' }}>
                      <span className="font-semibold">Unlock condition: </span>{stage.requirement}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Completion Banner ── */}
        {(student.status === 'completed' || student.status === 'awarded') ? (
          <div
            className="rounded-2xl p-6 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #065f46, #047857)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
            <div className="relative">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-white" />
              <h3 className="text-xl font-black text-white mb-2">Congratulations, Certified Trader!</h3>
              <p style={{ color: 'rgba(255,255,255,0.75)' }} className="text-sm mb-4">
                You have completed all stages of the PHILMAC Cebu training program.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button asChild size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/15">
                  <Link to="/student/certificates">View Certificate</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/15">
                  <Link to="/student/awards">View Award</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center relative overflow-hidden"
            style={{ background: 'hsl(218,72%,10%)', border: '1px solid hsl(218,72%,20%)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(234,88,12,0.12) 0%, transparent 60%)' }} />
            <div className="relative">
              <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(18,90%,54%)' }} />
              <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs font-semibold uppercase tracking-wide mb-1">
                Complete all stages to earn
              </p>
              <p style={{ color: 'hsl(18,90%,54%)', fontSize: 20, fontWeight: 900 }}>
                PHILMAC Cebu Certificate + $500 Award
              </p>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
