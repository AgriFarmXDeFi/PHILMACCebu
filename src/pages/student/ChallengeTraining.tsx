import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, CheckCircle, Clock, Lock, Plus, X, Upload,
  Link as LinkIcon, BookOpen, BarChart2, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ChallengeLog } from '@/types';

const RISK_CHECKLIST = [
  'Set stop-loss before entering trade',
  'Risk no more than 1–2% per trade',
  'No revenge trading after a loss',
  'Followed my trading plan',
  'Avoided over-leveraging',
];

type DayStatus = 'submitted' | 'approved' | 'pending' | 'missed' | 'future';

function getDayStatus(day: number, logs: ChallengeLog[]): DayStatus {
  const log = logs.find(l => l.day === day);
  if (!log) return day <= logs.length ? 'missed' : 'future';
  if (log.approved) return 'approved';
  return 'submitted';
}

const DAY_COLORS: Record<DayStatus, { bg: string; color: string; label: string }> = {
  approved:  { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  submitted: { bg: '#fef3c7', color: '#92400e', label: 'Submitted' },
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  missed:    { bg: '#fee2e2', color: '#991b1b', label: 'Missed' },
  future:    { bg: 'hsl(215,18%,92%)', color: 'hsl(218,35%,60%)', label: 'Upcoming' },
};

export default function ChallengeTraining() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();
  const [logs, setLogs] = useState<ChallengeLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [form, setForm] = useState({
    day: '',
    journal: '',
    analysis: '',
    risk: '',
    riskChecks: [] as string[],
    screenshot: '',
    video: '',
  });

  useEffect(() => {
    if (!loading && !student) navigate('/login');
    if (student) {
      const stored = localStorage.getItem(`philmac_training_logs_${student.id}`);
      if (stored) setLogs(JSON.parse(stored));
    }
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const isLocked = student.challengeTrainingStatus === 'not_started' && student.finalCourseStatus !== 'completed';
  const status = student.challengeTrainingStatus;
  const nextDay = logs.length + 1;

  const toggleRiskCheck = (item: string) => {
    setForm(prev => ({
      ...prev,
      riskChecks: prev.riskChecks.includes(item)
        ? prev.riskChecks.filter(r => r !== item)
        : [...prev.riskChecks, item],
    }));
  };

  const submitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const dayNum = parseInt(form.day) || nextDay;
    if (dayNum < 1 || dayNum > 30) { toast.error('Day number must be between 1 and 30'); return; }
    if (logs.some(l => l.day === dayNum)) { toast.error(`Day ${dayNum} log already submitted`); return; }

    const newLog: ChallengeLog = {
      day: dayNum,
      journalEntry: form.journal,
      marketAnalysis: form.analysis,
      riskNotes: form.risk + (form.riskChecks.length ? `\nChecklist: ${form.riskChecks.join(', ')}` : ''),
      submittedAt: new Date().toISOString(),
      approved: false,
    };
    const updated = [...logs, newLog].sort((a, b) => a.day - b.day);
    setLogs(updated);
    localStorage.setItem(`philmac_training_logs_${student.id}`, JSON.stringify(updated));
    setForm({ day: '', journal: '', analysis: '', risk: '', riskChecks: [], screenshot: '', video: '' });
    setShowForm(false);
    toast.success(`Day ${dayNum} log submitted successfully!`);
    console.log('Training log submitted:', newLog);
  };

  const approvedCount = logs.filter(l => l.approved).length;
  const pct = Math.round((logs.length / 30) * 100);

  return (
    <StudentLayout>
      <div className="max-w-3xl space-y-5">
        <div>
          <h1 className="text-xl font-black text-foreground">30-Day Training Challenge</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Submit daily trading logs for 30 consecutive days to pass.</p>
        </div>

        {isLocked ? (
          <div className="bg-white border border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(218,72%,10%)' }}>
              <Lock className="w-7 h-7" style={{ color: 'hsl(18,90%,54%)' }} />
            </div>
            <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-lg mb-2">Challenge Locked</h3>
            <p style={{ color: 'hsl(218,35%,45%)' }} className="text-sm max-w-xs mx-auto">
              Complete the Final Course (Advanced Trading Mentorship) to unlock the 30-Day Training Challenge.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: logs.length, label: 'Submitted', color: 'hsl(218,72%,12%)' },
                { val: approvedCount, label: 'Approved', color: '#16a34a' },
                { val: Math.max(0, 30 - logs.length), label: 'Remaining', color: 'hsl(18,90%,48%)' },
              ].map(({ val, label, color }) => (
                <div key={label} className="bg-white border border-border rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black" style={{ color }}>{val}</p>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Challenge Progress</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                    style={{
                      background: status === 'passed' ? '#dcfce7' : status === 'active' ? '#fef3c7' : 'hsl(215,18%,90%)',
                      color: status === 'passed' ? '#166534' : status === 'active' ? '#92400e' : 'hsl(218,35%,50%)',
                    }}
                  >
                    {status.replace(/_/g, ' ')}
                  </span>
                  <span style={{ color: 'hsl(218,35%,52%)' }} className="text-sm font-semibold">{logs.length}/30</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,hsl(218,72%,22%),hsl(18,90%,54%))',
                  }}
                />
              </div>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-2">{pct}% complete</p>
            </div>

            {/* 30-Day Calendar Grid */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">30-Day Progress Calendar</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(DAY_COLORS).filter(([k]) => k !== 'future').map(([key, meta]) => (
                    <span key={key} className="flex items-center gap-1 text-xs" style={{ color: 'hsl(218,35%,48%)' }}>
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: meta.bg, border: `1px solid ${meta.color}40` }} />
                      {meta.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const dayStatus = getDayStatus(day, logs);
                  const meta = DAY_COLORS[dayStatus];
                  return (
                    <div
                      key={day}
                      title={`Day ${day} — ${meta.label}`}
                      className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-default transition-transform hover:scale-110"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {dayStatus === 'approved'
                        ? <CheckCircle className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        : day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Form Toggle */}
            {logs.length < 30 && status !== 'passed' && (
              <div>
                {!showForm ? (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="gap-2 font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                  >
                    <Plus className="w-4 h-4" /> Submit Day {nextDay} Log
                  </Button>
                ) : (
                  <div className="bg-white border border-border rounded-2xl overflow-hidden">
                    {/* Form Header */}
                    <div
                      className="px-5 py-4 flex items-center justify-between"
                      style={{ background: 'hsl(218,72%,14%)' }}
                    >
                      <div>
                        <p style={{ color: '#ffffff' }} className="font-bold text-sm">Daily Log Submission</p>
                        <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs">All starred fields are required</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                        <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.70)' }} />
                      </button>
                    </div>

                    <form onSubmit={submitLog} className="p-5 space-y-5">
                      {/* Day Number */}
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                          Day Number <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                        </Label>
                        <Input
                          type="number"
                          min={1} max={30}
                          value={form.day || nextDay}
                          onChange={e => setForm({ ...form, day: e.target.value })}
                          placeholder={String(nextDay)}
                          className="max-w-xs"
                          style={{ color: 'hsl(218,72%,12%)' }}
                        />
                        <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">Auto-filled as Day {nextDay}. Change only if catching up on a missed day.</p>
                      </div>

                      {/* Trading Journal */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" style={{ color: 'hsl(218,72%,22%)' }} />
                          <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                            Trading Journal Entry <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                          </Label>
                        </div>
                        <Textarea
                          value={form.journal}
                          onChange={e => setForm({ ...form, journal: e.target.value })}
                          placeholder="Describe your trading session today — what trades did you take, what did you observe, how did you feel, what did you learn?"
                          rows={4}
                          required
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="resize-none placeholder:text-muted-foreground"
                        />
                      </div>

                      {/* Market Analysis */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <BarChart2 className="w-4 h-4" style={{ color: 'hsl(218,72%,22%)' }} />
                          <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                            Market Analysis Notes <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                          </Label>
                        </div>
                        <Textarea
                          value={form.analysis}
                          onChange={e => setForm({ ...form, analysis: e.target.value })}
                          placeholder="What currency pairs did you analyze? What was the market structure, trend direction, key levels you identified?"
                          rows={3}
                          required
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="resize-none placeholder:text-muted-foreground"
                        />
                      </div>

                      {/* Risk Management */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" style={{ color: 'hsl(218,72%,22%)' }} />
                          <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                            Risk Management <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                          </Label>
                        </div>
                        {/* Checklist */}
                        <div
                          className="rounded-xl p-4 space-y-2.5"
                          style={{ background: 'hsl(210,20%,97%)', border: '1px solid hsl(215,18%,85%)' }}
                        >
                          <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-3">Risk Checklist</p>
                          {RISK_CHECKLIST.map(item => (
                            <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                              <div
                                className="w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all"
                                style={{
                                  width: 18, height: 18,
                                  borderColor: form.riskChecks.includes(item) ? 'hsl(218,72%,22%)' : 'hsl(215,18%,72%)',
                                  background: form.riskChecks.includes(item) ? 'hsl(218,72%,22%)' : '#ffffff',
                                }}
                                onClick={() => toggleRiskCheck(item)}
                              >
                                {form.riskChecks.includes(item) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span
                                className="text-sm"
                                style={{ color: form.riskChecks.includes(item) ? 'hsl(218,72%,12%)' : 'hsl(218,35%,48%)' }}
                                onClick={() => toggleRiskCheck(item)}
                              >
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                        <Textarea
                          value={form.risk}
                          onChange={e => setForm({ ...form, risk: e.target.value })}
                          placeholder="Add additional risk management notes... What was your R:R ratio? Position size? Any adjustments?"
                          rows={2}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="resize-none placeholder:text-muted-foreground"
                        />
                      </div>

                      {/* Screenshot Upload */}
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-2">
                          <Upload className="w-4 h-4" style={{ color: 'hsl(218,72%,22%)' }} />
                          Trade Screenshot (Optional)
                        </Label>
                        <div
                          className="rounded-xl border-2 border-dashed p-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/20 transition-colors"
                          style={{ borderColor: 'hsl(215,18%,78%)' }}
                          onClick={() => toast.info('Screenshot upload will be available after connecting Supabase Storage.')}
                        >
                          <Upload className="w-7 h-7" style={{ color: 'hsl(218,35%,60%)' }} />
                          <p style={{ color: 'hsl(218,35%,48%)' }} className="text-sm font-medium">Click to upload trade screenshot</p>
                          <p style={{ color: 'hsl(218,35%,60%)' }} className="text-xs">PNG, JPG up to 5MB · Requires Supabase Storage</p>
                        </div>
                      </div>

                      {/* Video Link */}
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" style={{ color: 'hsl(218,72%,22%)' }} />
                          Video Link (Optional)
                        </Label>
                        <Input
                          value={form.video}
                          onChange={e => setForm({ ...form, video: e.target.value })}
                          placeholder="YouTube or Google Drive link to your trading session recording"
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="flex gap-3 pt-2 border-t border-border">
                        <Button
                          type="submit"
                          className="flex-1 font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                        >
                          Submit Day {form.day || nextDay} Log
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {logs.length === 30 && status !== 'passed' && (
              <div
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}
              >
                <CheckCircle className="w-8 h-8 shrink-0" style={{ color: '#16a34a' }} />
                <div>
                  <p style={{ color: '#14532d' }} className="font-black text-base">All 30 Logs Submitted!</p>
                  <p style={{ color: '#166534' }} className="text-sm mt-0.5">Your logs are pending admin review. You will be notified once your challenge is approved.</p>
                </div>
              </div>
            )}

            {/* Log History */}
            {logs.length > 0 && (
              <div className="bg-white border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">
                    Submission History ({logs.length} of 30)
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {[...logs].reverse().map(log => {
                    const isExpanded = expandedLog === log.day;
                    return (
                      <div key={log.day}>
                        <button
                          className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors text-left"
                          onClick={() => setExpandedLog(isExpanded ? null : log.day)}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                            style={{
                              background: log.approved ? '#dcfce7' : '#fef3c7',
                              color: log.approved ? '#15803d' : '#92400e',
                            }}
                          >
                            {log.approved ? <CheckCircle className="w-4 h-4" /> : log.day}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Day {log.day}</p>
                            <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs truncate mt-0.5">
                              {log.journalEntry.slice(0, 65)}{log.journalEntry.length > 65 ? '…' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {log.approved ? (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#dcfce7', color: '#166534' }}>
                                <CheckCircle className="w-3 h-3" /> Approved
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#fef3c7', color: '#92400e' }}>
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                            {isExpanded
                              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-4 pt-0 space-y-3" style={{ background: 'hsl(210,20%,97.5%)' }}>
                            {[
                              { icon: BookOpen, label: 'Trading Journal', val: log.journalEntry },
                              { icon: BarChart2, label: 'Market Analysis', val: log.marketAnalysis },
                              { icon: Shield, label: 'Risk Management', val: log.riskNotes },
                            ].map(({ icon: Icon, label, val }) => (
                              <div key={label} className="rounded-xl p-3.5" style={{ background: '#ffffff', border: '1px solid hsl(215,18%,88%)' }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Icon className="w-3.5 h-3.5" style={{ color: 'hsl(218,72%,22%)' }} />
                                  <p style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold uppercase tracking-wide">{label}</p>
                                </div>
                                <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm leading-relaxed whitespace-pre-wrap">{val}</p>
                              </div>
                            ))}
                            <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">
                              Submitted: {new Date(log.submittedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
