import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Lock, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';
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

export default function StudentProfile() {
  const navigate = useNavigate();
  const { student, loading, setStudent } = useStudentAuth();

  const [tab, setTab] = useState<'info' | 'password' | 'timeline'>('info');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    facebook: '',
    address: '',
    experience: '',
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
        email: student.email,
        mobile: student.mobile,
        facebook: student.facebook,
        address: student.address,
        experience: student.experience,
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
    if (!form.fullName.trim() || !form.email.trim() || !form.mobile.trim()) {
      toast.error('Name, email and mobile are required');
      return;
    }
    setSaving(true);
    const students = getStudentsStore();
    const updated = students.map(s =>
      s.id === student.id ? { ...s, ...form } : s
    );
    updateStudentsStore(updated);
    const updatedStudent = updated.find(s => s.id === student.id)!;
    localStorage.setItem('philmac_student', JSON.stringify(updatedStudent));
    setStudent(updatedStudent);
    setTimeout(() => { setSaving(false); toast.success('Profile updated successfully'); }, 600);
  };

  const handleChangePassword = () => {
    if (pwForm.newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => { setSaving(false); toast.success('Password updated successfully'); }, 600);
  };

  const timeline: TimelineEvent[] = [
    { label: 'Registration Submitted', date: new Date(student.registeredAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }), icon: 'check', done: true },
    { label: 'Payment Verified / Account Activated', date: student.approvedAt ? new Date(student.approvedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending', icon: student.approvedAt ? 'check' : 'clock', done: !!student.approvedAt },
    { label: 'Basic Course Started', date: student.basicCourseStatus !== 'locked' ? 'Unlocked' : 'Locked', icon: student.basicCourseStatus !== 'locked' ? 'check' : 'alert', done: student.basicCourseStatus !== 'locked' },
    { label: 'Basic Course Completed', date: student.basicCourseStatus === 'completed' ? 'Completed' : 'In progress', icon: student.basicCourseStatus === 'completed' ? 'check' : 'clock', done: student.basicCourseStatus === 'completed' },
    { label: '3 Direct Paid Referrals Achieved', date: student.directReferrals.length >= 3 ? 'Achieved' : `${student.directReferrals.length}/3`, icon: student.directReferrals.length >= 3 ? 'check' : 'clock', done: student.directReferrals.length >= 3 },
    { label: 'Next Course Unlocked', date: student.nextCourseStatus !== 'locked' ? 'Unlocked' : 'Locked', icon: student.nextCourseStatus !== 'locked' ? 'check' : 'alert', done: student.nextCourseStatus !== 'locked' },
    { label: 'Next Course Completed', date: student.nextCourseStatus === 'completed' ? 'Completed' : 'Pending', icon: student.nextCourseStatus === 'completed' ? 'check' : 'clock', done: student.nextCourseStatus === 'completed' },
    { label: '3x3 Referral Network Completed', date: student.secondLevelReferrals.length >= 9 ? 'Completed' : `${student.secondLevelReferrals.length}/9`, icon: student.secondLevelReferrals.length >= 9 ? 'check' : 'clock', done: student.secondLevelReferrals.length >= 9 },
    { label: 'Final Course Unlocked & Completed', date: student.finalCourseStatus === 'completed' ? 'Completed' : 'Locked', icon: student.finalCourseStatus === 'completed' ? 'check' : 'alert', done: student.finalCourseStatus === 'completed' },
    { label: '30-Day Training Challenge Passed', date: student.challengeTrainingStatus === 'passed' ? 'Passed' : student.challengeTrainingStatus, icon: student.challengeTrainingStatus === 'passed' ? 'check' : 'clock', done: student.challengeTrainingStatus === 'passed' },
    { label: '30-Day Pro Firm Challenge Passed', date: student.challengeProfirmStatus === 'passed' ? 'Passed' : student.challengeProfirmStatus, icon: student.challengeProfirmStatus === 'passed' ? 'check' : 'clock', done: student.challengeProfirmStatus === 'passed' },
    { label: 'Certificate Issued', date: student.certificateDate ?? 'Pending', icon: student.certificateIssued ? 'check' : 'clock', done: student.certificateIssued },
    { label: '$500 Award Received', date: student.awardStatus === 'paid' ? 'Paid' : student.awardStatus.replace(/_/g, ' '), icon: student.awardStatus === 'paid' ? 'check' : student.awardStatus === 'rejected' ? 'alert' : 'clock', done: student.awardStatus === 'paid' },
  ];

  const initials = student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const TABS = [
    { key: 'info', label: 'Personal Info' },
    { key: 'password', label: 'Change Password' },
    { key: 'timeline', label: 'Account Timeline' },
  ] as const;

  return (
    <StudentLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your personal information and account details.</p>
        </div>

        {/* Profile Photo */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-border" />
              ) : (
                <div className="w-20 h-20 brand-gradient rounded-full flex items-center justify-center ring-4 ring-border">
                  <span className="text-white text-2xl font-black">{initials}</span>
                </div>
              )}
              <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-muted transition-colors shadow-sm">
                <Camera className="w-3.5 h-3.5 text-foreground" />
              </label>
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <p className="font-black text-foreground text-lg">{student.fullName}</p>
              <p className="text-muted-foreground text-sm">{student.email}</p>
              <p className="text-xs font-mono text-brand mt-1">{student.referralCode}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Personal Info Tab */}
        {tab === 'info' && (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-foreground flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number *</Label>
                <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="09XX XXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Facebook / Messenger</Label>
                <Input value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="fb.com/yourname" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Complete Address</Label>
                <Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, Province" rows={2} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Trading Experience</Label>
                <Input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. Beginner, 1 year" />
              </div>
            </div>
            <div className="pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Note: Email and referral code cannot be changed. Contact admin if needed.</p>
              <Button onClick={handleSaveInfo} disabled={saving} className="brand-gradient text-white font-semibold gap-2 hover:opacity-90">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} placeholder="Enter current password" />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="Min. 6 characters" />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repeat new password" />
              </div>
              {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords do not match</p>
              )}
              <Button onClick={handleChangePassword} disabled={saving || !pwForm.newPw || !pwForm.confirm} className="brand-gradient text-white font-semibold gap-2 hover:opacity-90">
                <Lock className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        )}

        {/* Account Timeline Tab */}
        {tab === 'timeline' && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-bold text-foreground flex items-center gap-2 mb-5"><Clock className="w-4 h-4" /> Account Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {timeline.map((event, i) => {
                  const IconComponent = event.icon === 'check' ? CheckCircle : event.icon === 'alert' ? AlertCircle : Clock;
                  const color = event.done
                    ? 'text-green-600 bg-green-100'
                    : event.icon === 'alert'
                    ? 'text-muted-foreground bg-muted'
                    : 'text-amber-600 bg-amber-100';
                  return (
                    <div key={i} className="relative flex items-start gap-4 pl-2">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-sm font-semibold ${event.done ? 'text-foreground' : 'text-muted-foreground'}`}>{event.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{event.date}</p>
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
