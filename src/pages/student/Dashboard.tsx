import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Copy, BookOpen, Users, TrendingUp, Trophy, Award, CheckCircle,
  Clock, Lock, ChevronRight, Star, DollarSign, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ChallengeLog } from '@/types';

// ─── 7-Step Journey Config ──────────────────────────────────────────────────
const STAGES = [
  { step: 1, label: 'Register & Subscribe',    icon: Star,       route: '/student/subscription' },
  { step: 2, label: 'Basic Course',            icon: BookOpen,   route: '/student/courses' },
  { step: 3, label: 'Build 3 Referrals',       icon: Users,      route: '/student/referrals' },
  { step: 4, label: 'Technical + Advanced',    icon: TrendingUp, route: '/student/courses' },
  { step: 5, label: '30-Day Challenges',       icon: Trophy,     route: '/student/challenge-training' },
  { step: 6, label: 'Get Certified',           icon: Award,      route: '/student/certificates' },
  { step: 7, label: 'Earn $500 Award',         icon: DollarSign, route: '/student/awards' },
];

// ─── Activity Feed Builder ──────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  label: string;
  detail: string;
  time: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center">
      <div style={{ color: '#ffffff' }}>Loading...</div>
    </div>
  );

  const referralLink = `philmaccebu.com/register?ref=${student.referralCode}`;
  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  // ── Determine current active stage ──
  const currentStage = useMemo(() => {
    if (student.certificateIssued) return 7;
    if (student.challengeTrainingStatus === 'passed' || student.challengeProfirmStatus === 'passed') return 6;
    if (student.finalCourseStatus === 'in_progress' || student.finalCourseStatus === 'completed' || student.nextCourseStatus === 'completed') return 5;
    if (student.basicCourseStatus === 'completed' && student.directReferrals.length >= 3) return 4;
    if (student.basicCourseStatus === 'in_progress' || student.basicCourseStatus === 'completed') return 3;
    if (student.status === 'active' || student.status === 'basic_course') return 2;
    return 1;
  }, [student]);

  // ── Course progress ──
  const courses = [
    { title: 'Basic Forex Course',     pct: student.basicCourseProgress,  status: student.basicCourseStatus,  color: '#2563eb' },
    { title: 'Technical Analysis',     pct: student.nextCourseProgress,   status: student.nextCourseStatus,   color: '#7c3aed' },
    { title: 'Advanced Mentorship',    pct: student.finalCourseProgress,  status: student.finalCourseStatus,  color: 'hsl(18,90%,48%)' },
  ];

  // ── Referral network ──
  const directCount = student.directReferrals.length;
  const level2Count = student.secondLevelReferrals?.length ?? 0;
  const networkTotal = directCount + level2Count;
  const networkPct = Math.round((networkTotal / 12) * 100);
  const direct3Done = directCount >= 3;
  const threeByThreeDone = level2Count >= 9;

  // ── Challenge statuses ──
  const challenges = [
    {
      label: '30-Day Training',
      status: student.challengeTrainingStatus,
      route: '/student/challenge-training',
    },
    {
      label: 'Pro Firm Challenge',
      status: student.challengeProfirmStatus,
      route: '/student/challenge-profirm',
    },
  ];

  // ── Activity feed (last 5 events) ──
  const activityFeed = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Registration
    items.push({
      id: 'reg',
      label: 'Account Registered',
      detail: `Referral code: ${student.referralCode}`,
      time: student.registeredAt,
      icon: Star,
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
    });

    // Subscription approved
    if (student.approvedAt) {
      items.push({
        id: 'approved',
        label: 'Subscription Approved',
        detail: 'Account activated by admin',
        time: student.approvedAt,
        icon: CheckCircle,
        iconBg: '#dcfce7',
        iconColor: '#16a34a',
      });
    }

    // Basic course started / completed
    if (student.basicCourseStatus !== 'locked') {
      items.push({
        id: 'basic',
        label: student.basicCourseStatus === 'completed' ? 'Basic Course Completed' : 'Basic Course Started',
        detail: `${student.basicCourseProgress}% complete`,
        time: student.approvedAt || student.registeredAt,
        icon: BookOpen,
        iconBg: '#dbeafe',
        iconColor: '#2563eb',
      });
    }

    // Referrals added
    if (directCount > 0) {
      items.push({
        id: 'referrals',
        label: `${directCount} Direct Referral${directCount !== 1 ? 's' : ''} Added`,
        detail: direct3Done ? 'Next course unlock condition met!' : `${3 - directCount} more needed to unlock`,
        time: student.approvedAt || student.registeredAt,
        icon: Users,
        iconBg: '#ede9fe',
        iconColor: '#7c3aed',
      });
    }

    // Challenge training logs
    const logs: ChallengeLog[] = JSON.parse(localStorage.getItem(`philmac_training_logs_${student.id}`) || '[]');
    if (logs.length > 0) {
      const latest = logs[logs.length - 1];
      items.push({
        id: `log-${latest.day}`,
        label: `Day ${latest.day} Training Log Submitted`,
        detail: `${logs.length}/30 logs total · ${logs.filter(l => l.approved).length} approved`,
        time: latest.submittedAt,
        icon: TrendingUp,
        iconBg: '#fef3c7',
        iconColor: '#92400e',
      });
    }

    // Certificate issued
    if (student.certificateIssued) {
      items.push({
        id: 'cert',
        label: 'Certificate Issued',
        detail: `Certificate No. ${student.certificateNumber || '—'}`,
        time: student.certificateDate || new Date().toISOString(),
        icon: Award,
        iconBg: '#d1fae5',
        iconColor: '#065f46',
      });
    }

    // Award status
    if (student.awardStatus !== 'not_qualified') {
      items.push({
        id: 'award',
        label: `Award Status: ${student.awardStatus.replace(/_/g, ' ')}`,
        detail: student.awardStatus === 'paid' ? `Reference: ${student.awardReference}` : 'Contact admin for updates',
        time: new Date().toISOString(),
        icon: DollarSign,
        iconBg: 'rgba(234,88,12,0.12)',
        iconColor: 'hsl(18,90%,48%)',
      });
    }

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [student, directCount, direct3Done]);

  const challengeStatusMeta = (status: string) => {
    if (status === 'passed') return { bg: '#dcfce7', color: '#166534', label: 'Passed' };
    if (status === 'active') return { bg: '#fef3c7', color: '#92400e', label: 'Active' };
    if (status === 'failed') return { bg: '#fee2e2', color: '#991b1b', label: 'Failed' };
    return { bg: 'hsl(215,18%,90%)', color: 'hsl(218,35%,52%)', label: 'Not Started' };
  };

  return (
    <StudentLayout>
      <div className="space-y-5 max-w-5xl">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-foreground">
              Welcome back, {student.fullName.split(' ')[0]}!
            </h1>
            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm mt-0.5">
              Here is your complete training progress overview.
            </p>
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: student.status === 'active' || student.status === 'basic_course' ? '#dcfce7' : 'hsl(215,18%,90%)',
              color: student.status === 'active' || student.status === 'basic_course' ? '#166534' : 'hsl(218,35%,45%)',
            }}
          >
            <Zap className="w-3 h-3" />
            {student.status.replace(/_/g, ' ')}
          </div>
        </div>

        {/* ── Referral Code Banner ── */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(218,72%,18%), hsl(218,72%,12%))' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 85% 50%, rgba(234,88,12,0.15) 0%, transparent 60%)' }}
          />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs font-semibold uppercase tracking-wide mb-1">
                Your Referral Code
              </p>
              <p style={{ color: 'hsl(18,90%,54%)', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                {student.referralCode}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.40)' }} className="text-xs mt-1 font-mono">{referralLink}</p>
            </div>
            <Button
              size="sm"
              onClick={copyReferral}
              variant="outline"
              className="gap-1.5 border-white/25 text-white hover:bg-white/10 font-semibold shrink-0"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </Button>
          </div>
        </div>

        {/* ── 7-Step Stage Tracker ── */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Your Journey</h2>
            <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs font-semibold">
              Stage {currentStage} of 7
            </span>
          </div>

          {/* Desktop: horizontal steps */}
          <div className="hidden sm:flex items-start gap-0 relative">
            {/* Connecting track */}
            <div
              className="absolute top-4 left-0 right-0 h-0.5 z-0"
              style={{ background: 'hsl(215,18%,88%)' }}
            />
            <div
              className="absolute top-4 left-0 h-0.5 z-0 transition-all duration-700"
              style={{
                background: 'linear-gradient(90deg, hsl(218,72%,22%), hsl(18,90%,54%))',
                width: `${((currentStage - 1) / 6) * 100}%`,
              }}
            />

            {STAGES.map((stage) => {
              const StageIcon = stage.icon;
              const isDone = currentStage > stage.step;
              const isActive = currentStage === stage.step;
              const isLocked = currentStage < stage.step;

              return (
                <div key={stage.step} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Circle */}
                  <Link to={isDone || isActive ? stage.route : '#'}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isDone
                          ? 'hsl(218,72%,18%)'
                          : isActive
                          ? 'linear-gradient(135deg, hsl(18,90%,50%), hsl(18,80%,42%))'
                          : '#ffffff',
                        border: `2px solid ${isDone ? 'hsl(218,72%,18%)' : isActive ? 'hsl(18,90%,50%)' : 'hsl(215,18%,80%)'}`,
                        boxShadow: isActive ? '0 0 0 4px rgba(234,88,12,0.20)' : undefined,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isActive ? (
                        <StageIcon className="w-4 h-4 text-white" />
                      ) : (
                        <Lock className="w-3 h-3" style={{ color: 'hsl(215,18%,65%)' }} />
                      )}
                    </div>
                  </Link>
                  {/* Label */}
                  <p
                    className="text-center mt-2 leading-snug"
                    style={{
                      fontSize: 10,
                      fontWeight: isDone ? 500 : isActive ? 700 : 400,
                      color: isDone ? 'hsl(218,35%,50%)' : isActive ? 'hsl(218,72%,12%)' : 'hsl(215,18%,68%)',
                      maxWidth: 68,
                    }}
                  >
                    {stage.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile: compact vertical list */}
          <div className="sm:hidden space-y-2">
            {STAGES.map((stage) => {
              const StageIcon = stage.icon;
              const isDone = currentStage > stage.step;
              const isActive = currentStage === stage.step;

              return (
                <Link
                  key={stage.step}
                  to={isDone || isActive ? stage.route : '#'}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                  style={{
                    background: isActive ? 'rgba(234,88,12,0.07)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(234,88,12,0.25)' : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isDone ? 'hsl(218,72%,18%)' : isActive ? 'hsl(18,90%,50%)' : 'hsl(215,18%,92%)',
                    }}
                  >
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <StageIcon className="w-3.5 h-3.5" style={{ color: isActive ? '#ffffff' : 'hsl(215,18%,58%)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: isDone ? 'hsl(218,35%,52%)' : isActive ? 'hsl(218,72%,12%)' : 'hsl(215,18%,65%)' }}
                    >
                      Step {stage.step}: {stage.label}
                    </p>
                  </div>
                  {isActive && <span className="text-xs font-bold shrink-0" style={{ color: 'hsl(18,90%,48%)' }}>Current</span>}
                  {isDone && <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#16a34a' }} />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Three-Column Info Row ── */}
        <div className="grid sm:grid-cols-3 gap-4">

          {/* Course Progress */}
          <div className="sm:col-span-2 bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Course Progress</h2>
              <Link to="/student/courses">
                <span style={{ color: 'hsl(18,90%,48%)' }} className="text-xs font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.title}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {course.status === 'locked'
                        ? <Lock className="w-3 h-3 shrink-0" style={{ color: 'hsl(215,18%,65%)' }} />
                        : <BookOpen className="w-3 h-3 shrink-0" style={{ color: course.color }} />}
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: course.status === 'locked' ? 'hsl(215,18%,60%)' : 'hsl(218,72%,12%)' }}
                      >
                        {course.title}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                      style={{
                        background: course.status === 'completed' ? '#dcfce7' : course.status === 'locked' ? 'hsl(215,18%,92%)' : '#fef3c7',
                        color: course.status === 'completed' ? '#166534' : course.status === 'locked' ? 'hsl(215,18%,55%)' : '#92400e',
                      }}
                    >
                      {course.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${course.pct}%`,
                          background: course.status === 'locked'
                            ? 'hsl(215,18%,75%)'
                            : course.status === 'completed'
                            ? '#22c55e'
                            : course.color,
                        }}
                      />
                    </div>
                    <span style={{ color: 'hsl(218,35%,55%)', fontSize: 11, minWidth: 28, textAlign: 'right' }}>
                      {course.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Network Ring */}
          <div className="bg-white border border-border rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Referral Network</h2>
              <Link to="/student/referrals">
                <span style={{ color: 'hsl(18,90%,48%)' }} className="text-xs font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {/* Visual ring */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-3">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(215,18%,88%)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke="url(#netGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(networkPct / 100) * 201} 201`}
                    style={{ transition: 'stroke-dasharray 0.7s ease' }}
                  />
                  <defs>
                    <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(218,72%,22%)" />
                      <stop offset="100%" stopColor="hsl(18,90%,54%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ color: 'hsl(218,72%,12%)', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                    {networkTotal}
                  </span>
                  <span style={{ color: 'hsl(218,35%,55%)', fontSize: 10 }}>/ 12</span>
                </div>
              </div>

              <div className="space-y-1.5 w-full">
                {[
                  { label: 'Direct (L1)', val: directCount, max: 3, done: direct3Done, color: '#2563eb' },
                  { label: 'Level 2',     val: level2Count, max: 9, done: threeByThreeDone, color: '#7c3aed' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span style={{ color: 'hsl(218,35%,55%)', fontSize: 10, minWidth: 48 }}>{r.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((r.val / r.max) * 100, 100)}%`,
                          background: r.done ? '#22c55e' : r.color,
                        }}
                      />
                    </div>
                    <span style={{ color: r.done ? '#16a34a' : 'hsl(218,35%,55%)', fontSize: 10, minWidth: 22, textAlign: 'right', fontWeight: 700 }}>
                      {r.val}/{r.max}
                    </span>
                    {r.done && <CheckCircle className="w-3 h-3 shrink-0" style={{ color: '#16a34a' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Challenge Status + Award Row ── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {challenges.map(ch => {
            const meta = challengeStatusMeta(ch.status);
            return (
              <Link key={ch.label} to={ch.route} className="bg-white border border-border rounded-2xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 shrink-0" style={{ color: 'hsl(18,90%,48%)' }} />
                  <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-xs leading-tight">{ch.label}</p>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {ch.status === 'passed'
                    ? <CheckCircle className="w-3 h-3" />
                    : ch.status === 'active'
                    ? <Clock className="w-3 h-3" />
                    : <Lock className="w-3 h-3" />}
                  {meta.label}
                </div>
                {/* Training log count */}
                {ch.label === '30-Day Training' && (
                  <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-2">
                    {JSON.parse(localStorage.getItem(`philmac_training_logs_${student.id}`) || '[]').length}/30 logs
                  </p>
                )}
              </Link>
            );
          })}

          {/* Award status */}
          <Link to="/student/awards" className="bg-white border border-border rounded-2xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 shrink-0" style={{ color: 'hsl(18,90%,48%)' }} />
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-xs leading-tight">$500 Award</p>
            </div>
            <div
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: student.awardStatus === 'paid' ? '#dcfce7' : student.awardStatus === 'approved' ? '#d1fae5' : student.awardStatus === 'pending_review' ? '#fef3c7' : 'hsl(215,18%,90%)',
                color: student.awardStatus === 'paid' ? '#166534' : student.awardStatus === 'approved' ? '#065f46' : student.awardStatus === 'pending_review' ? '#92400e' : 'hsl(218,35%,52%)',
              }}
            >
              {student.awardStatus === 'paid'
                ? <><CheckCircle className="w-3 h-3" /> Paid</>
                : student.awardStatus === 'pending_review'
                ? <><Clock className="w-3 h-3" /> Pending Review</>
                : <><Lock className="w-3 h-3" /> {student.awardStatus.replace(/_/g, ' ')}</>}
            </div>
            {student.awardReference && (
              <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-2 font-mono truncate">
                Ref: {student.awardReference}
              </p>
            )}
          </Link>
        </div>

        {/* ── Recent Activity Feed ── */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div
            className="px-5 py-4 border-b border-border flex items-center justify-between"
            style={{ background: 'hsl(210,20%,97.5%)' }}
          >
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'hsl(18,90%,48%)' }} />
              Recent Activity
            </h2>
            <span style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">Last {activityFeed.length} events</span>
          </div>

          {activityFeed.length === 0 ? (
            <div className="py-10 text-center">
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activityFeed.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-4 px-5 py-3.5">
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: item.iconBg }}
                    >
                      <ItemIcon className="w-4 h-4" style={{ color: item.iconColor }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold leading-tight">
                        {item.label}
                      </p>
                      <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-0.5">{item.detail}</p>
                    </div>
                    {/* Time */}
                    <p style={{ color: 'hsl(218,35%,62%)' }} className="text-xs shrink-0 mt-0.5">
                      {new Date(item.time).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick Links Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'My Courses',    route: '/student/courses',          icon: BookOpen,   bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'Referrals',     route: '/student/referrals',        icon: Users,      bg: '#ede9fe', color: '#7c3aed' },
            { label: 'My Stages',     route: '/student/stages',           icon: TrendingUp, bg: '#fef3c7', color: '#92400e' },
            { label: 'Support',       route: '/student/support',          icon: Clock,      bg: '#d1fae5', color: '#065f46' },
          ].map(({ label, route, icon: Icon, bg, color }) => (
            <Link
              key={label}
              to={route}
              className="bg-white border border-border rounded-xl p-3.5 flex items-center gap-2.5 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ color: 'hsl(215,18%,72%)' }} />
            </Link>
          ))}
        </div>

      </div>
    </StudentLayout>
  );
}
