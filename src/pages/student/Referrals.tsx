import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Users, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import ReferralTree from '@/components/features/ReferralTree';
import { useStudentAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';

export default function StudentReferrals() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const allStudents = getStudentsStore();
  const referralLink = `philmaccebu.com/register?ref=${student.referralCode}`;
  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied!'); };

  const direct3Done = student.directReferrals.length >= 3;
  const secondLevelCount = student.secondLevelReferrals.length;
  const threeByThreeDone = secondLevelCount >= 9;
  const directStudents = allStudents.filter(s => student.directReferrals.includes(s.id));

  return (
    <StudentLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">Referral Network</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your referrals and course unlock progress.</p>
        </div>

        {/* Referral Code Banner */}
        <div className="rounded-2xl overflow-hidden philmac-stripe p-5 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Your Referral Code</p>
          <p className="text-3xl sm:text-4xl font-black tracking-wider mb-1">{student.referralCode}</p>
          <p className="text-white/55 text-sm mb-4 font-mono">{referralLink}</p>
          <Button size="sm" onClick={copyLink} className="brand-gradient text-white font-semibold gap-2 shadow-lg hover:opacity-90">
            <Copy className="w-3.5 h-3.5" /> Copy Referral Link
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className={`rounded-xl border p-4 ${direct3Done ? 'bg-green-50 border-green-200' : 'bg-white border-border'}`}>
            <div className="flex items-center justify-between mb-1">
              <Users className={`w-5 h-5 ${direct3Done ? 'text-green-600' : 'text-muted-foreground'}`} />
              {direct3Done ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-2xl font-black text-foreground">{student.directReferrals.length}<span className="text-base font-normal text-muted-foreground">/3</span></p>
            <p className="text-xs font-semibold text-foreground mt-0.5">Direct Paid Referrals</p>
            <p className={`text-xs mt-1 ${direct3Done ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
              {direct3Done ? '✅ Next Course Unlocked' : `Need ${3 - student.directReferrals.length} more`}
            </p>
          </div>
          <div className={`rounded-xl border p-4 ${threeByThreeDone ? 'bg-green-50 border-green-200' : 'bg-white border-border'}`}>
            <div className="flex items-center justify-between mb-1">
              <Users className={`w-5 h-5 ${threeByThreeDone ? 'text-green-600' : 'text-muted-foreground'}`} />
              {threeByThreeDone ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-2xl font-black text-foreground">{secondLevelCount}<span className="text-base font-normal text-muted-foreground">/9</span></p>
            <p className="text-xs font-semibold text-foreground mt-0.5">Second-Level Students</p>
            <p className={`text-xs mt-1 ${threeByThreeDone ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
              {threeByThreeDone ? '✅ Final Course Unlocked' : '3x3 requirement'}
            </p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <p className="text-2xl font-black text-foreground">
              {directStudents.filter(d => d.directReferrals.length >= 3).length}<span className="text-base font-normal text-muted-foreground">/3</span>
            </p>
            <p className="text-xs font-semibold text-foreground mt-0.5">Directs with 3+ Sub-Refs</p>
            <p className="text-xs text-muted-foreground mt-1">3x3 progress tracker</p>
          </div>
        </div>

        {/* Interactive Referral Tree */}
        <div>
          <h2 className="font-black text-foreground mb-3">Interactive Referral Tree</h2>
          <ReferralTree rootStudent={student} allStudents={allStudents} />
        </div>

        {/* Direct Referrals Detail */}
        {directStudents.length > 0 && (
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="font-bold text-foreground mb-4">Direct Referral Details</h2>
            <div className="space-y-3">
              {directStudents.map(ds => {
                const subCount = ds.directReferrals.length;
                const qualified = subCount >= 3;
                return (
                  <div key={ds.id} className={`rounded-xl border p-4 ${qualified ? 'border-green-200 bg-green-50/40' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-black">
                          {ds.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{ds.fullName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{ds.referralCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-foreground">{subCount}/3 sub-refs</p>
                        {qualified
                          ? <span className="text-xs text-green-600 font-semibold">✅ Qualified</span>
                          : <span className="text-xs text-muted-foreground">In progress</span>}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((subCount / 3) * 100, 100)}%`,
                          background: qualified ? '#22c55e' : 'hsl(18, 90%, 54%)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
