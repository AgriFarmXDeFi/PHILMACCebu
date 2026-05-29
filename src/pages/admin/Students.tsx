import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Filter, SortAsc, SortDesc, CheckSquare, Square,
  ChevronDown, X, CheckCircle, UserCheck, Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student } from '@/types';

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:                { label: 'Pending',            bg: '#fef9c3', color: '#854d0e' },
  payment_review:         { label: 'Payment Review',     bg: '#ffedd5', color: '#9a3412' },
  active:                 { label: 'Active',             bg: '#dcfce7', color: '#166534' },
  basic_course:           { label: 'Basic Course',       bg: '#dbeafe', color: '#1e40af' },
  next_course_qualified:  { label: 'Next Course',        bg: '#ede9fe', color: '#4c1d95' },
  final_course_qualified: { label: 'Final Course',       bg: '#e0e7ff', color: '#3730a3' },
  challenge_training:     { label: 'Training Challenge', bg: '#fef3c7', color: '#92400e' },
  challenge_profirm:      { label: 'Pro Firm',           bg: '#fee2e2', color: '#991b1b' },
  completed:              { label: 'Completed',          bg: '#d1fae5', color: '#065f46' },
  awarded:                { label: 'Awarded',            bg: '#fef3c7', color: '#9a3412' },
};

const STATUS_GROUPS = {
  pending:    ['pending', 'payment_review'],
  active:     ['active', 'basic_course', 'next_course_qualified', 'final_course_qualified'],
  challenge:  ['challenge_training', 'challenge_profirm'],
  completed:  ['completed', 'awarded'],
};

type SortField = 'registeredAt' | 'fullName' | 'directReferrals';
type SortDir = 'asc' | 'desc';
type FilterGroup = 'all' | 'pending' | 'active' | 'challenge' | 'completed';

export default function AdminStudents() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<FilterGroup>('all');
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Student | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkDropdown, setBulkDropdown] = useState(false);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setStudents(getStudentsStore());
  }, [admin, loading, navigate]);

  const filtered = useMemo(() => {
    let list = [...students];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.referralCode.toLowerCase().includes(q) ||
        s.mobile.includes(q)
      );
    }

    // Filter by group
    if (filterGroup !== 'all') {
      const statuses = STATUS_GROUPS[filterGroup] || [];
      list = list.filter(s => statuses.includes(s.status));
    }

    // Sort
    list.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (sortField === 'registeredAt') {
        aVal = new Date(a.registeredAt).getTime();
        bVal = new Date(b.registeredAt).getTime();
      } else if (sortField === 'directReferrals') {
        aVal = a.directReferrals.length;
        bVal = b.directReferrals.length;
      } else {
        aVal = a.fullName.toLowerCase();
        bVal = b.fullName.toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [students, search, filterGroup, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === filtered.length) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map(s => s.id)));
  };

  const updateStatus = (studentId: string, newStatus: Student['status']) => {
    const updated = students.map(s => s.id === studentId ? { ...s, status: newStatus } : s);
    updateStudentsStore(updated);
    setStudents(updated);
    if (selected?.id === studentId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    toast.success('Student status updated');
  };

  const bulkUpdateStatus = (newStatus: Student['status']) => {
    if (checkedIds.size === 0) { toast.error('No students selected'); return; }
    const updated = students.map(s => checkedIds.has(s.id) ? { ...s, status: newStatus } : s);
    updateStudentsStore(updated);
    setStudents(updated);
    toast.success(`${checkedIds.size} student${checkedIds.size > 1 ? 's' : ''} updated to "${newStatus.replace(/_/g, ' ')}"`);
    setCheckedIds(new Set());
    setBulkDropdown(false);
  };

  const exportCSV = () => {
    const header = 'Name,Email,Mobile,Referral Code,Status,Direct Refs,Registered At';
    const rows = filtered.map(s =>
      `"${s.fullName}","${s.email}","${s.mobile}","${s.referralCode}","${s.status}",${s.directReferrals.length},"${new Date(s.registeredAt).toLocaleDateString()}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'philmac_students.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Student list exported');
  };

  const SortIcon = sortDir === 'asc' ? SortAsc : SortDesc;

  const filterCounts = useMemo(() => ({
    all:       students.length,
    pending:   students.filter(s => STATUS_GROUPS.pending.includes(s.status)).length,
    active:    students.filter(s => STATUS_GROUPS.active.includes(s.status)).length,
    challenge: students.filter(s => STATUS_GROUPS.challenge.includes(s.status)).length,
    completed: students.filter(s => STATUS_GROUPS.completed.includes(s.status)).length,
  }), [students]);

  if (loading || !admin) return null;

  return (
    <AdminLayout>
      <div className="max-w-7xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Student Management</h1>
            <p className="text-muted-foreground text-sm">
              {students.length} total students · {filtered.length} shown
              {checkedIds.size > 0 && ` · ${checkedIds.size} selected`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 border-border text-foreground">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, email, referral code..."
              className="pl-9"
              style={{ color: 'hsl(218,72%,12%)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Group Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(['all', 'pending', 'active', 'challenge', 'completed'] as FilterGroup[]).map(g => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                style={{
                  background: filterGroup === g ? 'hsl(218,72%,18%)' : 'transparent',
                  color: filterGroup === g ? '#ffffff' : 'hsl(218,35%,48%)',
                }}
              >
                {g} <span style={{ opacity: 0.7 }}>({filterCounts[g]})</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1">
            {(['registeredAt', 'fullName', 'directReferrals'] as SortField[]).map(f => (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  borderColor: sortField === f ? 'hsl(18,90%,54%)' : 'hsl(215,18%,85%)',
                  background: sortField === f ? 'rgba(234,88,12,0.08)' : '#ffffff',
                  color: sortField === f ? 'hsl(18,90%,40%)' : 'hsl(218,35%,48%)',
                }}
              >
                {sortField === f && <SortIcon className="w-3 h-3" />}
                {f === 'registeredAt' ? 'Date' : f === 'fullName' ? 'Name' : 'Refs'}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {checkedIds.size > 0 && (
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 flex-wrap"
            style={{ background: 'hsl(218,72%,16%)', border: '1px solid hsl(218,72%,25%)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />
              <span style={{ color: '#ffffff' }} className="text-sm font-semibold">
                {checkedIds.size} student{checkedIds.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2 relative">
              <button
                onClick={() => bulkUpdateStatus('active')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: '#dcfce7', color: '#166534' }}
              >
                <UserCheck className="w-3.5 h-3.5" /> Approve All
              </button>
              <div className="relative">
                <button
                  onClick={() => setBulkDropdown(d => !d)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
                >
                  <Filter className="w-3.5 h-3.5" /> Set Status <ChevronDown className="w-3 h-3" />
                </button>
                {bulkDropdown && (
                  <div
                    className="absolute right-0 top-full mt-1 rounded-xl shadow-xl z-30 py-1 min-w-48"
                    style={{ background: '#ffffff', border: '1px solid hsl(215,18%,85%)' }}
                  >
                    {Object.entries(STATUS_META).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => bulkUpdateStatus(key as Student['status'])}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 flex items-center gap-2"
                        style={{ color: 'hsl(218,72%,12%)' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: meta.color }}
                        />
                        {meta.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setCheckedIds(new Set())}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Table + Detail */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border" style={{ background: 'hsl(210,20%,97%)' }}>
                  <tr>
                    <th className="px-4 py-3 w-8">
                      <button onClick={toggleAll}>
                        {checkedIds.size === filtered.length && filtered.length > 0
                          ? <CheckSquare className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />
                          : <Square className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none"
                      onClick={() => toggleSort('fullName')}
                    >
                      <div className="flex items-center gap-1">
                        Student {sortField === 'fullName' && <SortIcon className="w-3 h-3" />}
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                      Referral Code
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none hidden sm:table-cell"
                      onClick={() => toggleSort('directReferrals')}
                    >
                      <div className="flex items-center gap-1">
                        Refs {sortField === 'directReferrals' && <SortIcon className="w-3 h-3" />}
                      </div>
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none hidden lg:table-cell"
                      onClick={() => toggleSort('registeredAt')}
                    >
                      <div className="flex items-center gap-1">
                        Registered {sortField === 'registeredAt' && <SortIcon className="w-3 h-3" />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(student => {
                    const meta = STATUS_META[student.status] || { label: student.status, bg: '#f3f4f6', color: '#374151' };
                    const isChecked = checkedIds.has(student.id);
                    const isSelected = selected?.id === student.id;
                    return (
                      <tr
                        key={student.id}
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                        style={{ background: isSelected ? 'rgba(234,88,12,0.05)' : isChecked ? 'rgba(59,130,246,0.05)' : undefined }}
                        onClick={() => setSelected(student)}
                      >
                        <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleCheck(student.id); }}>
                          {isChecked
                            ? <CheckSquare className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />
                            : <Square className="w-4 h-4 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                            >
                              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">{student.fullName}</p>
                              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs hidden md:table-cell" style={{ color: 'hsl(218,35%,52%)' }}>
                          {student.referralCode}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs hidden sm:table-cell" style={{ color: 'hsl(218,35%,48%)' }}>
                          {student.directReferrals.length}/3
                        </td>
                        <td className="px-4 py-3 text-xs hidden lg:table-cell" style={{ color: 'hsl(218,35%,52%)' }}>
                          {new Date(student.registeredAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm font-medium">No students found</p>
                  <p style={{ color: 'hsl(218,35%,62%)' }} className="text-xs mt-1">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Detail Panel */}
          {selected ? (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Student Details</p>
                <button onClick={() => setSelected(null)}>
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                  >
                    {selected.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold">{selected.fullName}</p>
                    <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs font-mono">{selected.referralCode}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    ['Email', selected.email],
                    ['Mobile', selected.mobile],
                    ['Payment Ref', selected.paymentReference],
                    ['Registered', new Date(selected.registeredAt).toLocaleDateString('en-PH')],
                    ['Direct Refs', `${selected.directReferrals.length} / 3`],
                    ['Basic Course', selected.basicCourseStatus.replace(/_/g, ' ')],
                    ['Next Course',  selected.nextCourseStatus.replace(/_/g, ' ')],
                    ['Certificate',  selected.certificateIssued ? selected.certificateNumber || 'Issued' : 'Not Issued'],
                    ['Award',        selected.awardStatus.replace(/_/g, ' ')],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span style={{ color: 'hsl(218,35%,52%)' }}>{label}</span>
                      <span style={{ color: 'hsl(218,72%,12%)' }} className="font-medium text-right max-w-[60%] truncate capitalize">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border">
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Update Status
                  </p>
                  <div className="space-y-1.5">
                    {(['active', 'basic_course', 'next_course_qualified', 'final_course_qualified', 'challenge_training', 'challenge_profirm', 'completed', 'awarded'] as Student['status'][]).map(s => {
                      const meta = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-all flex items-center gap-2"
                          style={{
                            borderColor: selected.status === s ? 'hsl(18,90%,54%)' : 'hsl(215,18%,85%)',
                            background: selected.status === s ? 'rgba(234,88,12,0.08)' : '#ffffff',
                            color: selected.status === s ? 'hsl(18,90%,40%)' : 'hsl(218,72%,12%)',
                            fontWeight: selected.status === s ? 700 : 400,
                          }}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta?.color || '#9ca3af' }} />
                          {meta?.label || s.replace(/_/g, ' ')}
                          {selected.status === s && <span className="ml-auto text-xs">✓ Current</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl border border-dashed p-8 text-center"
              style={{ borderColor: 'hsl(215,18%,80%)' }}
            >
              <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'hsl(218,35%,70%)' }} />
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-1">No student selected</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                Click a row to view and manage student details.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
