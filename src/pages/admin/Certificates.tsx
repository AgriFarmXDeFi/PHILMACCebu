import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student } from '@/types';

export default function AdminCertificates() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setStudents(getStudentsStore());
  }, [admin, loading, navigate]);

  const eligible = students.filter(s =>
    s.challengeTrainingStatus === 'passed' && s.challengeProfirmStatus === 'passed' && !s.certificateIssued
  );
  const issued = students.filter(s => s.certificateIssued);

  const issueCert = (studentId: string) => {
    const certNumber = `PMAC-${new Date().getFullYear()}-${String(issued.length + 1).padStart(4, '0')}`;
    const updated = students.map(s =>
      s.id === studentId ? {
        ...s,
        certificateIssued: true,
        certificateNumber: certNumber,
        certificateDate: new Date().toISOString().split('T')[0],
        status: 'completed' as Student['status'],
        awardStatus: 'pending_review' as Student['awardStatus'],
      } : s
    );
    updateStudentsStore(updated);
    setStudents(updated);
    toast.success(`Certificate ${certNumber} issued!`);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">Certificate Management</h1>
          <p className="text-muted-foreground text-sm">Issue certificates to qualified students.</p>
        </div>

        {eligible.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" /> Eligible for Certificate ({eligible.length})
            </h2>
            {eligible.map(s => (
              <div key={s.id} className="bg-white border border-amber-200 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold text-foreground">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.email} · {s.referralCode}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Training: Passed</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Pro Firm: Passed</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => issueCert(s.id)} className="gold-gradient text-[hsl(220,70%,10%)] font-bold gap-1">
                  <Award className="w-3.5 h-3.5" /> Issue Certificate
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-green-500" /> Issued Certificates ({issued.length})
          </h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {issued.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No certificates issued yet</div>}
            {issued.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold text-foreground">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-foreground">{s.certificateNumber}</p>
                  <p className="text-xs text-muted-foreground">{s.certificateDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
