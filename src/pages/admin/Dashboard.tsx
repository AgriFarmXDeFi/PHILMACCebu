import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, CreditCard, TrendingUp, Award, Trophy, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { MOCK_PENDING_REGISTRATIONS } from '@/lib/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const students = getStudentsStore();
  const pendingRegs = JSON.parse(localStorage.getItem('philmac_registrations') || JSON.stringify(MOCK_PENDING_REGISTRATIONS));

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'bg-blue-500', sub: 'All registered students' },
    { label: 'Pending Registrations', value: pendingRegs.filter((r: { status: string }) => r.status === 'pending').length, icon: ClipboardList, color: 'bg-amber-500', sub: 'Awaiting review' },
    { label: 'Active Subscribers', value: students.filter(s => !['pending', 'payment_review'].includes(s.status)).length, icon: CreditCard, color: 'bg-green-500', sub: 'Paid & active' },
    { label: 'Basic Course Students', value: students.filter(s => s.basicCourseStatus === 'in_progress').length, icon: BookOpen, color: 'bg-cyan-500', sub: 'Currently in basic' },
    { label: 'Active Challenges', value: students.filter(s => s.challengeTrainingStatus === 'active' || s.challengeProfirmStatus === 'active').length, icon: TrendingUp, color: 'bg-purple-500', sub: '30-day challenges' },
    { label: 'Completed Students', value: students.filter(s => s.status === 'completed' || s.status === 'awarded').length, icon: CheckCircle, color: 'bg-emerald-500', sub: 'All stages done' },
    { label: 'Certificates Issued', value: students.filter(s => s.certificateIssued).length, icon: Award, color: 'bg-indigo-500', sub: 'Certified traders' },
    { label: 'Pending $500 Awards', value: students.filter(s => s.awardStatus === 'pending_review').length, icon: Trophy, color: 'bg-brand', sub: 'Awaiting award approval' },
  ];

  const recentActivity = [
    { time: '2h ago', msg: 'Carlo Mendoza submitted new registration', type: 'registration' },
    { time: '5h ago', msg: 'Ana Reyes submitted Day 15 challenge log', type: 'challenge' },
    { time: '1d ago', msg: 'Roberto Uy awarded $500 completion award', type: 'award' },
    { time: '2d ago', msg: 'Juan dela Cruz unlocked basic course', type: 'course' },
    { time: '3d ago', msg: 'Maria Santos completed 3 direct referrals', type: 'referral' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-xl font-black text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">PHILMAC Cebu management overview — {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Recent Students</h3>
              <span className="text-xs text-muted-foreground">{students.length} total</span>
            </div>
            <div className="divide-y divide-border">
              {students.slice(0, 5).map(student => (
                <div key={student.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center text-[hsl(220,70%,10%)] text-xs font-bold shrink-0">
                    {student.fullName.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.referralCode}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${
                    student.status === 'completed' || student.status === 'awarded' ? 'bg-green-100 text-green-700' :
                    student.status === 'challenge_training' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{student.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((activity, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    activity.type === 'registration' ? 'bg-amber-500' :
                    activity.type === 'challenge' ? 'bg-purple-500' :
                    activity.type === 'award' ? 'bg-gold' :
                    activity.type === 'course' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-snug">{activity.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
