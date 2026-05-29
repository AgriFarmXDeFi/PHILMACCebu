import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, CheckCircle, Clock, XCircle, Lock, DollarSign,
  CreditCard, MessageCircle, MapPin, Phone, Mail, Star,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';

const REQUIREMENTS = [
  { label: 'Basic Forex Trading Course', key: 'basicCourseStatus',    check: (v: unknown) => v === 'completed',     icon: '📘' },
  { label: 'Technical Analysis Training', key: 'nextCourseStatus',   check: (v: unknown) => v === 'completed',     icon: '📊' },
  { label: 'Advanced Trading Mentorship', key: 'finalCourseStatus',  check: (v: unknown) => v === 'completed',     icon: '🚀' },
  { label: '30-Day Training Challenge',   key: 'challengeTrainingStatus', check: (v: unknown) => v === 'passed',   icon: '📓' },
  { label: '30-Day Pro Firm Challenge',   key: 'challengeProfirmStatus',  check: (v: unknown) => v === 'passed',   icon: '🏦' },
  { label: 'Certificate Issued by Admin', key: 'certificateIssued',  check: (v: unknown) => v === true,           icon: '🎓' },
];

const MILESTONES = [
  { label: 'Registration & Subscription', desc: 'Activate student account with $100 fee',        status: 'done'    },
  { label: 'Basic Course Completed',      desc: 'Foundation of forex trading knowledge',          status: 'done'    },
  { label: 'Referral Requirements',       desc: '3 direct + 3x3 network completed',               status: 'done'    },
  { label: 'All 3 Courses Completed',     desc: 'Basic, Technical, and Advanced courses passed',  status: 'pending' },
  { label: 'Both Challenges Passed',      desc: '30-Day Training + 30-Day Pro Firm',              status: 'locked'  },
  { label: 'Certificate Issued',          desc: 'Admin verification and certificate release',     status: 'locked'  },
  { label: '$500 Award Released',         desc: 'Payment processed to your account',             status: 'locked'  },
];

const STATUS_CONFIG = {
  not_qualified: {
    label: 'Not Yet Qualified',
    sublabel: 'Complete all requirements to unlock the $500 award.',
    icon: Lock,
    cardBg: 'hsl(218,72%,10%)',
    badgeBg: 'rgba(255,255,255,0.10)',
    badgeColor: 'rgba(255,255,255,0.60)',
    iconColor: 'rgba(255,255,255,0.35)',
  },
  pending_review: {
    label: 'Pending Admin Review',
    sublabel: 'Your application is being reviewed by admin.',
    icon: Clock,
    cardBg: 'linear-gradient(135deg, hsl(38,90%,35%), hsl(38,80%,25%))',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeColor: '#ffffff',
    iconColor: 'rgba(255,255,255,0.80)',
  },
  approved: {
    label: 'Award Approved',
    sublabel: 'Congratulations! Your $500 award has been approved.',
    icon: CheckCircle,
    cardBg: 'linear-gradient(135deg, hsl(142,60%,28%), hsl(142,55%,20%))',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeColor: '#ffffff',
    iconColor: 'rgba(255,255,255,0.90)',
  },
  paid: {
    label: 'Award Paid ✓',
    sublabel: 'Your $500 completion award has been sent to you.',
    icon: Trophy,
    cardBg: 'linear-gradient(135deg, hsl(38,90%,40%), hsl(218,72%,16%))',
    badgeBg: 'rgba(255,220,100,0.20)',
    badgeColor: 'hsl(38,100%,70%)',
    iconColor: 'hsl(38,100%,65%)',
  },
  rejected: {
    label: 'Award Rejected',
    sublabel: 'Please contact admin to resolve the issue.',
    icon: XCircle,
    cardBg: 'linear-gradient(135deg, hsl(0,65%,35%), hsl(0,55%,22%))',
    badgeBg: 'rgba(255,255,255,0.10)',
    badgeColor: 'rgba(255,255,255,0.70)',
    iconColor: 'rgba(255,255,255,0.60)',
  },
};

export default function StudentAwards() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const awardStatus = student.awardStatus as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[awardStatus] || STATUS_CONFIG.not_qualified;
  const AwardIcon = config.icon;

  const reqResults = REQUIREMENTS.map(r => ({
    ...r,
    done: r.check((student as Record<string, unknown>)[r.key]),
  }));
  const doneCount = reqResults.filter(r => r.done).length;
  const pct = Math.round((doneCount / REQUIREMENTS.length) * 100);
  const allDone = doneCount === REQUIREMENTS.length;

  // Dynamic milestone status based on actual student data
  const dynamicMilestones = [
    { label: 'Registration & Subscription',  desc: 'Activate student account with $100 fee',       done: true },
    { label: 'Basic Course Completed',        desc: 'Foundation of forex trading knowledge',         done: student.basicCourseStatus === 'completed' },
    { label: 'Referral Network Complete',     desc: '3 direct referrals with their 3 each',         done: student.directReferrals?.length >= 3 },
    { label: 'All 3 Courses Completed',       desc: 'Basic, Technical, and Advanced courses passed', done: student.finalCourseStatus === 'completed' },
    { label: 'Both Challenges Passed',        desc: '30-Day Training + 30-Day Pro Firm',            done: student.challengeTrainingStatus === 'passed' && student.challengeProfirmStatus === 'passed' },
    { label: 'Certificate Issued',            desc: 'Admin verification and certificate release',    done: student.certificateIssued },
    { label: '$500 Award Released',           desc: 'Payment processed to your account',            done: awardStatus === 'paid' },
  ];

  return (
    <StudentLayout>
      <div className="max-w-2xl space-y-5">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-black text-foreground">$500 Completion Award</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your progress toward the PHILMAC Cebu Completion Award.</p>
        </div>

        {/* ── Hero Award Card ── */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{ background: config.cardBg }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04) 0%, transparent 40%)',
            }}
          />
          <div className="relative z-10 p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Status Badge */}
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
                  style={{ background: config.badgeBg, color: config.badgeColor }}
                >
                  <AwardIcon className="w-3.5 h-3.5" />
                  {config.label}
                </div>
                {/* Amount */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span style={{ color: '#ffffff', fontSize: 48, fontWeight: 900, lineHeight: 1 }}>$500</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, fontWeight: 500 }}>USD</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-sm font-medium mb-1">
                  {config.sublabel}
                </p>
                {awardStatus === 'paid' && student.awardReference && (
                  <div
                    className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg mt-2"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Reference: <strong className="font-mono">{student.awardReference}</strong>
                  </div>
                )}
              </div>
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <AwardIcon className="w-10 h-10" style={{ color: config.iconColor }} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: 'rgba(255,255,255,0.70)' }} className="text-xs font-semibold">Qualification Progress</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }} className="text-xs font-bold">{doneCount}/{REQUIREMENTS.length} requirements</span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: allDone
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, rgba(255,255,255,0.80), rgba(255,220,80,0.90))',
                  }}
                />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-xs mt-1.5">{pct}% complete</p>
            </div>
          </div>
        </div>

        {/* ── Qualification Checklist ── */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Qualification Checklist</h2>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: allDone ? '#dcfce7' : 'hsl(215,18%,90%)',
                color: allDone ? '#166534' : 'hsl(218,35%,45%)',
              }}
            >
              {doneCount}/{REQUIREMENTS.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {reqResults.map(req => (
              <div
                key={req.key}
                className="flex items-center gap-3 p-3.5 rounded-xl transition-colors"
                style={{
                  background: req.done ? '#f0fdf4' : 'hsl(210,20%,97.5%)',
                  border: `1px solid ${req.done ? '#bbf7d0' : 'hsl(215,18%,88%)'}`,
                }}
              >
                <span className="text-xl shrink-0">{req.icon}</span>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: req.done ? 'hsl(218,72%,14%)' : 'hsl(218,35%,52%)',
                    fontWeight: req.done ? 600 : 400,
                    textDecoration: !req.done ? undefined : undefined,
                  }}
                >
                  {req.label}
                </span>
                {req.done ? (
                  <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#16a34a' }} />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                    style={{ borderColor: 'hsl(215,18%,72%)' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(215,18%,72%)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {allDone && awardStatus === 'not_qualified' && (
            <div
              className="mt-4 rounded-xl p-4 flex items-start gap-3"
              style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
              <div>
                <p style={{ color: '#92400e' }} className="font-semibold text-sm">All requirements completed!</p>
                <p style={{ color: '#b45309' }} className="text-xs mt-0.5">
                  Contact admin to request your award review and trigger the payment process.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Milestone Timeline ── */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base mb-5">Award Journey Timeline</h2>
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute top-3 bottom-3 w-0.5 rounded-full"
              style={{ left: 14, background: 'hsl(215,18%,85%)' }}
            />
            <div className="space-y-4">
              {dynamicMilestones.map((m, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  {/* Node */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2"
                    style={{
                      background: m.done ? 'hsl(218,72%,16%)' : '#ffffff',
                      borderColor: m.done ? 'hsl(218,72%,16%)' : 'hsl(215,18%,75%)',
                    }}
                  >
                    {m.done
                      ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                      : <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(215,18%,72%)' }} />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: m.done ? 'hsl(218,72%,12%)' : 'hsl(218,35%,55%)' }}
                    >
                      {m.label}
                    </p>
                    <p style={{ color: 'hsl(218,35%,58%)' }} className="text-xs mt-0.5">{m.desc}</p>
                  </div>
                  {m.done && (
                    <span className="text-xs font-bold shrink-0" style={{ color: '#16a34a' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Payment Method Details ── */}
        {(awardStatus === 'approved' || awardStatus === 'paid') && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base mb-4">
              {awardStatus === 'paid' ? 'Payment Record' : 'Payment Details'}
            </h2>
            <div className="space-y-3">
              {[
                ['Award Amount',    '$500 USD'],
                ['Payment Method',  student.paymentMethod?.replace(/_/g, ' ') || 'GCash / Bank Transfer'],
                ['Reference',       student.awardReference || '— Pending —'],
                ['Status',          awardStatus === 'paid' ? 'Released & Paid' : 'Processing'],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: 'hsl(215,18%,88%)' }}
                >
                  <span style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">{label}</span>
                  <span style={{ color: 'hsl(218,72%,12%)', fontWeight: 600 }} className="text-sm capitalize">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── How the Award Works ── */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base mb-4">How the Award Works</h2>
          <div className="space-y-2.5">
            {[
              { n: '01', t: 'Complete all 3 courses and pass both challenges', c: '#1d4ed8', bg: '#dbeafe' },
              { n: '02', t: 'Admin verifies all student requirements', c: '#7c3aed', bg: '#ede9fe' },
              { n: '03', t: 'Certificate issued and award status changes to Pending Review', c: '#92400e', bg: '#fef3c7' },
              { n: '04', t: 'Admin approves and processes the $500 payment', c: '#065f46', bg: '#d1fae5' },
              { n: '05', t: 'Reference number is recorded in your portal', c: '#9a3412', bg: 'rgba(234,88,12,0.10)' },
            ].map(({ n, t, c, bg }) => (
              <div
                key={n}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: bg, border: `1px solid ${c}20` }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: c, color: '#ffffff' }}
                >
                  {n}
                </span>
                <p style={{ color: c }} className="text-sm font-medium mt-0.5">{t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Admin Contact ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'hsl(218,72%,12%)', border: '1px solid hsl(218,72%,22%)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5" style={{ color: 'hsl(18,90%,54%)' }} />
            <h2 style={{ color: '#ffffff' }} className="font-black text-base">Contact Admin for Award Claims</h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.60)' }} className="text-sm mb-4">
            Once all requirements are complete, contact the admin team to initiate your $500 award process.
          </p>
          <div className="space-y-3">
            {[
              { icon: Phone, label: 'Viber / Mobile', val: '+63 917 123 4567' },
              { icon: Mail,  label: 'Email', val: 'info@philmaccebu.com' },
              { icon: MapPin, label: 'Location', val: 'USPF Building, Lahug, Cebu City' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(234,88,12,0.18)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'hsl(18,90%,60%)' }} />
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-xs">{label}</p>
                  <p style={{ color: '#ffffff' }} className="text-sm font-semibold">{val}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            asChild
            className="w-full mt-5 font-bold gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(18,90%,50%), hsl(18,80%,42%))', color: '#ffffff' }}
          >
            <a href="/student/support">
              Open Support Ticket <ChevronRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

      </div>
    </StudentLayout>
  );
}
