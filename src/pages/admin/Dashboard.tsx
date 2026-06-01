import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, ClipboardList, CreditCard, TrendingUp, Award, Trophy,
  CheckCircle, BookOpen, DollarSign, Network, Download, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { MOCK_PENDING_REGISTRATIONS } from '@/lib/mockData';
import type { Student } from '@/types';

// ── CSV Export Helpers ──────────────────────────────────────────────────────
function downloadCSV(rows: string[], filename: string) {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportStudentsList(students: Student[]) {
  const header = '"Name","Email","Mobile","Referral Code","Sponsor Code","Status","Basic %","Next %","Final %","Directs","Level2","Certificate","Award","Registered"';
  const rows = [header, ...students.map(s => [
    `"${s.fullName}"`, `"${s.email}"`, `"${s.mobile}"`,
    `"${s.referralCode}"`, `"${s.sponsorCode || ''}"`,
    `"${s.status.replace(/_/g, ' ')}"`,
    `"${s.basicCourseProgress}"`, `"${s.nextCourseProgress}"`, `"${s.finalCourseProgress}"`,
    `"${s.directReferrals.length}"`, `"${s.secondLevelReferrals?.length ?? 0}"`,
    `"${s.certificateIssued ? 'Yes' : 'No'}"`, `"${s.awardStatus.replace(/_/g, ' ')}"`,
    `"${new Date(s.registeredAt).toLocaleDateString('en-PH')}"`,
  ].join(','))];
  downloadCSV(rows, 'philmac_students.csv');
}

function exportMonthlyReport(monthlyData: { month: string; registrations: number; revenue: number; referrals: number }[]) {
  const header = '"Month","New Registrations","Revenue ($)","Referral Signups"';
  const rows = [header, ...monthlyData.map(m => `"${m.month}","${m.registrations}","${m.revenue}","${m.referrals}"`)  ];
  downloadCSV(rows, 'philmac_monthly_report.csv');
}

function exportRevenueSummary(students: Student[]) {
  const active = students.filter(s => !['pending', 'payment_review'].includes(s.status));
  const header = '"Name","Email","Referral Code","Subscription ($)","Award Status","Award ($)","Registered"';
  const rows = [header, ...active.map(s => [
    `"${s.fullName}"`, `"${s.email}"`, `"${s.referralCode}"`,
    `"100"`, `"${s.awardStatus.replace(/_/g, ' ')}"`,
    `"${s.awardStatus === 'paid' ? 500 : 0}"`,
    `"${new Date(s.registeredAt).toLocaleDateString('en-PH')}"`,
  ].join(','))];
  downloadCSV(rows, 'philmac_revenue_summary.csv');
}

function exportReferralOverview(students: Student[]) {
  const header = '"Name","Email","Referral Code","Directs","Level2","Network Total","Has 3 Directs","Full 3x3","Status","Registered"';
  const rows = [header, ...students.map(s => [
    `"${s.fullName}"`, `"${s.email}"`, `"${s.referralCode}"`,
    `"${s.directReferrals.length}"`, `"${s.secondLevelReferrals?.length ?? 0}"`,
    `"${s.directReferrals.length + (s.secondLevelReferrals?.length ?? 0)}"`,
    `"${s.directReferrals.length >= 3 ? 'Yes' : 'No'}"`,
    `"${(s.secondLevelReferrals?.length ?? 0) >= 9 ? 'Yes' : 'No'}"`,
    `"${s.status.replace(/_/g, ' ')}"`,
    `"${new Date(s.registeredAt).toLocaleDateString('en-PH')}"`,
  ].join(','))];
  downloadCSV(rows, 'philmac_referral_overview.csv');
}

// ── Chart color tokens ───────────────────────────────────────────────────────
const NAVY = 'hsl(218,72%,22%)';
const ORANGE = 'hsl(18,90%,54%)';
const GREEN = '#22c55e';
const PURPLE = '#8b5cf6';
const BLUE = '#3b82f6';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' });
}

function buildMonthlyData(students: Student[]) {
  // Generate last 7 months
  const months: { month: string; registrations: number; revenue: number; referrals: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = getMonthLabel(d);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();

    const monthStudents = students.filter(s => {
      const reg = new Date(s.registeredAt).getTime();
      return reg >= monthStart && reg <= monthEnd;
    });

    const activeMonthStudents = monthStudents.filter(s =>
      !['pending', 'payment_review'].includes(s.status)
    );

    const totalReferrals = students.filter(s => {
      const reg = new Date(s.registeredAt).getTime();
      return reg >= monthStart && reg <= monthEnd && s.sponsorCode;
    }).length;

    months.push({
      month: label,
      registrations: monthStudents.length,
      revenue: activeMonthStudents.length * 100,
      referrals: totalReferrals,
    });
  }
  return months;
}

function buildStatusData(students: Student[]) {
  const groups = [
    { name: 'Pending',      statuses: ['pending', 'payment_review'],                       color: '#f59e0b' },
    { name: 'Active',       statuses: ['active', 'basic_course'],                           color: BLUE },
    { name: 'Advanced',     statuses: ['next_course_qualified', 'final_course_qualified'],   color: PURPLE },
    { name: 'Challenge',    statuses: ['challenge_training', 'challenge_profirm'],           color: ORANGE },
    { name: 'Completed',    statuses: ['completed', 'awarded'],                             color: GREEN },
  ];
  return groups
    .map(g => ({ name: g.name, value: students.filter(s => g.statuses.includes(s.status)).length, color: g.color }))
    .filter(g => g.value > 0);
}

function buildReferralGrowth(students: Student[]) {
  const months: { month: string; networks: number; full3x3: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = getMonthLabel(d);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
    const active = students.filter(s => new Date(s.registeredAt).getTime() <= monthEnd && !['pending', 'payment_review'].includes(s.status));
    months.push({
      month: label,
      networks: active.filter(s => s.directReferrals.length >= 1).length,
      full3x3: active.filter(s => (s.secondLevelReferrals?.length ?? 0) >= 9).length,
    });
  }
  return months;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid hsl(215,18%,82%)' }}>
      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-xs mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span style={{ color: 'hsl(218,35%,45%)' }} className="text-xs capitalize">{p.name}:</span>
          <span style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const RevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid hsl(215,18%,82%)' }}>
      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-xs mb-1">{label}</p>
      <p style={{ color: ORANGE }} className="text-sm font-black">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const students = getStudentsStore();
  const pendingRegs = JSON.parse(localStorage.getItem('philmac_registrations') || JSON.stringify(MOCK_PENDING_REGISTRATIONS));

  // ── Summary stats ──
  const stats = [
    { label: 'Total Students',       value: students.length,                                                                       icon: Users,       color: '#1e40af', bg: '#dbeafe' },
    { label: 'Pending Registrations',value: pendingRegs.filter((r: { status: string }) => r.status === 'pending').length,          icon: ClipboardList,color: '#92400e', bg: '#fef3c7' },
    { label: 'Active Subscribers',   value: students.filter(s => !['pending', 'payment_review'].includes(s.status)).length,        icon: CreditCard,  color: '#166534', bg: '#dcfce7' },
    { label: 'In Challenges',        value: students.filter(s => s.challengeTrainingStatus === 'active' || s.challengeProfirmStatus === 'active').length, icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Certificates Issued',  value: students.filter(s => s.certificateIssued).length,                                      icon: Award,       color: '#065f46', bg: '#d1fae5' },
    { label: 'Awards Paid',          value: students.filter(s => s.awardStatus === 'paid').length,                                 icon: Trophy,      color: '#9a3412', bg: 'rgba(234,88,12,0.12)' },
    { label: 'Total Revenue',        value: `$${students.filter(s => !['pending', 'payment_review'].includes(s.status)).length * 100}`, icon: DollarSign, color: '#166534', bg: '#f0fdf4' },
    { label: 'Full 3×3 Networks',    value: students.filter(s => (s.secondLevelReferrals?.length ?? 0) >= 9).length,              icon: Network,     color: '#1e40af', bg: '#eff6ff' },
  ];

  // ── Chart data ──
  const monthlyData = useMemo(() => buildMonthlyData(students), [students]);
  const statusData  = useMemo(() => buildStatusData(students), [students]);
  const referralData= useMemo(() => buildReferralGrowth(students), [students]);

  const totalRevenue = students.filter(s => !['pending', 'payment_review'].includes(s.status)).length * 100;
  const avgMonthlyRevenue = monthlyData.length > 0
    ? Math.round(monthlyData.reduce((a, m) => a + m.revenue, 0) / monthlyData.length)
    : 0;

  const recentActivity = [
    { time: '2h ago',  msg: 'Carlo Mendoza submitted new registration',       type: 'registration' },
    { time: '5h ago',  msg: 'Ana Reyes submitted Day 15 challenge log',        type: 'challenge' },
    { time: '1d ago',  msg: 'Roberto Uy awarded $500 completion award',        type: 'award' },
    { time: '2d ago',  msg: 'Juan dela Cruz unlocked basic course',            type: 'course' },
    { time: '3d ago',  msg: 'Maria Santos completed 3 direct referrals',      type: 'referral' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            PHILMAC Cebu analytics overview — {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: stat.bg }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold mt-0.5 leading-tight">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts Row 1: Monthly Registrations + Status Pie ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Monthly Registrations LineChart */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Monthly Student Registrations</h3>
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">New registrations over the last 7 months</p>
              </div>
              <div className="text-right">
                <p style={{ color: NAVY, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{students.length}</p>
                <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">total students</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={NAVY} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,18%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(218,35%,52%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(218,35%,52%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="registrations" name="Registrations" stroke={NAVY} strokeWidth={2.5} fill="url(#regGrad)" dot={{ fill: NAVY, r: 4 }} activeDot={{ r: 6, fill: ORANGE }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution PieChart */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="mb-4">
              <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Student Status</h3>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">Current distribution by stage</p>
            </div>
            {statusData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Users className="w-10 h-10 mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={42} outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number, name: string) => [val, name]}
                      contentStyle={{ borderRadius: 12, border: '1px solid hsl(215,18%,82%)', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="space-y-1.5 mt-2">
                  {statusData.map(d => (
                    <div key={d.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span style={{ color: 'hsl(218,35%,45%)', fontSize: 11 }}>{d.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: d.color, fontWeight: 700, fontSize: 12 }}>{d.value}</span>
                        <span style={{ color: 'hsl(218,35%,60%)', fontSize: 10 }}>
                          ({students.length > 0 ? Math.round((d.value / students.length) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Charts Row 2: Revenue + Referral Growth ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Monthly Revenue BarChart */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Monthly Subscription Revenue</h3>
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">Based on $100/student activation</p>
              </div>
              <div className="text-right">
                <p style={{ color: ORANGE, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                  ${totalRevenue.toLocaleString()}
                </p>
                <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">total revenue</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,18%,90%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(218,35%,52%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(218,35%,52%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill={ORANGE} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Revenue KPIs */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              {[
                { label: 'Avg Monthly Revenue', val: `$${avgMonthlyRevenue.toLocaleString()}` },
                { label: 'Award Payouts', val: `$${students.filter(s => s.awardStatus === 'paid').length * 500}` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{label}</p>
                  <p style={{ color: 'hsl(218,72%,12%)', fontWeight: 800, fontSize: 15 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Network Growth LineChart */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Referral Network Growth</h3>
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">Students with active referral networks</p>
              </div>
              <div className="text-right">
                <p style={{ color: PURPLE, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                  {students.filter(s => s.directReferrals.length >= 1).length}
                </p>
                <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">active networkers</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={referralData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,18%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(218,35%,52%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(218,35%,52%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="networks" name="With Referrals" stroke={PURPLE} strokeWidth={2.5} dot={{ fill: PURPLE, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="full3x3" name="Full 3×3" stroke={GREEN} strokeWidth={2.5} strokeDasharray="5 3" dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            {/* Network KPIs */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              {[
                { label: 'Direct Referrals Met (3+)', val: students.filter(s => s.directReferrals.length >= 3).length },
                { label: 'Full 3×3 Completed', val: students.filter(s => (s.secondLevelReferrals?.length ?? 0) >= 9).length },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{label}</p>
                  <p style={{ color: 'hsl(218,72%,12%)', fontWeight: 800, fontSize: 15 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Students + Activity ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Recent Students */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between" style={{ background: 'hsl(210,20%,97.5%)' }}>
              <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Recent Students</h3>
              <Link to="/admin/students">
                <span style={{ color: 'hsl(18,90%,48%)' }} className="text-xs font-semibold">View all →</span>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {students.slice(0, 5).map(student => (
                <div key={student.id} className="p-4 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                  >
                    {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold truncate">{student.fullName}</p>
                    <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs font-mono">{student.referralCode}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize"
                    style={{
                      background: ['completed', 'awarded'].includes(student.status) ? '#dcfce7' : ['challenge_training', 'challenge_profirm'].includes(student.status) ? '#fef3c7' : '#dbeafe',
                      color: ['completed', 'awarded'].includes(student.status) ? '#166534' : ['challenge_training', 'challenge_profirm'].includes(student.status) ? '#92400e' : '#1e40af',
                    }}
                  >
                    {student.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
              {students.length === 0 && (
                <div className="py-8 text-center"><p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No students yet</p></div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border" style={{ background: 'hsl(210,20%,97.5%)' }}>
              <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((activity, i) => {
                const dotColors: Record<string, string> = { registration: '#f59e0b', challenge: PURPLE, award: ORANGE, course: BLUE, referral: GREEN };
                return (
                  <div key={i} className="p-4 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: dotColors[activity.type] || '#9ca3af' }} />
                    <div className="flex-1">
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm leading-snug">{activity.msg}</p>
                      <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Data Export Panel ── */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div
            className="px-5 py-4 border-b border-border flex items-center justify-between"
            style={{ background: 'hsl(210,20%,97.5%)' }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: 'hsl(18,90%,48%)' }} />
              <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Data Export</h3>
            </div>
            <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">Download reports as CSV files</p>
          </div>
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Students List',
                desc: `All ${students.length} student records`,
                icon: Users,
                color: '#1e40af',
                bg: '#dbeafe',
                onClick: () => { exportStudentsList(students); toast.success('Students list exported'); },
              },
              {
                label: 'Monthly Report',
                desc: 'Registrations (last 7 months)',
                icon: TrendingUp,
                color: '#7c3aed',
                bg: '#ede9fe',
                onClick: () => { exportMonthlyReport(monthlyData); toast.success('Monthly report exported'); },
              },
              {
                label: 'Revenue Summary',
                desc: 'Subscription & award payments',
                icon: DollarSign,
                color: '#065f46',
                bg: '#d1fae5',
                onClick: () => { exportRevenueSummary(students); toast.success('Revenue summary exported'); },
              },
              {
                label: 'Referral Overview',
                desc: 'All network & referral data',
                icon: Network,
                color: '#92400e',
                bg: '#fef3c7',
                onClick: () => { exportReferralOverview(students); toast.success('Referral overview exported'); },
              },
            ].map(({ label, desc, icon: Icon, color, bg, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="group flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 text-left w-full"
                style={{ borderColor: 'hsl(215,18%,85%)', background: '#ffffff' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: bg }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-bold leading-tight">{label}</p>
                  <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-0.5">{desc}</p>
                </div>
                <Download className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Registrations', path: '/admin/registrations', icon: ClipboardList, color: '#92400e', bg: '#fef3c7' },
            { label: 'Students',      path: '/admin/students',      icon: Users,          color: '#1e40af', bg: '#dbeafe' },
            { label: 'Challenges',    path: '/admin/challenges',    icon: TrendingUp,     color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Awards',        path: '/admin/awards',        icon: Trophy,         color: '#065f46', bg: '#d1fae5' },
          ].map(({ label, path, icon: Icon, color, bg }) => (
            <Link
              key={label}
              to={path}
              className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <span style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
