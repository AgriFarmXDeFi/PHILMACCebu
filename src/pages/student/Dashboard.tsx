import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Copy, BookOpen, Users, TrendingUp, Trophy, Award, CheckCircle, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending Registration', color: 'bg-yellow-100 text-yellow-800' },
  payment_review: { label: 'Payment Under Review', color: 'bg-orange-100 text-orange-800' },
  active: { label: 'Active Subscriber', color: 'bg-green-100 text-green-800' },
  basic_course: { label: 'Basic Course Active', color: 'bg-blue-100 text-blue-800' },
  next_course_qualified: { label: 'Next Course Qualified', color: 'bg-purple-100 text-purple-800' },
  final_course_qualified: { label: 'Final Course Qualified', color: 'bg-indigo-100 text-indigo-800' },
  challenge_training: { label: '30-Day Training Challenge', color: 'bg-amber-100 text-amber-800' },
  challenge_profirm: { label: 'Pro Firm Challenge', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
  awarded: { label: 'Awarded', color: 'bg-brand/15 text-orange-800' },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return <div className="min-h-screen bg-navy-dark flex items-center justify-center"><div className="text-white">Loading...</div></div>;

  const referralLink = `philmaccebu.com/register?ref=${student.referralCode}`;
  const copyReferral = () => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied!'); };
  const statusInfo = STATUS_LABELS[student.status] || STATUS_LABELS.active;

  const cards = [
    { label: 'Basic Course', value: `${student.basicCourseProgress}%`, icon: BookOpen, sub: student.basicCourseStatus, link: '/student/courses', color: 'text-blue-600' },
    { label: 'Direct Referrals', value: `${student.directReferrals.length}/3`, icon: Users, sub: student.directReferrals.length >= 3 ? 'Next Course Unlocked' : 'Need more referrals', link: '/student/referrals', color: 'text-purple-600' },
    { label: '3x3 Progress', value: `${student.secondLevelReferrals.length}/9`, icon: TrendingUp, sub: 'Second-level students', link: '/student/referrals', color: 'text-amber-600' },
    { label: 'Challenge Status', value: student.challengeTrainingStatus === 'not_started' ? 'Not Started' : student.challengeTrainingStatus, icon: Trophy, sub: '30-Day Training', link: '/student/challenge-training', color: 'text-red-600' },
    { label: 'Pro Firm Challenge', value: student.challengeProfirmStatus === 'not_started' ? 'Not Started' : student.challengeProfirmStatus, icon: Award, sub: 'Final evaluation stage', link: '/student/challenge-profirm', color: 'text-brand' },
    { label: 'Certificate', value: student.certificateIssued ? 'Issued' : 'Not Yet', icon: CheckCircle, sub: student.certificateNumber || 'Pending completion', link: '/student/certificates', color: 'text-emerald-600' },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-foreground">Welcome back, {student.fullName.split(' ')[0]}!</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Here is your current training progress.</p>
          </div>
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>

        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-navy to-navy-dark rounded-xl p-5 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Your Referral Code</p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-2xl font-black text-brand">{student.referralCode}</p>
              <p className="text-white/60 text-xs mt-0.5">{referralLink}</p>
            </div>
            <Button size="sm" variant="outline" onClick={copyReferral} className="border-white/30 text-white hover:bg-white/10 gap-1.5">
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </Button>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <Link key={card.label} to={card.link} className="bg-white border border-border rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-lg font-black text-foreground capitalize">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{card.sub.replace(/_/g, ' ')}</p>
              </Link>
            );
          })}
        </div>

        {/* Course Progress */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-bold text-foreground mb-4">Course Progress</h2>
          <div className="space-y-4">
            {[
              { title: 'Basic Forex Trading Course', progress: student.basicCourseProgress, status: student.basicCourseStatus },
              { title: 'Technical Analysis Training', progress: student.nextCourseProgress, status: student.nextCourseStatus },
              { title: 'Advanced Trading Mentorship', progress: student.finalCourseProgress, status: student.finalCourseStatus },
            ].map(course => (
              <div key={course.title}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {course.status === 'locked' ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : <BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                    <span className="text-sm font-medium text-foreground">{course.title}</span>
                  </div>
                  <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${course.status === 'locked' ? 'bg-muted text-muted-foreground' : course.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {course.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${course.status === 'locked' ? 'bg-muted-foreground/30' : 'bg-gradient-to-r from-navy to-brand'}`} style={{ width: `${course.progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Award Status */}
        {(student.awardStatus === 'pending_review' || student.awardStatus === 'approved' || student.awardStatus === 'paid') && (
          <div className="bg-gradient-to-br from-brand/10 to-orange-50 border border-brand/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-brand" />
              <div>
                <p className="font-bold text-foreground">$500 Completion Award</p>
                <p className="text-sm text-muted-foreground capitalize">{student.awardStatus.replace(/_/g, ' ')} — Ref: {student.awardReference || 'Pending'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
