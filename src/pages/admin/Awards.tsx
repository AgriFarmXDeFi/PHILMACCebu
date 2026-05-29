import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student } from '@/types';

export default function AdminAwards() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [payRef, setPayRef] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setStudents(getStudentsStore());
  }, [admin, loading, navigate]);

  const pendingAward = students.filter(s => s.awardStatus === 'pending_review');
  const paidAward = students.filter(s => s.awardStatus === 'paid');
  const approvedAward = students.filter(s => s.awardStatus === 'approved');

  const updateAward = (studentId: string, status: Student['awardStatus'], ref?: string) => {
    const updated = students.map(s =>
      s.id === studentId ? { ...s, awardStatus: status, awardReference: ref || s.awardReference, status: status === 'paid' ? 'awarded' as Student['status'] : s.status } : s
    );
    updateStudentsStore(updated);
    setStudents(updated);
    toast.success(`Award status updated to ${status}`);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">Award Management</h1>
          <p className="text-muted-foreground text-sm">Process $500 course completion awards.</p>
        </div>

        {/* Pending */}
        {pendingAward.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Pending Review ({pendingAward.length})</h2>
            {pendingAward.map(s => (
              <div key={s.id} className="bg-white border border-amber-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-foreground">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground">{s.email} · Cert: {s.certificateNumber}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Training: Passed</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Pro Firm: Passed</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Cert: Issued</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateAward(s.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateAward(s.id, 'rejected')} className="border-red-300 text-red-600 gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approved — need to record payment */}
        {approvedAward.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> Approved — Awaiting Payment ({approvedAward.length})</h2>
            {approvedAward.map(s => (
              <div key={s.id} className="bg-white border border-green-200 rounded-xl p-5">
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground mb-2">{s.email}</p>
                    <Input
                      placeholder="Enter payment reference number"
                      value={payRef[s.id] || ''}
                      onChange={e => setPayRef(prev => ({ ...prev, [s.id]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={!payRef[s.id]}
                    onClick={() => updateAward(s.id, 'paid', payRef[s.id])}
                    className="gold-gradient text-[hsl(220,70%,10%)] font-bold gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark as Paid
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paid */}
        <div className="space-y-2">
          <h2 className="font-bold text-foreground text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-gold" /> Paid Awards ({paidAward.length})</h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {paidAward.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No paid awards yet</div>}
            {paidAward.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold text-foreground">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">$500 Paid</p>
                  <p className="font-mono text-xs text-muted-foreground">{s.awardReference}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
