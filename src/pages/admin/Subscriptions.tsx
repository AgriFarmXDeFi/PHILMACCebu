import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle, XCircle, Clock, Eye, MessageSquare,
  ChevronDown, ChevronUp, Image, DollarSign, Calendar, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore, updateStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { Student } from '@/types';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  gcash: 'GCash',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash Payment',
  maya: 'Maya (PayMaya)',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  payment_review: 'bg-blue-100 text-blue-700 border-blue-200',
  basic_course: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

interface ExpandedState {
  [id: string]: boolean;
}

interface AdminNotes {
  [id: string]: string;
}

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [adminNotes, setAdminNotes] = useState<AdminNotes>({});
  const [rejectNotes, setRejectNotes] = useState<AdminNotes>({});
  const [showRejectForm, setShowRejectForm] = useState<ExpandedState>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setStudents(getStudentsStore());
  }, [admin, loading, navigate]);

  const pendingPayment = students.filter(s =>
    s.status === 'pending' || s.status === 'payment_review'
  );
  const activeStudents = students.filter(s =>
    !['pending', 'payment_review'].includes(s.status)
  );

  const approvePayment = (studentId: string) => {
    setProcessingId(studentId);
    setTimeout(() => {
      const note = adminNotes[studentId] || 'Payment verified. Subscription activated.';
      const updated = students.map(s =>
        s.id === studentId
          ? {
              ...s,
              status: 'basic_course' as Student['status'],
              basicCourseStatus: 'in_progress' as const,
              approvedAt: new Date().toISOString(),
              adminNote: note,
            }
          : s
      );
      updateStudentsStore(updated);
      setStudents(updated);
      setProcessingId(null);
      toast.success(`Payment verified for ${students.find(s => s.id === studentId)?.fullName} — portal activated`);
    }, 800);
  };

  const rejectPayment = (studentId: string) => {
    const note = rejectNotes[studentId];
    if (!note?.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setProcessingId(studentId);
    setTimeout(() => {
      const updated = students.map(s =>
        s.id === studentId
          ? { ...s, status: 'pending' as Student['status'], adminNote: note }
          : s
      );
      updateStudentsStore(updated);
      setStudents(updated);
      setProcessingId(null);
      setShowRejectForm(prev => ({ ...prev, [studentId]: false }));
      toast.error(`Payment rejected — student has been notified`);
    }, 800);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !admin) return null;

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Subscription Payments</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Verify $100 student subscription payments and manage portal access.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 text-center">
              <p className="text-xl font-black text-amber-700">{pendingPayment.length}</p>
              <p className="text-xs text-amber-600 font-medium">Pending</p>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg px-3 py-2 text-center">
              <p className="text-xl font-black text-green-700">{activeStudents.length}</p>
              <p className="text-xs text-green-600 font-medium">Active</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pending ({pendingPayment.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'active' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Active Subscribers ({activeStudents.length})
          </button>
        </div>

        {/* PENDING PAYMENTS TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingPayment.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-bold text-foreground text-lg mb-1">All caught up!</p>
                <p className="text-muted-foreground text-sm">No pending payment verifications at this time.</p>
              </div>
            ) : (
              pendingPayment.map(student => (
                <div key={student.id} className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Card Header */}
                  <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground">{student.fullName}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[student.status] || STATUS_BADGE.pending}`}>
                          {student.status === 'payment_review' ? 'PAYMENT REVIEW' : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.email} · {student.mobile}</p>
                    </div>
                    <button
                      onClick={() => toggleExpand(student.id)}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
                    >
                      {expanded[student.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Payment Summary (always visible) */}
                  <div className="px-5 pb-4 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-3 py-1.5 text-xs">
                      <CreditCard className="w-3.5 h-3.5 text-brand" />
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-semibold text-foreground">{PAYMENT_METHOD_LABELS[student.paymentMethod] || student.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-3 py-1.5 text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-brand" />
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-black text-foreground">$100.00</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-3 py-1.5 text-xs font-mono">
                      <span className="text-muted-foreground">Ref:</span>
                      <span className="font-semibold text-foreground">{student.paymentReference}</span>
                    </div>
                    {student.sponsorCode && (
                      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-xs">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-muted-foreground">Sponsor:</span>
                        <span className="font-semibold text-blue-700">{student.sponsorCode}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-3 py-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-brand" />
                      <span className="text-muted-foreground">Registered:</span>
                      <span className="font-semibold text-foreground">{new Date(student.registeredAt || '').toLocaleDateString('en-PH')}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded[student.id] && (
                    <div className="border-t border-border mx-5 pt-4 pb-4 space-y-4">
                      {/* Payment Proof Placeholder */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment Proof Screenshot</p>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
                          <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Payment screenshot uploaded by student</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            (Connect Supabase Storage to enable real payment proof uploads)
                          </p>
                          <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs">
                            <Eye className="w-3.5 h-3.5" /> View Proof
                          </Button>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Address</p>
                          <p className="text-foreground font-medium">{student.address}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Preferred Schedule</p>
                          <p className="text-foreground font-medium capitalize">{student.preferredSchedule}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Experience Level</p>
                          <p className="text-foreground font-medium capitalize">{student.experience}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Facebook / Messenger</p>
                          <p className="text-foreground font-medium text-xs break-all">{student.facebook || '—'}</p>
                        </div>
                      </div>

                      {/* Admin Note */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Admin Note (for approval)
                        </Label>
                        <Textarea
                          value={adminNotes[student.id] || ''}
                          onChange={e => setAdminNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                          placeholder="Add a note for this student (e.g. 'Payment verified via GCash screenshot...')"
                          className="resize-none text-sm border-border text-foreground placeholder:text-muted-foreground"
                          rows={2}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => approvePayment(student.id)}
                          disabled={processingId === student.id}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processingId === student.id ? 'Activating...' : 'Verify & Activate Portal'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowRejectForm(prev => ({ ...prev, [student.id]: !prev[student.id] }))}
                          className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject Payment
                        </Button>
                      </div>

                      {/* Reject Form */}
                      {showRejectForm[student.id] && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-bold text-red-700">Rejection Reason (required)</p>
                          <Textarea
                            value={rejectNotes[student.id] || ''}
                            onChange={e => setRejectNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                            placeholder="e.g. 'Payment reference not found. Please resubmit with correct details.'"
                            className="resize-none text-sm border-red-200 text-foreground bg-white"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => rejectPayment(student.id)}
                              disabled={processingId === student.id}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            >
                              {processingId === student.id ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowRejectForm(prev => ({ ...prev, [student.id]: false }))}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Action Bar (collapsed) */}
                  {!expanded[student.id] && (
                    <div className="border-t border-amber-100 px-5 py-3 flex items-center justify-between bg-amber-50/50">
                      <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Waiting for verification
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approvePayment(student.id)}
                          disabled={processingId === student.id}
                          className="bg-green-600 hover:bg-green-700 text-white gap-1 h-7 text-xs font-bold"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExpand(student.id)}
                          className="h-7 text-xs gap-1 border-border"
                        >
                          <Eye className="w-3 h-3" />
                          Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ACTIVE SUBSCRIBERS TAB */}
        {activeTab === 'active' && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Student</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Payment Method</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Reference</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Stage</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Approved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeStudents.map(s => (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground capitalize">
                        {PAYMENT_METHOD_LABELS[s.paymentMethod] || s.paymentMethod}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.paymentReference}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] || 'bg-green-100 text-green-700 border-green-200'}`}>
                          {s.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {s.approvedAt ? new Date(s.approvedAt).toLocaleDateString('en-PH') : '—'}
                      </td>
                    </tr>
                  ))}
                  {activeStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        No active subscribers yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Supabase Email Notifications Note */}
        <div className="bg-gradient-to-br from-navy to-navy-dark rounded-xl p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-1">Email Notifications — Requires Supabase Connection</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Once you connect your Supabase project, automatic email notifications will be sent to students for: payment verified, portal activated, course unlocked, challenge passed, and certificate issued — powered by Supabase Edge Functions + Resend API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
