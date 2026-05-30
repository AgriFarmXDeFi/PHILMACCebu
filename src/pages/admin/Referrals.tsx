import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Download, Users, ChevronRight, Network,
  CheckCircle, Clock, TrendingUp, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import ReferralTree from '@/components/features/ReferralTree';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student } from '@/types';

const STATUS_META: Record<string, { bg: string; color: string; label: string }> = {
  pending:                { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  payment_review:         { bg: '#ffedd5', color: '#9a3412', label: 'Payment Review' },
  active:                 { bg: '#dcfce7', color: '#166534', label: 'Active' },
  basic_course:           { bg: '#dbeafe', color: '#1e40af', label: 'Basic Course' },
  next_course_qualified:  { bg: '#ede9fe', color: '#4c1d95', label: 'Next Course' },
  final_course_qualified: { bg: '#e0e7ff', color: '#312e81', label: 'Final Course' },
  challenge_training:     { bg: '#fef9c3', color: '#713f12', label: 'Training Challenge' },
  challenge_profirm:      { bg: '#fee2e2', color: '#991b1b', label: 'Pro Firm' },
  completed:              { bg: '#d1fae5', color: '#064e3b', label: 'Completed' },
  awarded:                { bg: '#fef3c7', color: '#9a3412', label: 'Awarded' },
};

function getStatusMeta(status: string) {
  return STATUS_META[status] || { bg: 'hsl(215,18%,90%)', color: 'hsl(218,35%,52%)', label: status };
}

export default function AdminReferrals() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'network' | 'directs'>('network');

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    const s = getStudentsStore();
    setStudents(s);
    if (s.length > 0) setSelected(s[0]);
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const refresh = () => {
    const s = getStudentsStore();
    setStudents(s);
    if (selected) {
      const updated = s.find(st => st.id === selected.id);
      if (updated) setSelected(updated);
    }
    toast.success('Referral data refreshed');
  };

  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.referralCode.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'network') {
      list.sort((a, b) => (b.directReferrals.length + (b.secondLevelReferrals?.length ?? 0))
        - (a.directReferrals.length + (a.secondLevelReferrals?.length ?? 0)));
    } else if (sortBy === 'directs') {
      list.sort((a, b) => b.directReferrals.length - a.directReferrals.length);
    } else {
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    return list;
  }, [students, search, sortBy]);

  // ── Selected student's full referral details ──
  const selectedNetwork = useMemo(() => {
    if (!selected) return null;
    const level1 = selected.directReferrals
      .map(id => students.find(s => s.id === id))
      .filter(Boolean) as Student[];
    const level2: Student[] = [];
    level1.forEach(l1 => {
      l1.directReferrals.forEach(id => {
        const s = students.find(st => st.id === id);
        if (s) level2.push(s);
      });
    });
    const level3: Student[] = [];
    level2.forEach(l2 => {
      l2.directReferrals.forEach(id => {
        const s = students.find(st => st.id === id);
        if (s) level3.push(s);
      });
    });
    return { level1, level2, level3, total: level1.length + level2.length + level3.length };
  }, [selected, students]);

  // ── Export full referral list to CSV ──
  const exportCSV = () => {
    const rows: string[] = [
      '"Student Name","Email","Referral Code","Sponsor Code","Status","Direct Referrals","Level 2 Count","Network Total","Registered At"',
    ];
    students.forEach(s => {
      const networkTotal = s.directReferrals.length + (s.secondLevelReferrals?.length ?? 0);
      rows.push([
        `"${s.fullName}"`,
        `"${s.email}"`,
        `"${s.referralCode}"`,
        `"${s.sponsorCode || '—'}"`,
        `"${s.status.replace(/_/g, ' ')}"`,
        `"${s.directReferrals.length}"`,
        `"${s.secondLevelReferrals?.length ?? 0}"`,
        `"${networkTotal}"`,
        `"${new Date(s.registeredAt).toLocaleDateString('en-PH')}"`,
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'philmac_referrals.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Referral list exported to CSV');
  };

  // ── Network-wide stats ──
  const networkStats = useMemo(() => {
    const totalStudents = students.length;
    const totalDirectRels = students.reduce((acc, s) => acc + s.directReferrals.length, 0);
    const has3Directs = students.filter(s => s.directReferrals.length >= 3).length;
    const hasFullNetwork = students.filter(s => (s.secondLevelReferrals?.length ?? 0) >= 9).length;
    return { totalStudents, totalDirectRels, has3Directs, hasFullNetwork };
  }, [students]);

  return (
    <AdminLayout>
      <div className="max-w-7xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Referral Network</h1>
            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">
              Interactive 3-level referral tree viewer for all students.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refresh} className="gap-1.5 border-border font-semibold" style={{ color: 'hsl(218,72%,12%)' }}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="outline" onClick={exportCSV} className="gap-1.5 border-border font-semibold" style={{ color: 'hsl(218,72%,12%)' }}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Network-wide Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Students',   val: networkStats.totalStudents,   bg: '#dbeafe', color: '#1e40af', icon: Users },
            { label: 'Total Referrals',  val: networkStats.totalDirectRels, bg: '#ede9fe', color: '#4c1d95', icon: Network },
            { label: 'Unlocked L2',      val: networkStats.has3Directs,     bg: '#fef3c7', color: '#92400e', icon: CheckCircle },
            { label: 'Full 3×3 Network', val: networkStats.hasFullNetwork,  bg: '#d1fae5', color: '#065f46', icon: TrendingUp },
          ].map(({ label, val, bg, color, icon: Icon }) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color }}>{val}</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">

          {/* ── Left: Student List ── */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>

            {/* Search + Sort */}
            <div className="p-4 border-b border-border space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, ref code..."
                  className="pl-8 text-xs"
                  style={{ color: 'hsl(218,72%,12%)' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              {/* Sort */}
              <div className="flex gap-1">
                {[
                  { key: 'network', label: 'By Network' },
                  { key: 'directs', label: 'By Directs' },
                  { key: 'name',    label: 'By Name' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as typeof sortBy)}
                    className="flex-1 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: sortBy === key ? 'hsl(218,72%,16%)' : 'hsl(210,20%,95%)',
                      color: sortBy === key ? '#ffffff' : 'hsl(218,35%,52%)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Items */}
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {filteredStudents.length === 0 && (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No students found</p>
                </div>
              )}
              {filteredStudents.map(s => {
                const directCnt = s.directReferrals.length;
                const networkCnt = directCnt + (s.secondLevelReferrals?.length ?? 0);
                const statusMeta = getStatusMeta(s.status);
                const isSelected = selected?.id === s.id;
                const direct3Done = directCnt >= 3;
                const networkFull = (s.secondLevelReferrals?.length ?? 0) >= 9;

                return (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-3.5 hover:bg-muted/20 transition-colors"
                    style={{ background: isSelected ? 'rgba(234,88,12,0.05)' : undefined }}
                    onClick={() => setSelected(s)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                      >
                        {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-xs truncate">
                            {s.fullName}
                          </p>
                          {isSelected && (
                            <span className="text-xs font-bold shrink-0" style={{ color: 'hsl(18,90%,48%)' }}>●</span>
                          )}
                        </div>
                        <p style={{ color: 'hsl(218,35%,58%)' }} className="text-xs font-mono">{s.referralCode}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: statusMeta.bg, color: statusMeta.color }}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                      </div>
                      {/* Network badge */}
                      <div className="text-right shrink-0">
                        <div
                          className="text-sm font-black"
                          style={{ color: networkFull ? '#16a34a' : direct3Done ? 'hsl(218,72%,18%)' : 'hsl(218,35%,55%)' }}
                        >
                          {networkCnt}
                          <span style={{ color: 'hsl(218,35%,60%)', fontWeight: 400, fontSize: 10 }}>/12</span>
                        </div>
                        <p style={{ color: 'hsl(218,35%,60%)', fontSize: 10 }}>
                          {directCnt} direct
                        </p>
                        <ChevronRight className="w-3 h-3 ml-auto mt-0.5" style={{ color: 'hsl(215,18%,70%)' }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Tree View ── */}
          <div className="lg:col-span-3 space-y-4">
            {selected ? (
              <>
                {/* Selected Student Header */}
                <div className="bg-white border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                      >
                        {selected.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">{selected.fullName}</p>
                        <p style={{ color: 'hsl(18,90%,48%)' }} className="text-xs font-mono font-bold">{selected.referralCode}</p>
                        {selected.sponsorCode && (
                          <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">
                            Sponsored by: <span className="font-mono font-semibold">{selected.sponsorCode}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Network summary */}
                    {selectedNetwork && (
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { label: 'Direct', val: selectedNetwork.level1.length, max: 3, color: '#2563eb', bg: '#dbeafe' },
                          { label: 'Level 2', val: selectedNetwork.level2.length, max: 9, color: '#7c3aed', bg: '#ede9fe' },
                          { label: 'Level 3', val: selectedNetwork.level3.length, max: 27, color: '#92400e', bg: '#fef3c7' },
                        ].map(({ label, val, max, color, bg }) => (
                          <div
                            key={label}
                            className="text-center px-3 py-2 rounded-xl"
                            style={{ background: bg }}
                          >
                            <p className="text-base font-black" style={{ color }}>{val}</p>
                            <p className="text-xs font-medium" style={{ color }}>{label}</p>
                          </div>
                        ))}
                        <div
                          className="text-center px-3 py-2 rounded-xl"
                          style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                        >
                          <p className="text-base font-black text-white">{selectedNetwork.total}</p>
                          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>Total</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Level breakdown list */}
                  {selectedNetwork && selectedNetwork.level1.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-3">
                        Network Members
                      </p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {[
                          ...selectedNetwork.level1.map(s => ({ ...s, depth: 1 })),
                          ...selectedNetwork.level2.map(s => ({ ...s, depth: 2 })),
                          ...selectedNetwork.level3.map(s => ({ ...s, depth: 3 })),
                        ].map(s => {
                          const depthColors = [
                            { bg: '#dbeafe', color: '#1e40af', label: 'L1' },
                            { bg: '#ede9fe', color: '#4c1d95', label: 'L2' },
                            { bg: '#fef3c7', color: '#92400e', label: 'L3' },
                          ];
                          const dc = depthColors[(s.depth as number) - 1];
                          const sMeta = getStatusMeta(s.status);
                          return (
                            <div
                              key={`${s.id}-${s.depth}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              style={{ background: 'hsl(210,20%,97.5%)', border: '1px solid hsl(215,18%,88%)' }}
                            >
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: dc.bg, color: dc.color }}>
                                {dc.label}
                              </span>
                              <span style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold flex-1 truncate">{s.fullName}</span>
                              <span style={{ color: 'hsl(218,35%,58%)' }} className="text-xs font-mono shrink-0">{s.referralCode}</span>
                              <span
                                className="text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: sMeta.bg, color: sMeta.color }}
                              >
                                {sMeta.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tree Diagram */}
                <ReferralTree rootStudent={selected} allStudents={students} />
              </>
            ) : (
              <div
                className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-24"
                style={{ borderColor: 'hsl(215,18%,82%)' }}
              >
                <Network className="w-12 h-12 mb-3" style={{ color: 'hsl(218,35%,70%)' }} />
                <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No Student Selected</p>
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center max-w-xs">
                  Select a student from the left panel to view their interactive 3-level referral tree.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
