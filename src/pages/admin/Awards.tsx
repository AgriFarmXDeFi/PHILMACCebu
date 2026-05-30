import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, CheckCircle, XCircle, DollarSign, Clock, Lock,
  Download, Search, X, ChevronDown, AlertTriangle, Calendar,
  CreditCard, Users, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student } from '@/types';

type AwardTab = 'eligible' | 'pending' | 'approved' | 'paid' | 'rejected';

const STATUS_META: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  not_qualified: { label: 'Not Qualified', bg: 'hsl(215,18%,90%)', color: 'hsl(218,35%,52%)', icon: Lock },
  pending_review:{ label: 'Pending Review',bg: '#fef3c7',           color: '#92400e',            icon: Clock },
  approved:      { label: 'Approved',      bg: '#d1fae5',           color: '#065f46',            icon: CheckCircle },
  paid:          { label: 'Paid',          bg: '#dcfce7',           color: '#166534',            icon: Trophy },
  rejected:      { label: 'Rejected',      bg: '#fee2e2',           color: '#991b1b',            icon: XCircle },
};

function isEligible(s: Student): boolean {
  return (
    s.basicCourseStatus === 'completed' &&
    s.nextCourseStatus === 'completed' &&
    s.finalCourseStatus === 'completed' &&
    s.challengeTrainingStatus === 'passed' &&
    s.challengeProfirmStatus === 'passed' &&
    s.certificateIssued === true
  );
}

function getRequirementChecks(s: Student) {
  return [
    { label: 'Basic Course', done: s.basicCourseStatus === 'completed' },
    { label: 'Technical Training', done: s.nextCourseStatus === 'completed' },
    { label: 'Advanced Mentorship', done: s.finalCourseStatus === 'completed' },
    { label: '30-Day Training', done: s.challengeTrainingStatus === 'passed' },
    { label: 'Pro Firm Challenge', done: s.challengeProfirmStatus === 'passed' },
    { label: 'Certificate Issued', done: s.certificateIssued === true },
  ];
}

export default function AdminAwards() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<AwardTab>('eligible');
  const [selected, setSelected] = useState<Student | null>(null);
  const [payRef, setPayRef] = useState<Record<string, string>>({});
  const [payDate, setPayDate] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setStudents(getStudentsStore());
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const refresh = () => {
    const all = getStudentsStore();
    setStudents(all);
    if (selected) {
      const updated = all.find(s => s.id === selected.id);
      if (updated) setSelected(updated);
    }
  };

  const updateAward = (
    studentId: string,
    status: Student['awardStatus'],
    ref?: string,
    date?: string
  ) => {
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const changes: Partial<Student> = { awardStatus: status };
      if (ref) changes.awardReference = ref;
      if (date) changes.awardDate = date;
      if (status === 'paid') changes.status = 'awarded' as Student['status'];
      return { ...s, ...changes };
    });
    updateStudentsStore(updated);
    setStudents(updated);
    if (selected?.id === studentId) {
      const found = updated.find(s => s.id === studentId);
      if (found) setSelected(found);
    }
    toast.success(`Award status updated to ${status.replace(/_/g, ' ')}`);
    setShowRejectConfirm(null);
  };

  const eligibleStudents = useMemo(() =>
    students.filter(s => isEligible(s)),
    [students]
  );

  const tabStudents = useMemo(() => {
    let list: Student[] = [];
    if (activeTab === 'eligible') list = eligibleStudents;
    else if (activeTab === 'pending')  list = students.filter(s => s.awardStatus === 'pending_review');
    else if (activeTab === 'approved') list = students.filter(s => s.awardStatus === 'approved');
    else if (activeTab === 'paid')     list = students.filter(s => s.awardStatus === 'paid');
    else if (activeTab === 'rejected') list = students.filter(s => s.awardStatus === 'rejected');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.referralCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, activeTab, search, eligibleStudents]);

  const exportCSV = () => {
    const rows = students
      .filter(s => s.awardStatus !== 'not_qualified')
      .map(s => [
        `"${s.fullName}"`,
        `"${s.email}"`,
        `"${s.referralCode}"`,
        `"${s.certificateNumber || ''}"`,
        `"${s.awardStatus.replace(/_/g, ' ')}"`,
        `"${(s as Record<string,unknown>).awardReference || ''}"`,
        `"${(s as Record<string,unknown>).awardDate || ''}"`,
      ].join(','));
    const csv = ['Name,Email,Ref Code,Certificate No,Award Status,Payment Ref,Payment Date', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'philmac_awards.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Award list exported to CSV');
  };

  const TABS: { key: AwardTab; label: string; count: number; color: string }[] = [
    { key: 'eligible',  label: 'All Eligible',    count: eligibleStudents.length,                                  color: '#1d4ed8' },
    { key: 'pending',   label: 'Pending Review',  count: students.filter(s => s.awardStatus === 'pending_review').length,  color: '#92400e' },
    { key: 'approved',  label: 'Approved',        count: students.filter(s => s.awardStatus === 'approved').length,        color: '#065f46' },
    { key: 'paid',      label: 'Paid',            count: students.filter(s => s.awardStatus === 'paid').length,            color: '#166534' },
    { key: 'rejected',  label: 'Rejected',        count: students.filter(s => s.awardStatus === 'rejected').length,        color: '#991b1b' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Award Management</h1>
            <p className="text-muted-foreground text-sm">Process and track $500 course completion awards.</p>
          </div>
          <Button
            onClick={exportCSV}
            variant="outline"
            className="gap-1.5 border-border font-semibold"
            style={{ color: 'hsl(218,72%,12%)' }}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Eligible',       val: eligibleStudents.length,                                              bg: '#dbeafe', color: '#1e40af' },
            { label: 'Pending Review', val: students.filter(s => s.awardStatus === 'pending_review').length,      bg: '#fef3c7', color: '#92400e' },
            { label: 'Approved',       val: students.filter(s => s.awardStatus === 'approved').length,            bg: '#d1fae5', color: '#065f46' },
            { label: 'Paid',           val: students.filter(s => s.awardStatus === 'paid').length,                bg: '#dcfce7', color: '#166534' },
            { label: 'Total Awarded',  val: `$${students.filter(s => s.awardStatus === 'paid').length * 500}`,    bg: 'rgba(234,88,12,0.12)', color: '#9a3412' },
          ].map(({ label, val, bg, color }) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color }}>{val}</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">

          {/* ── Left: List ── */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>

            {/* Tab Bar */}
            <div className="flex overflow-x-auto border-b border-border shrink-0" style={{ background: 'hsl(210,20%,97%)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSelected(null); }}
                  className="shrink-0 px-3 py-2.5 text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: activeTab === tab.key ? '#ffffff' : 'transparent',
                    color: activeTab === tab.key ? 'hsl(218,72%,12%)' : 'hsl(218,35%,55%)',
                    borderBottom: activeTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                  }}
                >
                  {tab.label}
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      background: activeTab === tab.key ? tab.color : 'hsl(215,18%,88%)',
                      color: activeTab === tab.key ? '#ffffff' : 'hsl(218,35%,55%)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-8 text-xs"
                  style={{ color: 'hsl(218,72%,12%)' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Student List */}
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {tabStudents.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No students in this category</p>
                </div>
              )}
              {tabStudents.map(s => {
                const statusMeta = STATUS_META[s.awardStatus] || STATUS_META.not_qualified;
                const StatusIcon = statusMeta.icon;
                const isSelected = selected?.id === s.id;
                const reqChecks = getRequirementChecks(s);
                const doneCount = reqChecks.filter(r => r.done).length;

                return (
                  <button
                    key={s.id}
                    className="w-full text-left p-4 transition-colors hover:bg-muted/20"
                    style={{ background: isSelected ? 'rgba(234,88,12,0.06)' : undefined }}
                    onClick={() => setSelected(s)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                      >
                        {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm truncate">{s.fullName}</p>
                        <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs truncate">{s.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: statusMeta.bg, color: statusMeta.color }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusMeta.label}
                          </span>
                          <span style={{ color: 'hsl(218,35%,60%)' }} className="text-xs">
                            {doneCount}/6 req.
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Detail Pane ── */}
          {selected ? (
            <div className="lg:col-span-3 space-y-4">

              {/* Student Header */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'hsl(218,72%,12%)', border: '1px solid hsl(218,72%,22%)' }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black"
                      style={{ background: 'linear-gradient(135deg, hsl(218,72%,30%), hsl(218,72%,18%))' }}
                    >
                      {selected.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: '#ffffff' }} className="font-black text-base">{selected.fullName}</p>
                      <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs">{selected.email}</p>
                      <p style={{ color: 'rgba(255,255,255,0.40)' }} className="text-xs font-mono">{selected.referralCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{ color: 'hsl(18,90%,54%)', fontSize: 32, fontWeight: 900, lineHeight: 1 }}>$500</p>
                    <p style={{ color: 'rgba(255,255,255,0.50)' }} className="text-xs">USD Award</p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="mt-4 flex items-center gap-2">
                  {(() => {
                    const meta = STATUS_META[selected.awardStatus] || STATUS_META.not_qualified;
                    const Icon = meta.icon;
                    return (
                      <div
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </div>
                    );
                  })()}
                  {(selected as Record<string,unknown>).awardDate && (
                    <span style={{ color: 'rgba(255,255,255,0.40)' }} className="text-xs">
                      Paid: {String((selected as Record<string,unknown>).awardDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />
                  Qualification Requirements
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {getRequirementChecks(selected).map(req => (
                    <div
                      key={req.label}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                      style={{
                        background: req.done ? '#f0fdf4' : 'hsl(210,20%,97%)',
                        border: `1px solid ${req.done ? '#bbf7d0' : 'hsl(215,18%,88%)'}`,
                      }}
                    >
                      {req.done
                        ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#16a34a' }} />
                        : <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: 'hsl(215,18%,72%)' }} />}
                      <span
                        className="text-xs"
                        style={{ color: req.done ? 'hsl(218,72%,12%)' : 'hsl(218,35%,55%)', fontWeight: req.done ? 600 : 400 }}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
                {selected.certificateNumber && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">Certificate No: </span>
                    <span style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-mono font-bold">{selected.certificateNumber}</span>
                  </div>
                )}
              </div>

              {/* Award Actions */}
              <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} /> Award Actions
                </h3>

                {/* Not qualified notice */}
                {!isEligible(selected) && selected.awardStatus === 'not_qualified' && (
                  <div
                    className="rounded-xl p-4 flex items-start gap-3"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                    <p style={{ color: '#92400e' }} className="text-sm">
                      This student has not yet met all qualification requirements. Incomplete items are shown above.
                    </p>
                  </div>
                )}

                {/* Eligible but not yet in review */}
                {isEligible(selected) && selected.awardStatus === 'not_qualified' && (
                  <div className="space-y-3">
                    <div
                      className="rounded-xl p-4 flex items-start gap-3"
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                    >
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                      <p style={{ color: '#14532d' }} className="text-sm font-semibold">
                        All requirements met! Trigger award review for this student.
                      </p>
                    </div>
                    <Button
                      onClick={() => updateAward(selected.id, 'pending_review')}
                      className="w-full gap-2 font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                    >
                      <Clock className="w-4 h-4" /> Move to Pending Review
                    </Button>
                  </div>
                )}

                {/* Pending — Approve or Reject */}
                {selected.awardStatus === 'pending_review' && (
                  <div className="space-y-3">
                    <p style={{ color: 'hsl(218,35%,45%)' }} className="text-sm">
                      Review this student's application and approve or reject the $500 award.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => updateAward(selected.id, 'approved')}
                        className="flex-1 gap-1.5 font-bold text-white"
                        style={{ background: '#16a34a' }}
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Award
                      </Button>
                      <Button
                        onClick={() => setShowRejectConfirm(selected.id)}
                        variant="outline"
                        className="flex-1 gap-1.5 font-bold border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                    {showRejectConfirm === selected.id && (
                      <div
                        className="rounded-xl p-4"
                        style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}
                      >
                        <p style={{ color: '#9f1239' }} className="text-sm font-semibold mb-3">
                          Confirm rejection? This will move the award back to "Rejected" status.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateAward(selected.id, 'rejected')}
                            className="gap-1 font-bold text-white"
                            style={{ background: '#dc2626' }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Confirm Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowRejectConfirm(null)} className="border-border">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved — Enter Payment Details */}
                {selected.awardStatus === 'approved' && (
                  <div className="space-y-3">
                    <div
                      className="rounded-xl p-3 flex items-center gap-2"
                      style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}
                    >
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#065f46' }} />
                      <p style={{ color: '#064e3b' }} className="text-sm font-semibold">Award approved — enter payment details to mark as paid.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-xs flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Payment Reference *
                        </Label>
                        <Input
                          value={payRef[selected.id] || ''}
                          onChange={e => setPayRef(prev => ({ ...prev, [selected.id]: e.target.value }))}
                          placeholder="GCash/Bank reference no."
                          className="text-sm"
                          style={{ color: 'hsl(218,72%,12%)' }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-xs flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Payment Date *
                        </Label>
                        <Input
                          type="date"
                          value={payDate[selected.id] || new Date().toISOString().split('T')[0]}
                          onChange={e => setPayDate(prev => ({ ...prev, [selected.id]: e.target.value }))}
                          className="text-sm"
                          style={{ color: 'hsl(218,72%,12%)' }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => updateAward(selected.id, 'paid', payRef[selected.id], payDate[selected.id])}
                        disabled={!payRef[selected.id]}
                        className="flex-1 gap-1.5 font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, hsl(38,90%,40%), hsl(38,80%,32%))' }}
                      >
                        <Trophy className="w-4 h-4" /> Mark as Paid — $500
                      </Button>
                      <Button
                        onClick={() => setShowRejectConfirm(selected.id)}
                        variant="outline"
                        className="gap-1.5 font-bold border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                    {showRejectConfirm === selected.id && (
                      <div className="rounded-xl p-4" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                        <p style={{ color: '#9f1239' }} className="text-sm font-semibold mb-3">Confirm rejection?</p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateAward(selected.id, 'rejected')} className="gap-1 font-bold text-white" style={{ background: '#dc2626' }}>
                            <XCircle className="w-3.5 h-3.5" /> Confirm Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowRejectConfirm(null)} className="border-border">Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Paid — record shown */}
                {selected.awardStatus === 'paid' && (
                  <div
                    className="rounded-xl p-5 space-y-3"
                    style={{ background: 'linear-gradient(135deg, hsl(38,90%,38%), hsl(218,72%,14%))', border: '1px solid hsl(38,80%,45%)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" style={{ color: 'hsl(38,100%,70%)' }} />
                      <p style={{ color: '#ffffff' }} className="font-black text-base">$500 Award Paid</p>
                    </div>
                    {[
                      ['Payment Ref', selected.awardReference || '—'],
                      ['Payment Date', String((selected as Record<string,unknown>).awardDate || '—')],
                      ['Certificate', selected.certificateNumber || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs">{label}</span>
                        <span style={{ color: '#ffffff' }} className="text-xs font-mono font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rejected — option to re-process */}
                {selected.awardStatus === 'rejected' && (
                  <div className="space-y-3">
                    <div
                      className="rounded-xl p-4 flex items-start gap-3"
                      style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}
                    >
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                      <p style={{ color: '#9f1239' }} className="text-sm">
                        This award was rejected. You can reopen it as Pending Review if the issue has been resolved.
                      </p>
                    </div>
                    <Button
                      onClick={() => updateAward(selected.id, 'pending_review')}
                      variant="outline"
                      className="gap-1.5 font-bold"
                      style={{ borderColor: 'hsl(218,72%,30%)', color: 'hsl(218,72%,12%)' }}
                    >
                      <Clock className="w-4 h-4" /> Reopen as Pending Review
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment History / CSV Hint */}
              {selected.awardStatus === 'paid' && (
                <div className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" style={{ color: 'hsl(218,35%,52%)' }} />
                    <p style={{ color: 'hsl(218,35%,45%)' }} className="text-sm">
                      Export all award payment records
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportCSV}
                    className="font-semibold gap-1.5 border-border"
                    style={{ color: 'hsl(218,72%,12%)' }}
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="lg:col-span-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20"
              style={{ borderColor: 'hsl(215,18%,82%)' }}
            >
              <Trophy className="w-12 h-12 mb-3" style={{ color: 'hsl(218,35%,72%)' }} />
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No Student Selected</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center max-w-xs">
                Select a student from the list to manage their $500 award status.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
