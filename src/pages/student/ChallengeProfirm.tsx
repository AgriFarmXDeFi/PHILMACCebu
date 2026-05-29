import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Lock, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';

const REQUIREMENTS = [
  'Complete all 30 days of the Training Challenge',
  'Receive admin approval for the Training Challenge',
  'Submit 30-day Pro Firm evaluation logs',
  'Maintain trading discipline checklist daily',
  'Monitor and manage risk consistently',
  'Submit daily performance reports',
  'Pass final performance review',
];

export default function ChallengeProfirm() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const isLocked = student.challengeProfirmStatus === 'not_started' && student.challengeTrainingStatus !== 'passed';

  return (
    <StudentLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">30-Day Pro Firm Challenge</h1>
          <p className="text-muted-foreground text-sm mt-0.5">The final evaluation before receiving your certificate and $500 award.</p>
        </div>

        {isLocked ? (
          <div className="bg-white border border-border rounded-xl p-8 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">Pro Firm Challenge Locked</h3>
            <p className="text-muted-foreground text-sm mb-4">You must pass the 30-Day Training Challenge first before accessing the Pro Firm Challenge.</p>
            <Button asChild variant="outline">
              <Link to="/student/challenge-training">Go to Training Challenge</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className={`rounded-xl border p-5 ${student.challengeProfirmStatus === 'passed' ? 'bg-green-50 border-green-200' : 'bg-gradient-to-br from-navy/5 to-navy/10 border-navy/20'}`}>
              <div className="flex items-center gap-3">
                <Trophy className={`w-8 h-8 ${student.challengeProfirmStatus === 'passed' ? 'text-green-600' : 'text-navy'}`} />
                <div>
                  <p className="font-bold text-foreground">Pro Firm Challenge Status</p>
                  <p className={`text-sm capitalize font-semibold mt-0.5 ${student.challengeProfirmStatus === 'passed' ? 'text-green-600' : 'text-navy'}`}>
                    {student.challengeProfirmStatus.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5">
              <h2 className="font-bold text-foreground mb-4">Challenge Requirements</h2>
              <div className="space-y-3">
                {REQUIREMENTS.map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {student.challengeProfirmStatus === 'passed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-foreground leading-relaxed">{req}</p>
                  </div>
                ))}
              </div>
            </div>

            {student.challengeProfirmStatus === 'passed' && (
              <div className="bg-gradient-to-br from-gold/10 to-amber-50 border border-gold/30 rounded-xl p-6 text-center">
                <Trophy className="w-12 h-12 text-gold mx-auto mb-3" />
                <h3 className="text-xl font-black text-foreground mb-2">Pro Firm Challenge Passed!</h3>
                <p className="text-muted-foreground text-sm mb-4">Congratulations! You have completed all requirements. Check your certificate and award status.</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild className="gold-gradient text-[hsl(220,70%,10%)] font-bold">
                    <Link to="/student/certificates">View Certificate</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/student/awards">View Award Status</Link>
                  </Button>
                </div>
              </div>
            )}

            {student.challengeProfirmStatus === 'active' && (
              <div className="bg-white border border-border rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-2">Challenge Active</h3>
                <p className="text-sm text-muted-foreground mb-4">Your Pro Firm Challenge is currently active. Submit your daily reports to the admin via the Support section.</p>
                <Button asChild variant="outline">
                  <Link to="/student/support">Contact Admin / Submit Report</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
