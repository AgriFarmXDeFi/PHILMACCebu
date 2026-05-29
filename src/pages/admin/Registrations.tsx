import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { MOCK_PENDING_REGISTRATIONS } from '@/lib/mockData';
import { toast } from 'sonner';
import type { Registration } from '@/types';

export default function AdminRegistrations() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [regs, setRegs] = useState<Registration[]>([]);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    const stored = localStorage.getItem('philmac_registrations');
    const formRegs = stored ? JSON.parse(stored) : [];
    setRegs([...MOCK_PENDING_REGISTRATIONS, ...formRegs]);
  }, [admin, loading, navigate]);

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Registration ${status}`);
  };

  const pending = regs.filter(r => r.status === 'pending');
  const reviewed = regs.filter(r => r.status !== 'pending');

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">Registration Management</h1>
          <p className="text-muted-foreground text-sm">{pending.length} pending registrations</p>
        </div>

        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Pending Review</h2>
            {pending.map(reg => (
              <div key={reg.id} className="bg-white border border-amber-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{reg.fullName}</p>
                    <p className="text-sm text-muted-foreground">{reg.email} · {reg.mobile}</p>
                    <p className="text-xs text-muted-foreground">Sponsor: <span className="font-mono">{reg.sponsorCode || 'None'}</span></p>
                    <p className="text-xs text-muted-foreground">Payment: <span className="font-semibold">{reg.paymentMethod}</span> — Ref: <span className="font-mono">{reg.paymentReference}</span></p>
                    <p className="text-xs text-muted-foreground">Schedule: {reg.preferredSchedule} · Experience: {reg.experience}</p>
                    <p className="text-xs text-muted-foreground">Submitted: {new Date(reg.submittedAt).toLocaleDateString('en-PH')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(reg.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(reg.id, 'rejected')} className="border-red-300 text-red-600 hover:bg-red-50 gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewed.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold text-foreground">Reviewed Registrations</h2>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              {reviewed.map(reg => (
                <div key={reg.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 gap-4">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{reg.fullName}</p>
                    <p className="text-xs text-muted-foreground">{reg.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reg.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {regs.length === 0 && (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No registrations yet</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
