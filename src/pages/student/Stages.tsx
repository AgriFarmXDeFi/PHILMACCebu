import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Lock, Clock, Users, BookOpen, TrendingUp,
  Trophy, Award, Star, ChevronRight, AlertCircle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  requirement: string;
  description: string;
  unlocks: string;
  status: 'completed' | 'active' | 'locked' | 'pending';
  progressValue?: number;
  progressMax?: number;
  progressLabel?: string;
  actionLabel?: string;
  actionPath?: string;
}

function getStageStatus(student: ReturnType<typeof useStudentAuth>['student']): Stage[] {
  if (!student) return [];

  const allStudents = getStudentsStore();
  const directStudents = allStudents.filter(s => student.directReferrals.includes(s.id));
  const directs3Done = directStudents.filter(d => d.directReferrals.length >= 3).length;
  const secondLevel = student.secondLevelReferrals.length;

  // Determine current active stage index
  const basicDone = student.basicCourseStatus === 'completed' || student.basicCourseProgress === 100;
  const nextDone = student.nextCourseStatus === 'completed' || student.nextCourseProgress === 100;
  const finalDone = student.finalCourseStatus === 'completed' || student.finalCourseProgress === 100;
  const trainingPassed = student.challengeTrainingStatus === 'passed';
  const profirmPassed = student.challengeProfirmStatus === 'passed';
  const direct3Met = student.directReferrals.length >= 3;
  const threeByThreeMet = directs3Done >= 3;
  const isActive = !['pending', 'payment_review'].includes(student.status);
  const certIssued = student.certificateIssued;

  const stages: Stage[] = [
    {
      id: 1,
      title: 'Registered Student',
      subtitle: 'Stage 1',
      icon: Star,
      iconColor: 'text-amber-500',
      requirement: 'Submit registration form',
      description: 'Create your PHILMAC Cebu account and submit your registration details.',
      unlocks: 'Student account access',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Paid Subscriber',
      subtitle: 'Stage 2',
      icon: Zap,
      iconColor: 'text-blue-500',
      requirement: 'Subscribe for $100 — admin verifies payment',
      description: 'Pay the $100 training subscription to unlock your student portal, basic course, and referral system.',
      unlocks: 'Student Portal + Basic Course + Referral Code',
      status: isActive ? 'completed' : student.status === 'payment_review' ? 'pending' : 'active',
    },
    {
      id: 3,
      title: 'Basic Course',
      subtitle: 'Stage 3',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      requirement: 'Complete all Basic Course lessons',
      description: 'Learn forex fundamentals, market structure, candlestick patterns, support & resistance, and trading psychology.',
      unlocks: 'Eligibility to start inviting referrals for Next Course',
      status: !isActive ? 'locked' : basicDone ? 'completed' : 'active',
      progressValue: student.basicCourseProgress,
      progressMax: 100,
      progressLabel: `${student.basicCourseProgress}% complete`,
      actionLabel: 'Go to Basic Course',
      actionPath: '/student/courses',
    },
    {
      id: 4,
      title: 'Invite 3 Direct Students',
      subtitle: 'Stage 4',
      icon: Users,
      iconColor: 'text-purple-600',
      requirement: '3 direct students must subscribe for $100 each',
      description: 'Share your referral code and invite 3 friends or contacts who sign up and pay the $100 training subscription.',
      unlocks: 'Technical Analysis Training (Next Course)',
      status: !isActive ? 'locked' : direct3Met ? 'completed' : basicDone ? 'active' : 'locked',
      progressValue: student.directReferrals.length,
      progressMax: 3,
      progressLabel: `${student.directReferrals.length} of 3 direct referrals paid`,
      actionLabel: 'View Referral Network',
      actionPath: '/student/referrals',
    },
    {
      id: 5,
      title: 'Next Course — Technical Analysis',
      subtitle: 'Stage 5',
      icon: TrendingUp,
      iconColor: 'text-indigo-600',
      requirement: 'Complete Technical Analysis Training',
      description: 'Advanced chart patterns, indicators, entry/exit strategies, trend confirmation methods, and trading journal setup.',
      unlocks: 'Eligibility for Final Course once 3x3 is met',
      status: !direct3Met ? 'locked' : nextDone ? 'completed' : direct3Met ? 'active' : 'locked',
      progressValue: student.nextCourseProgress,
      progressMax: 100,
      progressLabel: `${student.nextCourseProgress}% complete`,
      actionLabel: 'Go to Next Course',
      actionPath: '/student/courses',
    },
    {
      id: 6,
      title: 'Complete 3x3 Referral Network',
      subtitle: 'Stage 6',
      icon: Users,
      iconColor: 'text-violet-600',
      requirement: 'Each of your 3 directs must invite 3 paid students',
      description: 'Your 3 direct referrals each need to bring in 3 paid students — creating a 3x3 network of 9 second-level students.',
      unlocks: 'Advanced Trading Mentorship (Final Course)',
      status: !direct3Met ? 'locked' : threeByThreeMet ? 'completed' : 'active',
      progressValue: directs3Done,
      progressMax: 3,
      progressLabel: `${directs3Done} of 3 directs have 3+ sub-referrals`,
      actionLabel: 'View Referral Tree',
      actionPath: '/student/referrals',
    },
    {
      id: 7,
      title: 'Final Course — Advanced Mentorship',
      subtitle: 'Stage 7',
      icon: BookOpen,
      iconColor: 'text-cyan-600',
      requirement: 'Complete Advanced Trading Mentorship',
      description: 'Advanced strategy development, professional risk control, building a trading routine, and challenge preparation.',
      unlocks: '30-Day Training Challenge access',
      status: !threeByThreeMet ? 'locked' : finalDone ? 'completed' : threeByThreeMet ? 'active' : 'locked',
      progressValue: student.finalCourseProgress,
      progressMax: 100,
      progressLabel: `${student.finalCourseProgress}% complete`,
      actionLabel: 'Go to Final Course',
      actionPath: '/student/courses',
    },
    {
      id: 8,
      title: '30-Day Training Challenge',
      subtitle: 'Stage 8',
      icon: Trophy,
      iconColor: 'text-amber-600',
      requirement: 'Submit 30 daily trading logs and pass admin review',
      description: 'Complete 30 consecutive days of trading journal entries, market analysis notes, risk management checklists, and screenshot uploads.',
      unlocks: '30-Day Pro Firm Challenge access',
      status: !finalDone ? 'locked'
        : trainingPassed ? 'completed'
        : student.challengeTrainingStatus === 'active' ? 'active'
        : finalDone ? 'active'
        : 'locked',
      progressValue: student.challengeTrainingStatus === 'active' ? 15 : trainingPassed ? 30 : 0,
      progressMax: 30,
      progressLabel: student.challengeTrainingStatus === 'active' ? 'Day 15 of 30 in progress'
        : trainingPassed ? '30/30 days — Passed!'
        : 'Not started yet',
      actionLabel: 'Go to Training Challenge',
      actionPath: '/student/challenge-training',
    },
    {
      id: 9,
      title: '30-Day Pro Firm Challenge',
      subtitle: 'Stage 9',
      icon: Trophy,
      iconColor: 'text-brand',
      requirement: 'Complete 30-day Pro Firm evaluation and pass admin review',
      description: 'Final evaluation stage: 30-day trading discipline, risk management monitoring, daily reporting, and performance review.',
      unlocks: 'PHILMAC Certificate + $500 Completion Award',
      status: !trainingPassed ? 'locked'
        : profirmPassed ? 'completed'
        : student.challengeProfirmStatus === 'active' ? 'active'
        : trainingPassed ? 'active'
        : 'locked',
      progressValue: student.challengeProfirmStatus === 'active' ? 8 : profirmPassed ? 30 : 0,
      progressMax: 30,
      progressLabel: student.challengeProfirmStatus === 'active' ? 'Day 8 of 30 in progress'
        : profirmPassed ? '30/30 days — Passed!'
        : 'Locked until Training Challenge passes',
      actionLabel: 'Go to Pro Firm Challenge',
      actionPath: '/student/challenge-profirm',
    },
    {
      id: 10,
      title: 'Certificate & $500 Award',
      subtitle: 'Stage 10',
      icon: Award,
      iconColor: 'text-emerald-600',
      requirement: 'Pass Pro Firm Challenge + Admin verification',
      description: 'Admin verifies all completed requirements and issues your PHILMAC Cebu Training Certificate and $500 Completion Award.',
      unlocks: 'Certified PHILMAC Trader status',
      status: certIssued ? 'completed'
        : profirmPassed ? 'pending'
        : 'locked',
      actionLabel: 'View Certificate & Awards',
      actionPath: '/student/certificates',
    },
  ];

  return stages;
}

const STATUS_CONFIG = {
  completed: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    ring: 'border-green-400 bg-green-50',
    icon: CheckCircle,
    iconClass: 'text-green-500',
    label: 'Completed',
    connector: 'bg-green-400',
  },
  active: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    ring: 'border-brand bg-orange-50',
    icon: Zap,
    iconClass: 'text-brand',
    label: 'In Progress',
    connector: 'bg-brand',
  },
  pending: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    ring: 'border-amber-400 bg-amber-50',
    icon: Clock,
    iconClass: 'text-amber-500',
    label: 'Pending Review',
    connector: 'bg-amber-300',
  },
  locked: {
    badge: 'bg-muted text-muted-foreground border-border',
    ring: 'border-border bg-white',
    icon: Lock,
    iconClass: 'text-muted-foreground',
    label: 'Locked',
    connector: 'bg-border',
  },
};

export default function StudentStages() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const stages = getStageStatus(student);
  const currentActiveStage = stages.find(s => s.status === 'active' || s.status === 'pending');
  const completedCount = stages.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <StudentLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-[hsl(218,72%,12%)]">Course Stage Progress</h1>
          <p className="text-[hsl(218,35%,32%)] text-sm mt-0.5">Your complete journey from registration to certified trader.</p>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-gradient-to-br from-[hsl(218,72%,12%)] to-[hsl(218,72%,20%)] rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Overall Progress</p>
              <p className="text-3xl font-black text-white">{completedCount}<span className="text-white/50 text-xl font-normal"> / {stages.length} stages</span></p>
              {currentActiveStage && (
                <p className="text-brand text-sm font-semibold mt-1">
                  Currently at: {currentActiveStage.title}
                </p>
              )}
            </div>
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="hsl(18,90%,54%)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-sm">{progressPercent}%</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="h-2 rounded-full brand-gradient transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-white/50 text-xs">Registration</span>
            <span className="text-white/50 text-xs">Certified Trader</span>
          </div>
        </div>

        {/* Current Stage Spotlight */}
        {currentActiveStage && (
          <div className="border-2 border-brand rounded-2xl p-5 bg-orange-50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-brand" />
              <span className="text-xs font-black text-brand uppercase tracking-wide">Current Stage</span>
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-[hsl(218,35%,32%)] font-semibold">{currentActiveStage.subtitle}</p>
                <h3 className="text-lg font-black text-[hsl(218,72%,12%)] leading-tight">{currentActiveStage.title}</h3>
                <p className="text-sm text-[hsl(218,35%,32%)] mt-1 leading-relaxed">{currentActiveStage.description}</p>
              </div>
              {currentActiveStage.actionLabel && currentActiveStage.actionPath && (
                <Button asChild size="sm" className="brand-gradient text-white font-bold hover:opacity-90 shrink-0 gap-1.5">
                  <Link to={currentActiveStage.actionPath}>
                    {currentActiveStage.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}
            </div>
            {currentActiveStage.progressValue !== undefined && currentActiveStage.progressMax && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-[hsl(218,72%,12%)]">Progress</span>
                  <span className="text-xs text-[hsl(218,35%,32%)]">{currentActiveStage.progressLabel}</span>
                </div>
                <div className="w-full bg-white rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full brand-gradient transition-all duration-700"
                    style={{ width: `${Math.min((currentActiveStage.progressValue / currentActiveStage.progressMax) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[hsl(218,35%,32%)] mt-1">{currentActiveStage.progressValue} / {currentActiveStage.progressMax}</p>
              </div>
            )}
          </div>
        )}

        {/* All Stages Timeline */}
        <div className="space-y-0">
          {stages.map((stage, index) => {
            const config = STATUS_CONFIG[stage.status];
            const StatusIcon = config.icon;
            const StageIcon = stage.icon;
            const isLast = index === stages.length - 1;
            const isActive = stage.status === 'active';
            const isCompleted = stage.status === 'completed';

            return (
              <div key={stage.id} className="flex gap-4">
                {/* Timeline Column */}
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${config.ring} ${isActive ? 'ring-2 ring-brand/30 ring-offset-2' : ''}`}>
                    {isCompleted
                      ? <CheckCircle className="w-5 h-5 text-green-500" />
                      : <StageIcon className={`w-4 h-4 ${isActive ? 'text-brand' : stage.status === 'locked' ? 'text-[hsl(218,35%,52%)]' : config.iconClass}`} />
                    }
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 my-1 min-h-[2rem] ${config.connector}`} />
                  )}
                </div>

                {/* Stage Card */}
                <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <div className={`rounded-xl border p-4 transition-all ${
                    isActive ? 'border-brand/40 bg-orange-50/60 shadow-sm' :
                    isCompleted ? 'border-green-200 bg-green-50/40' :
                    stage.status === 'pending' ? 'border-amber-200 bg-amber-50/40' :
                    'border-border bg-white opacity-60'
                  }`}>
                    {/* Stage Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] text-[hsl(218,35%,42%)] font-semibold uppercase tracking-wide">{stage.subtitle}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                        <h3 className={`font-black leading-tight text-sm sm:text-base ${
                          stage.status === 'locked' ? 'text-[hsl(218,35%,42%)]' : 'text-[hsl(218,72%,12%)]'
                        }`}>{stage.title}</h3>
                      </div>
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                      {stage.status === 'pending' && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                    </div>

                    {/* Description */}
                    {(isActive || isCompleted || stage.status === 'pending') && (
                      <p className="text-xs text-[hsl(218,35%,32%)] leading-relaxed mb-3">{stage.description}</p>
                    )}

                    {/* Requirement */}
                    <div className={`text-xs rounded-lg px-3 py-2 mb-3 ${
                      isCompleted ? 'bg-green-100/60 text-green-700' :
                      isActive ? 'bg-white text-[hsl(218,72%,12%)]' :
                      stage.status === 'pending' ? 'bg-amber-100/60 text-amber-800' :
                      'bg-muted text-[hsl(218,35%,42%)]'
                    }`}>
                      <span className="font-semibold">Requirement: </span>{stage.requirement}
                    </div>

                    {/* Unlocks */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <ChevronRight className="w-3 h-3 text-brand shrink-0" />
                      <span className="text-xs text-[hsl(218,35%,32%)]">
                        <span className="font-semibold text-[hsl(218,72%,12%)]">Unlocks: </span>
                        {stage.unlocks}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {(isActive || isCompleted) && stage.progressValue !== undefined && stage.progressMax && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-[hsl(218,35%,32%)]">{stage.progressLabel}</span>
                          <span className="text-xs font-bold text-[hsl(218,72%,12%)]">
                            {stage.progressValue}/{stage.progressMax}
                          </span>
                        </div>
                        <div className="w-full bg-[hsl(215,20%,88%)] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'brand-gradient'}`}
                            style={{ width: `${Math.min((stage.progressValue / stage.progressMax) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {isActive && stage.actionLabel && stage.actionPath && (
                      <Button asChild size="sm" className="brand-gradient text-white font-bold hover:opacity-90 gap-1.5 h-8 text-xs">
                        <Link to={stage.actionPath}>
                          {stage.actionLabel} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    )}

                    {stage.status === 'pending' && (
                      <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        Waiting for admin verification
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Banner */}
        {student.status === 'completed' || student.status === 'awarded' ? (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-white" />
            <h3 className="text-xl font-black mb-2">Congratulations, Certified Trader!</h3>
            <p className="text-white/80 text-sm mb-4">You have completed all stages of the PHILMAC Cebu training program.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link to="/student/certificates">View Certificate</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link to="/student/awards">View Award</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[hsl(218,72%,12%)] rounded-2xl p-5 text-center">
            <p className="text-white/60 text-sm mb-1">Complete all stages to earn</p>
            <p className="text-xl font-black text-brand">PHILMAC Cebu Certificate + $500 Award</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
