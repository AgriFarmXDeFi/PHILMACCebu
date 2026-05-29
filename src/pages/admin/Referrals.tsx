import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/layout/AdminLayout';
import ReferralTree from '@/components/features/ReferralTree';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import type { Student } from '@/types';

export default function AdminReferrals() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    const s = getStudentsStore();
    setStudents(s);
    if (s.length > 0) setSelected(s[0]);
  }, [admin, loading, navigate]);

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-5">
        <div>
          <h1 className="text-xl font-black text-foreground">Referral Network</h1>
          <p className="text-muted-foreground text-sm">Interactive tree view of all student referral networks.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Student List */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
              {filtered.map(s => (
                <div
                  key={s.id}
                  className={`p-3 cursor-pointer hover:bg-muted/30 flex items-center justify-between transition-colors ${selected?.id === s.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                  onClick={() => setSelected(s)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 brand-gradient rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">
                      {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-xs leading-tight">{s.fullName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{s.referralCode}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-foreground">{s.directReferrals.length}/3</p>
                    <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs">No students found</div>
              )}
            </div>
          </div>

          {/* Tree View */}
          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-black text-foreground">{selected.fullName}</p>
                    <p className="text-xs font-mono text-brand mt-0.5">{selected.referralCode}</p>
                    {selected.sponsorCode && (
                      <p className="text-xs text-muted-foreground mt-0.5">Sponsored by: <span className="font-mono font-semibold">{selected.sponsorCode}</span></p>
                    )}
                  </div>
                  <button
                    onClick={() => setStudents(getStudentsStore())}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <ReferralTree rootStudent={selected} allStudents={students} />
              </>
            ) : (
              <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
                <p className="text-sm">Select a student to view their referral tree.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
