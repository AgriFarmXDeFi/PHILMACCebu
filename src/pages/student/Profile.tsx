import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Camera, Lock, Clock, CheckCircle, AlertCircle, Save,
  Phone, MapPin, Globe, Calendar, Star, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';

interface TimelineEvent {
  label: string;
  date: string;
  icon: 'check' | 'clock' | 'alert';
  done: boolean;
}

const SCHEDULE_OPTIONS = [
  'Wednesday 6:00 PM',
  'Saturday 2:00 PM',
  'Both Wednesday & Saturday',
  'Online only',
  'Flexible',
];

interface FormErrors {
  fullName?: string;
  mobile?: string;
  facebook?: string;
  address?: string;
  preferredSchedule?: string;
}

function validateForm(form: { fullName: string; mobile: string; facebook: string; address: string; preferredSchedule: string }): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters';
  if (!form.mobile.trim()) errors.mobile = 'Mobile number is required';
  else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid mobile number';
  return errors;
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const { student, loading, setStudent } = useStudentAuth();

  const [tab, setTab] = useState<'info' | 'password' | 'timeline'>('info');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    facebook: '',
    address: '',
    experience: '',
    preferredSchedule: '',
  });

  const [pwForm, setPwForm] = useState({
    current: '',
    newPw: '',
    confirm: '',
  });

  useEffect(() => {
    if (!loading && !student) navigate('/login');
    if (student) {
      setForm({
        fullName: student.fullName,
        mobile: student.mobile,
        facebook: student.facebook || '',
        address: student.address || '',
        experience: student.experience || '',
        preferredSchedule: student.preferredSchedule || '',
      });
      const saved = localStorage.getItem(`philmac_photo_${student.id}`);
      if (saved) setPhotoPreview(saved);
    }
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      localStorage.setItem(`philmac_photo_${student.id}`, dataUrl);
      toast.success('Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = () => {
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    const students = getStudentsStore();
    const updated = students.map(s =>
      s.id === student.id
        ? { ...s, fullName: form.fullName, mobile: form.mobile, facebook: form.facebook, address: form.address, experience: form.experience, preferredSchedule: form.preferredSchedule }
        : s
    );
    updateStudentsStore(updated);
    const updatedStudent = updated.find(s => s.id === student.id)!;
    localStorage.setItem('philmac_student', JSON.stringify(updatedStudent));
    setStudent(updatedStudent);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile updated successfully');
    }, 600);
    console.log('Profile saved:', form);
  };

  const handleChangePassword = () => {
    if (!pwForm.current) { toast.error('Enter your current password'); return; }
    if (pwForm.newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
      toast.success('Password updated successfully');
    }, 600);
  };

  const timeline: TimelineEvent[] = [
    { label: 'Registration Submitted', date: new Date(student.registeredAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }), icon: 'check', done: true },
    { label: 'Payment Verified / Account Activated', date: student.approvedAt ? new Date(student.approvedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending', icon: student.approvedAt ? 'check' : 'clock', done: !!student.approvedAt },
    { label: 'Basic Course Started', date: student.basicCourseStatus !== 'locked' ? 'Unlocked' : 'Locked', icon: student.basicCourseStatus !== 'locked' ? 'check' : 'alert', done: student.basicCourseStatus !== 'locked' },
    { label: 'Basic Course Completed', date: student.basicCourseStatus === 'completed' ? 'Completed' : 'In progress', icon: student.basicCourseStatus === 'completed' ? 'check' : 'clock', done: student.basicCourseStatus === 'completed' },
    { label: '3 Direct Paid Referrals Achieved', date: student.directReferrals.length >= 3 ? 'Achieved' : `${student.directReferrals.length}/3`, icon: student.directReferrals.length >= 3 ? 'check' : 'clock', done: student.directReferrals.length >= 3 },
    { label: 'Next Course Unlocked', date: student.nextCourseStatus !== 'locked' ? 'Unlocked' : 'Locked', icon: student.nextCourseStatus !== 'locked' ? 'check' : 'alert', done: student.nextCourseStatus !== 'locked' },
    { label: 'Next Course Completed', date: student.nextCourseStatus === 'completed' ? 'Completed' : 'Pending', icon: student.nextCourseStatus === 'completed' ? 'check' : 'clock', done: student.nextCourseStatus === 'completed' },
    { label: '3×3 Referral Network Completed', date: student.secondLevelReferrals.length >= 9 ? 'Completed' : `${student.secondLevelReferrals.length}/9`, icon: student.secondLevelReferrals.length >= 9 ? 'check' : 'clock', done: student.secondLevelReferrals.length >= 9 },
    { label: 'Final Course Unlocked & Completed', date: student.finalCourseStatus === 'completed' ? 'Completed' : 'Locked', icon: student.finalCourseStatus === 'completed' ? 'check' : 'alert', done: student.finalCourseStatus === 'completed' },
    { label: '30-Day Training Challenge Passed', date: student.challengeTrainingStatus === 'passed' ? 'Passed' : student.challengeTrainingStatus, icon: student.challengeTrainingStatus === 'passed' ? 'check' : 'clock', done: student.challengeTrainingStatus === 'passed' },
    { label: '30-Day Pro Firm Challenge Passed', date: student.challengeProfirmStatus === 'passed' ? 'Passed' : student.challengeProfirmStatus, icon: student.challengeProfirmStatus === 'passed' ? 'check' : 'clock', done: student.challengeProfirmStatus === 'passed' },
    { label: 'Certificate Issued', date: student.certificateDate ?? 'Pending', icon: student.certificateIssued ? 'check' : 'clock', done: student.certificateIssued },
    { label: '$500 Award Received', date: student.awardStatus === 'paid' ? 'Paid' : student.awardStatus.replace(/_/g, ' '), icon: student.awardStatus === 'paid' ? 'check' : student.awardStatus === 'rejected' ? 'alert' : 'clock', done: student.awardStatus === 'paid' },
  ];

  const initials = student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const doneSteps = timeline.filter(t => t.done).length;
  const overallPct = Math.round((doneSteps / timeline.length) * 100);

  const TABS = [
    { key: 'info' as const,     label: 'Personal Info',    icon: User },
    { key: 'password' as const, label: 'Password',         icon: Lock },
    { key: 'timeline' as const, label: 'Timeline',         icon: Clock },
  ];

  const fieldStyle = (hasError?: boolean) => ({
    color: 'hsl(218,72%,12%)',
    borderColor: hasError ? '#dc2626' : undefined,
    outline: hasError ? '2px solid rgba(220,38,38,0.20)' : undefined,
  });

  return (
    <StudentLayout>
      <div className="max-w-2xl space-y-5">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-xl font-black" style={{ color: 'hsl(218,72%,12%)' }}>Profile Settings</h1>
          <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm mt-0.5">Manage your personal information, password, and account history.</p>
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: '3px solid hsl(215,18%,82%)' }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))',
                    border: '3px solid hsl(215,18%,82%)',
                  }}
                >
                  <span className="text-white text-2xl font-black">{initials}</span>
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-muted transition-colors shadow-sm"
                title="Upload profile photo"
              >
                <Camera className="w-3.5 h-3.5" style={{ color: 'hsl(218,72%,20%)' }} />
              </label>
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Student Summary */}
            <div className="flex-1 min-w-0">
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-lg leading-tight truncate">{student.fullName}</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">{student.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full font-mono"
                  style={{ background: 'rgba(234,88,12,0.10)', color: 'hsl(18,80%,38%)' }}
                >
                  {student.referralCode}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: ['active', 'basic_course', 'next_course_qualified', 'final_course_qualified', 'challenge_training', 'challenge_profirm', 'completed', 'awarded'].includes(student.status) ? '#dcfce7' : '#fef3c7',
                    color: ['active', 'basic_course', 'next_course_qualified', 'final_course_qualified', 'challenge_training', 'challenge_profirm', 'completed', 'awarded'].includes(student.status) ? '#166534' : '#92400e',
                  }}
                >
                  {student.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Mini progress ring */}
            <div className="shrink-0 hidden sm:flex flex-col items-center">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(215,18%,88%)" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="22"
                    fill="none"
                    stroke="hsl(18,90%,54%)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallPct / 100) * 138} 138`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ color: 'hsl(218,72%,12%)', fontSize: 12, fontWeight: 900 }}>{overallPct}%</span>
                </div>
              </div>
              <p style={{ color: 'hsl(218,35%,55%)', fontSize: 10 }} className="mt-1 text-center">Journey</p>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(210,20%,94%)' }}>
          {TABS.map(t => {
            const TabIcon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  background: tab === t.key ? '#ffffff' : 'transparent',
                  color: tab === t.key ? 'hsl(218,72%,12%)' : 'hsl(218,35%,52%)',
                  boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : undefined,
                }}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* PERSONAL INFO TAB                         */}
        {/* ══════════════════════════════════════════ */}
        {tab === 'info' && (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: 'hsl(18,90%,48%)' }} />
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Personal Information</h2>
            </div>

            {/* Read-only email notice */}
            <div
              className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#0284c7' }} />
              <p style={{ color: '#0c4a6e' }} className="text-xs">
                <strong>Email</strong> ({student.email}) and <strong>Referral Code</strong> ({student.referralCode}) cannot be changed. Contact admin if needed.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">

              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                  Full Name <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                </Label>
                <Input
                  value={form.fullName}
                  onChange={e => { setForm({ ...form, fullName: e.target.value }); setFormErrors(p => ({ ...p, fullName: undefined })); }}
                  placeholder="Your full name"
                  style={fieldStyle(!!formErrors.fullName)}
                  className="placeholder:text-muted-foreground"
                />
                {formErrors.fullName && (
                  <p className="text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                  Mobile <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                </Label>
                <Input
                  value={form.mobile}
                  onChange={e => { setForm({ ...form, mobile: e.target.value }); setFormErrors(p => ({ ...p, mobile: undefined })); }}
                  placeholder="09XX XXX XXXX"
                  style={fieldStyle(!!formErrors.mobile)}
                  className="placeholder:text-muted-foreground"
                />
                {formErrors.mobile && (
                  <p className="text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3" /> {formErrors.mobile}
                  </p>
                )}
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                  Facebook / Messenger
                </Label>
                <Input
                  value={form.facebook}
                  onChange={e => setForm({ ...form, facebook: e.target.value })}
                  placeholder="fb.com/yourname or @username"
                  style={fieldStyle()}
                  className="placeholder:text-muted-foreground"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                  Complete Address
                </Label>
                <Textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Street / Barangay, City, Province"
                  rows={2}
                  style={{ color: 'hsl(218,72%,12%)', resize: 'none' }}
                  className="placeholder:text-muted-foreground"
                />
              </div>

              {/* Preferred Schedule */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                  Preferred Schedule
                </Label>
                <select
                  value={form.preferredSchedule}
                  onChange={e => setForm({ ...form, preferredSchedule: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm transition-colors"
                  style={{ borderColor: 'hsl(215,18%,82%)', color: form.preferredSchedule ? 'hsl(218,72%,12%)' : 'hsl(218,35%,58%)', background: '#ffffff' }}
                >
                  <option value="" disabled>Select preferred schedule</option>
                  {SCHEDULE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Trading Experience */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                  Trading Experience
                </Label>
                <Input
                  value={form.experience}
                  onChange={e => setForm({ ...form, experience: e.target.value })}
                  placeholder="e.g. Beginner, 1 year"
                  style={fieldStyle()}
                  className="placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Save Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-4 flex-wrap">
              <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">
                Changes are saved to your profile immediately.
              </p>
              <Button
                onClick={handleSaveInfo}
                disabled={saving}
                className="gap-2 font-bold text-white"
                style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* PASSWORD TAB                              */}
        {/* ══════════════════════════════════════════ */}
        {tab === 'password' && (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" style={{ color: 'hsl(18,90%,48%)' }} />
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Change Password</h2>
            </div>

            {/* Requirements note */}
            <div
              className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
              <p style={{ color: '#92400e' }} className="text-xs">
                Password must be at least <strong>6 characters</strong>. Use a mix of letters and numbers for better security.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'current' as const, label: 'Current Password', placeholder: 'Enter your current password', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
                { key: 'new' as const,     label: 'New Password',     placeholder: 'Min. 6 characters', show: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                { key: 'confirm' as const, label: 'Confirm New Password', placeholder: 'Repeat new password', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
              ].map(field => {
                const val = field.key === 'current' ? pwForm.current : field.key === 'new' ? pwForm.newPw : pwForm.confirm;
                const onChange = (v: string) => {
                  if (field.key === 'current') setPwForm(p => ({ ...p, current: v }));
                  else if (field.key === 'new') setPwForm(p => ({ ...p, newPw: v }));
                  else setPwForm(p => ({ ...p, confirm: v }));
                };
                const hasMatchError = field.key === 'confirm' && pwForm.confirm && pwForm.newPw !== pwForm.confirm;
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                      {field.label}
                    </Label>
                    <div className="relative">
                      <Input
                        type={field.show ? 'text' : 'password'}
                        value={val}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          color: 'hsl(218,72%,12%)',
                          paddingRight: '2.5rem',
                          borderColor: hasMatchError ? '#dc2626' : undefined,
                        }}
                        className="placeholder:text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={field.toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {field.show
                          ? <EyeOff className="w-4 h-4" style={{ color: 'hsl(218,35%,55%)' }} />
                          : <Eye className="w-4 h-4" style={{ color: 'hsl(218,35%,55%)' }} />}
                      </button>
                    </div>
                    {hasMatchError && (
                      <p className="text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Strength indicator */}
              {pwForm.newPw && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">Password strength</span>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: pwForm.newPw.length < 6 ? '#dc2626' : pwForm.newPw.length < 10 ? '#d97706' : '#16a34a',
                      }}
                    >
                      {pwForm.newPw.length < 6 ? 'Too short' : pwForm.newPw.length < 10 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: 'hsl(215,18%,88%)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((pwForm.newPw.length / 12) * 100, 100)}%`,
                        background: pwForm.newPw.length < 6 ? '#dc2626' : pwForm.newPw.length < 10 ? '#d97706' : '#16a34a',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <Button
                onClick={handleChangePassword}
                disabled={saving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
                className="gap-2 font-bold text-white"
                style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
              >
                <Lock className="w-4 h-4" />
                {saving ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TIMELINE TAB                              */}
        {/* ══════════════════════════════════════════ */}
        {tab === 'timeline' && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'hsl(18,90%,48%)' }} />
                <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">Account Timeline</h2>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'hsl(218,72%,14%)', color: '#ffffff' }}
              >
                {doneSteps}/{timeline.length} done
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full rounded-full h-2 mb-6" style={{ background: 'hsl(215,18%,88%)' }}>
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${overallPct}%`,
                  background: 'linear-gradient(90deg, hsl(218,72%,22%), hsl(18,90%,54%))',
                }}
              />
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: 'hsl(215,18%,85%)' }} />

              <div className="space-y-3">
                {timeline.map((event, i) => {
                  const isDone = event.done;
                  const isAlert = event.icon === 'alert' && !event.done;
                  const isPending = event.icon === 'clock' && !event.done;

                  return (
                    <div key={i} className="relative flex items-start gap-3 pl-1">
                      {/* Icon circle */}
                      <div
                        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isDone ? '#dcfce7' : isAlert ? 'hsl(215,18%,90%)' : '#fef3c7',
                          border: `2px solid ${isDone ? '#86efac' : isAlert ? 'hsl(215,18%,78%)' : '#fde68a'}`,
                        }}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                        ) : isAlert ? (
                          <AlertCircle className="w-4 h-4" style={{ color: 'hsl(218,35%,58%)' }} />
                        ) : (
                          <Clock className="w-4 h-4" style={{ color: '#d97706' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-3">
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: isDone ? 'hsl(218,72%,12%)' : 'hsl(218,35%,55%)' }}
                        >
                          {event.label}
                        </p>
                        <p
                          className="text-xs mt-0.5 capitalize"
                          style={{
                            color: isDone ? '#16a34a' : isPending ? '#d97706' : 'hsl(218,35%,60%)',
                            fontWeight: isDone ? 600 : 400,
                          }}
                        >
                          {event.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
