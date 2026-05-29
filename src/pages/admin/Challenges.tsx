import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  BookOpen, BarChart2, Shield, Users, Search, X, Award, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student, ChallengeLog } from '@/types';

type ChallengeTab = 'training' | 'profirm';

function getStudentLogs(studentId: string): ChallengeLog[] {
  const stored = localStorage.getItem(`philmac_training_logs_${studentId}`);
  return stored ? JSON.parse(stored) : [];
}

function approveLog(studentId: string, day: number) {
  const logs = getStudentLogs(studentId);
  const updated = logs.map(l => l.day === day ? { ...l, approved: true } : l);
  localStorage.setItem(`philmac_training_logs_${studentId}`, JSON.stringify(updated));
  return updated;
}

function approveAllLogs(studentId: string) {
  const logs = getStudentLogs(studentId);
  const updated = logs.map(l => ({ ...l, approved: true }));
  localStorage.setItem(`philmac_training_logs_${studentId}`, JSON.stringify(updated));
  return updated;
}

export default function AdminChallenges() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<ChallengeTab>('training');
  const [logs, setLogs] = useState<ChallengeLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setStudents(getStudentsStore());
  }, [admin, loading, navigate]);

  useEffect(() => {
    if (selected) setLogs(getStudentLogs(selected.id));
  }, [selected]);

  const challengeStudents = useMemo(() => {
    const all = students.filter(s =>
      s.challengeTrainingStatus !== 'not_started' || s.challengeProfirmStatus !== 'not_started'
    );
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(s => s.fullName.toLowerCase().includes(q) || s.referralCode.toLowerCase().includes(q));
  }, [students, search]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'approved') return logs.filter(l => l.approved);
    if (logFilter === 'pending')  return logs.filter(l => !l.approved);
    return logs;
  }, [logs, logFilter]);

  const updateChallenge = (studentId: string, type: ChallengeTab, result: 'passed' | 'failed') => {
    const key = type === 'training' ? 'challengeTrainingStatus' : 'challengeProfirmStatus';
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const changes: Partial<Student> = { [key]: result };
      if (type === 'profirm' && result === 'passed') changes.status = 'completed';
      return { ...s, ...changes };
    });
    updateStudentsStore(updated);
    setStudents(updated);
    const found = updated.find(s => s.id === studentId);
    if (found) setSelected(found);
    toast.success(`Challenge marked as ${result}`);
  };

  const handleApproveLog = (day: number) => {
    if (!selected) return;
    const updated = approveLog(selected.id, day);
    setLogs(updated);
    toast.success(`Day ${day} approved`);
  };

  const handleApproveAll = () => {
    if (!selected) return;
    const updated = approveAllLogs(selected.id);
    setLogs(updated);
    // Auto-pass training challenge if all 30 logs approved
    if (updated.length >= 30 && updated.every(l => l.approved)) {
      updateChallenge(selected.id, 'training', 'passed');
      toast.success('All logs approved — challenge marked as passed!');
    } else {
      toast.success(`All ${updated.length} logs approved`);
    }
  };

  if (loading || !admin) return null;

  const approvedCount = logs.filter(l => l.approved).length;
  const trainingPct  = logs.length > 0 ? Math.round((logs.length / 30) * 100) : 0;

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-foreground">Challenge Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review log submissions, approve individual days, and pass/fail student challenges.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'In Challenge',  val: challengeStudents.length,                                             bg: '#dbeafe', color: '#1e40af' },
            { label: 'Active',        val: students.filter(s => s.challengeTrainingStatus === 'active').length,  bg: '#fef3c7', color: '#92400e' },
            { label: 'Passed Training', val: students.filter(s => s.challengeTrainingStatus === 'passed').length, bg: '#dcfce7', color: '#166534' },
            { label: 'Fully Passed', val: students.filter(s => s.challengeProfirmStatus === 'passed').length,    bg: 'rgba(234,88,12,0.12)', color: '#9a3412' },
          ].map(({ label, val, bg, color }) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color }}>{val}</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">

          {/* ── Left: Student List ── */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm mb-3">
                Students in Challenge ({challengeStudents.length})
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student..."
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

            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {challengeStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No active challenges</p>
                </div>
              )}
              {challengeStudents.map(s => {
                const sLogs = getStudentLogs(s.id);
                const isSelected = selected?.id === s.id;
                return (
                  <button
                    key={s.id}
                    className="w-full text-left p-4 transition-colors hover:bg-muted/20"
                    style={{ background: isSelected ? 'rgba(234,88,12,0.06)' : undefined }}
                    onClick={() => { setSelected(s); setExpandedLog(null); setActiveTab('training'); }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                          >
                            {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm truncate">{s.fullName}</p>
                            <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs truncate">{sLogs.length}/30 logs</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 shrink-0">
                        {[
                          { label: 'Training', status: s.challengeTrainingStatus },
                          { label: 'Pro Firm', status: s.challengeProfirmStatus },
                        ].map(({ label, status }) => {
                          const color = status === 'passed' ? '#16a34a' : status === 'active' ? '#d97706' : status === 'failed' ? '#dc2626' : 'hsl(218,35%,62%)';
                          const bg    = status === 'passed' ? '#dcfce7' : status === 'active' ? '#fef3c7' : status === 'failed' ? '#fee2e2' : 'hsl(215,18%,90%)';
                          return (
                            <div key={label} className="flex items-center gap-1 justify-end">
                              <span className="text-xs" style={{ color: 'hsl(218,35%,55%)' }}>{label}:</span>
                              <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded-full capitalize"
                                style={{ background: bg, color }}
                              >
                                {status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          );
                        })}
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
              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black"
                      style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                    >
                      {selected.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">{selected.fullName}</p>
                      <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs font-mono">{selected.referralCode}</p>
                    </div>
                  </div>
                  {/* Training Progress */}
                  <div className="text-right">
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-xl">{logs.length}<span style={{ color: 'hsl(218,35%,52%)', fontSize: 12 }}>/30</span></p>
                    <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">logs submitted</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${trainingPct}%`,
                        background: trainingPct === 100
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : 'linear-gradient(90deg, hsl(218,72%,22%), hsl(18,90%,54%))',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{approvedCount} approved</span>
                    <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{trainingPct}%</span>
                  </div>
                </div>
              </div>

              {/* Challenge Tabs */}
              <div className="bg-white border border-border rounded-2xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex border-b border-border">
                  {(['training', 'profirm'] as ChallengeTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="flex-1 py-3 text-sm font-semibold transition-all"
                      style={{
                        background: activeTab === tab ? '#ffffff' : 'hsl(210,20%,97%)',
                        color: activeTab === tab ? 'hsl(218,72%,12%)' : 'hsl(218,35%,55%)',
                        borderBottom: activeTab === tab ? '2px solid hsl(18,90%,54%)' : '2px solid transparent',
                      }}
                    >
                      {tab === 'training' ? '30-Day Training' : '30-Day Pro Firm'}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Training Tab */}
                  {activeTab === 'training' && (
                    <div className="space-y-4">
                      {/* Status + Actions */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" style={{ color: 'hsl(218,72%,22%)' }} />
                          <span style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                            Training Challenge
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{
                              background: selected.challengeTrainingStatus === 'passed' ? '#dcfce7' : selected.challengeTrainingStatus === 'active' ? '#fef3c7' : selected.challengeTrainingStatus === 'failed' ? '#fee2e2' : 'hsl(215,18%,90%)',
                              color: selected.challengeTrainingStatus === 'passed' ? '#166534' : selected.challengeTrainingStatus === 'active' ? '#92400e' : selected.challengeTrainingStatus === 'failed' ? '#991b1b' : 'hsl(218,35%,52%)',
                            }}
                          >
                            {selected.challengeTrainingStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {selected.challengeTrainingStatus === 'active' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleApproveAll}
                              className="gap-1.5 text-xs font-bold"
                              style={{ background: 'hsl(218,72%,18%)', color: '#ffffff' }}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve All & Pass
                            </Button>
                          </div>
                        )}
                      </div>

                      {selected.challengeTrainingStatus === 'active' && (
                        <div
                          className="rounded-xl p-3 flex gap-2"
                          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                          <p style={{ color: '#92400e' }} className="text-xs">
                            Approve individual logs or use "Approve All & Pass" to bulk-approve and mark the challenge as passed.
                          </p>
                        </div>
                      )}

                      {/* Log Filter */}
                      {logs.length > 0 && (
                        <div className="flex gap-1">
                          {(['all', 'approved', 'pending'] as const).map(f => (
                            <button
                              key={f}
                              onClick={() => setLogFilter(f)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                              style={{
                                background: logFilter === f ? 'hsl(218,72%,16%)' : 'hsl(210,20%,95%)',
                                color: logFilter === f ? '#ffffff' : 'hsl(218,35%,52%)',
                              }}
                            >
                              {f} ({f === 'all' ? logs.length : f === 'approved' ? logs.filter(l => l.approved).length : logs.filter(l => !l.approved).length})
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Log Table */}
                      {logs.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                          <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No logs submitted yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredLogs.map(log => {
                            const isExpanded = expandedLog === log.day;
                            return (
                              <div
                                key={log.day}
                                className="border rounded-xl overflow-hidden"
                                style={{ borderColor: log.approved ? '#bbf7d0' : 'hsl(215,18%,85%)' }}
                              >
                                {/* Log Row */}
                                <div
                                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/10 transition-colors"
                                  style={{ background: log.approved ? '#f0fdf4' : '#ffffff' }}
                                  onClick={() => setExpandedLog(isExpanded ? null : log.day)}
                                >
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                    style={{
                                      background: log.approved ? '#dcfce7' : '#fef3c7',
                                      color: log.approved ? '#15803d' : '#92400e',
                                    }}
                                  >
                                    {log.approved ? '✓' : log.day}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Day {log.day}</p>
                                    <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs truncate">
                                      {log.journalEntry.slice(0, 60)}{log.journalEntry.length > 60 ? '…' : ''}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {log.approved ? (
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>
                                        Approved
                                      </span>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={e => { e.stopPropagation(); handleApproveLog(log.day); }}
                                        className="text-xs font-bold gap-1 h-6 px-2"
                                        style={{ background: 'hsl(218,72%,18%)', color: '#ffffff' }}
                                      >
                                        <CheckCircle className="w-3 h-3" /> Approve
                                      </Button>
                                    )}
                                    {isExpanded
                                      ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                                      : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />}
                                  </div>
                                </div>

                                {/* Expanded Log Content */}
                                {isExpanded && (
                                  <div
                                    className="px-4 pb-4 pt-0 space-y-3"
                                    style={{ background: 'hsl(210,20%,97.5%)', borderTop: '1px solid hsl(215,18%,88%)' }}
                                  >
                                    <div className="pt-3 space-y-2.5">
                                      {[
                                        { icon: BookOpen,  label: 'Trading Journal', val: log.journalEntry,    iconColor: 'hsl(218,72%,22%)' },
                                        { icon: BarChart2, label: 'Market Analysis', val: log.marketAnalysis,  iconColor: '#2563eb' },
                                        { icon: Shield,    label: 'Risk Management', val: log.riskNotes,       iconColor: '#7c3aed' },
                                      ].map(({ icon: Icon, label, val, iconColor }) => (
                                        <div
                                          key={label}
                                          className="rounded-xl p-3.5"
                                          style={{ background: '#ffffff', border: '1px solid hsl(215,18%,88%)' }}
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                                            <p style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold uppercase tracking-wide">
                                              {label}
                                            </p>
                                          </div>
                                          <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {val}
                                          </p>
                                        </div>
                                      ))}
                                      <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">
                                        Submitted: {new Date(log.submittedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Manual Pass/Fail */}
                      {selected.challengeTrainingStatus === 'active' && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            onClick={() => updateChallenge(selected.id, 'training', 'passed')}
                            className="flex-1 gap-1.5 font-bold text-white"
                            style={{ background: '#16a34a' }}
                          >
                            <CheckCircle className="w-4 h-4" /> Mark as Passed
                          </Button>
                          <Button
                            onClick={() => updateChallenge(selected.id, 'training', 'failed')}
                            variant="outline"
                            className="flex-1 gap-1.5 font-bold border-red-300 text-red-600"
                          >
                            <XCircle className="w-4 h-4" /> Mark as Failed
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pro Firm Tab */}
                  {activeTab === 'profirm' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />
                        <span style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Pro Firm Challenge</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{
                            background: selected.challengeProfirmStatus === 'passed' ? '#dcfce7' : selected.challengeProfirmStatus === 'active' ? '#fef3c7' : 'hsl(215,18%,90%)',
                            color: selected.challengeProfirmStatus === 'passed' ? '#166534' : selected.challengeProfirmStatus === 'active' ? '#92400e' : 'hsl(218,35%,52%)',
                          }}
                        >
                          {selected.challengeProfirmStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {selected.challengeProfirmStatus === 'not_started' ? (
                        <div
                          className="rounded-xl p-5 text-center"
                          style={{ background: 'hsl(210,20%,97%)', border: '1px solid hsl(215,18%,85%)' }}
                        >
                          <Clock className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,65%)' }} />
                          <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-1">
                            {selected.challengeTrainingStatus !== 'passed'
                              ? 'Locked — Training Challenge must be passed first'
                              : 'Pro Firm Challenge not yet started'}
                          </p>
                          <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                            Unlock by passing the 30-Day Training Challenge.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="rounded-xl p-5"
                          style={{ background: 'hsl(210,20%,97%)', border: '1px solid hsl(215,18%,85%)' }}
                        >
                          <p style={{ color: 'hsl(218,35%,48%)' }} className="text-sm mb-4">
                            Pro Firm challenge log review functionality mirrors the Training Challenge above.
                            Approve/fail based on the student's trading performance documentation.
                          </p>
                          {selected.challengeProfirmStatus === 'active' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateChallenge(selected.id, 'profirm', 'passed')}
                                className="flex-1 gap-1.5 font-bold text-white"
                                style={{ background: '#16a34a' }}
                              >
                                <CheckCircle className="w-4 h-4" /> Mark as Passed
                              </Button>
                              <Button
                                onClick={() => updateChallenge(selected.id, 'profirm', 'failed')}
                                variant="outline"
                                className="flex-1 gap-1.5 font-bold border-red-300 text-red-600"
                              >
                                <XCircle className="w-4 h-4" /> Mark as Failed
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="lg:col-span-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20"
              style={{ borderColor: 'hsl(215,18%,82%)' }}
            >
              <TrendingUp className="w-12 h-12 mb-3" style={{ color: 'hsl(218,35%,72%)' }} />
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No Student Selected</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center max-w-xs">
                Select a student from the left panel to review their challenge logs and submissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
