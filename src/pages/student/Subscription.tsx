import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Clock, XCircle, AlertCircle, Upload, CreditCard,
  DollarSign, FileText, Calendar, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const MOCK_PAYMENT_HISTORY = [
  {
    id: 'PAY-001',
    date: '2026-04-15',
    amount: '$100.00',
    method: 'GCash',
    reference: 'GC-123456789',
    status: 'approved',
    adminNote: 'Payment verified. Subscription activated.',
  },
];

const STATUS_CONFIG = {
  approved: {
    label: 'Active Subscription',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  pending: {
    label: 'Payment Under Review',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  rejected: {
    label: 'Payment Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  not_submitted: {
    label: 'No Payment Submitted',
    icon: AlertCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
    border: 'border-border',
    badge: 'bg-muted text-muted-foreground',
  },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  gcash: 'GCash',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash Payment',
  maya: 'Maya (PayMaya)',
};

export default function StudentSubscription() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();
  const [showResubmit, setShowResubmit] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [resubmitForm, setResubmitForm] = useState({
    method: '',
    reference: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  // Determine subscription status from student data
  const getSubscriptionStatus = () => {
    if (student.status === 'pending') return 'not_submitted';
    if (student.status === 'payment_review') return 'pending';
    return 'approved';
  };

  const subscriptionStatus = getSubscriptionStatus();
  const statusCfg = STATUS_CONFIG[subscriptionStatus];
  const StatusIcon = statusCfg.icon;

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitForm.method || !resubmitForm.reference) {
      toast.error('Please fill in payment method and reference number.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Payment proof resubmitted! Admin will review within 24-48 hours.');
      setShowResubmit(false);
      setSubmitting(false);
    }, 1000);
  };

  const activationDate = student.approvedAt
    ? new Date(student.approvedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const registrationDate = student.registeredAt
    ? new Date(student.registeredAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <StudentLayout>
      <div className="max-w-3xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-black text-foreground">My Subscription</h1>
          <p className="text-muted-foreground text-sm mt-0.5">View your subscription status, payment details, and history.</p>
        </div>

        {/* Current Status Card */}
        <div className={`rounded-2xl border p-6 ${statusCfg.bg} ${statusCfg.border}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${subscriptionStatus === 'approved' ? 'bg-green-100' : subscriptionStatus === 'pending' ? 'bg-amber-100' : subscriptionStatus === 'rejected' ? 'bg-red-100' : 'bg-muted'}`}>
              <StatusIcon className={`w-6 h-6 ${statusCfg.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg font-black text-foreground">{statusCfg.label}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
                  {subscriptionStatus === 'approved' ? 'ACTIVE' : subscriptionStatus === 'pending' ? 'PENDING' : subscriptionStatus === 'rejected' ? 'REJECTED' : 'NOT SUBMITTED'}
                </span>
              </div>
              {subscriptionStatus === 'approved' && (
                <p className="text-sm text-foreground/70">
                  Your $100 training subscription is active. You have full access to the student portal.
                </p>
              )}
              {subscriptionStatus === 'pending' && (
                <p className="text-sm text-foreground/70">
                  Your payment is being reviewed by our admin team. This typically takes 24-48 hours.
                </p>
              )}
              {subscriptionStatus === 'rejected' && (
                <p className="text-sm text-foreground/70">
                  Your payment submission was not verified. Please resubmit with correct details.
                </p>
              )}
              {subscriptionStatus === 'not_submitted' && (
                <p className="text-sm text-foreground/70">
                  You have not yet submitted a payment. Subscribe for $100 to activate your training access.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand" />
              Subscription Details
            </h2>
          </div>
          <div className="divide-y divide-border">
            <DetailRow label="Student ID" value={student.id} />
            <DetailRow label="Full Name" value={student.fullName} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow label="Subscription Amount" value="$100.00 USD" highlight />
            <DetailRow label="Payment Method" value={PAYMENT_METHOD_LABELS[student.paymentMethod] || student.paymentMethod} />
            <DetailRow label="Payment Reference" value={student.paymentReference || '—'} mono />
            {registrationDate && <DetailRow label="Registered" value={registrationDate} />}
            {activationDate && <DetailRow label="Subscription Activated" value={activationDate} />}
            <DetailRow
              label="Portal Access"
              value={subscriptionStatus === 'approved' ? 'Full Access' : 'Restricted'}
              statusColor={subscriptionStatus === 'approved' ? 'text-green-600' : 'text-amber-600'}
            />
          </div>
        </div>

        {/* What's Included */}
        {subscriptionStatus === 'approved' && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand" />
              What Your $100 Subscription Includes
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Full Student Portal Access',
                'Basic Forex Trading Course',
                'Personal Referral Code & Link',
                'Referral Network Dashboard',
                'Course Progression Tracking',
                'Challenge Participation',
                'Certificate Eligibility',
                '$500 Completion Award Eligibility',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <button
            className="w-full px-5 py-4 flex items-center justify-between border-b border-border hover:bg-muted/20 transition-colors"
            onClick={() => setShowHistory(!showHistory)}
          >
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" />
              Payment History
            </h2>
            {showHistory
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showHistory && (
            <div>
              {MOCK_PAYMENT_HISTORY.length > 0 ? (
                <div className="divide-y divide-border">
                  {MOCK_PAYMENT_HISTORY.map(pay => (
                    <div key={pay.id} className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground text-sm">{pay.id}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pay.status === 'approved' ? 'bg-green-100 text-green-700' : pay.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                              {pay.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{pay.date}</span>
                            <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{pay.method}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{pay.amount}</span>
                          </div>
                        </div>
                        <span className="text-lg font-black text-green-600 shrink-0">{pay.amount}</span>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Reference</p>
                        <p className="font-mono text-sm text-foreground">{pay.reference}</p>
                      </div>
                      {pay.adminNote && (
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Admin Note</p>
                          <p className="text-sm text-foreground">{pay.adminNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No payment records found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resubmit Payment Section — show if rejected or not submitted */}
        {(subscriptionStatus === 'rejected' || subscriptionStatus === 'not_submitted') && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <button
              className="w-full px-5 py-4 flex items-center justify-between border-b border-border hover:bg-muted/20 transition-colors"
              onClick={() => setShowResubmit(!showResubmit)}
            >
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-brand" />
                {subscriptionStatus === 'rejected' ? 'Resubmit Payment Proof' : 'Submit Payment'}
              </h2>
              {showResubmit
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showResubmit && (
              <div className="p-5">
                {subscriptionStatus === 'rejected' && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-5">
                    <p className="text-sm text-red-700">
                      Your previous payment was rejected. Please ensure your payment details are correct before resubmitting.
                    </p>
                  </div>
                )}
                <form onSubmit={handleResubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-semibold">Payment Method *</Label>
                    <Select onValueChange={v => setResubmitForm({ ...resubmitForm, method: v })}>
                      <SelectTrigger className="border-border text-foreground">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="maya">Maya (PayMaya)</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-foreground font-semibold">Payment Reference Number *</Label>
                    <Input
                      value={resubmitForm.reference}
                      onChange={e => setResubmitForm({ ...resubmitForm, reference: e.target.value })}
                      placeholder="e.g. GC-123456789 or transaction ID"
                      className="border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-foreground font-semibold">Upload Payment Screenshot</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-brand/50 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload payment proof</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-foreground font-semibold">Additional Notes (optional)</Label>
                    <Textarea
                      value={resubmitForm.notes}
                      onChange={e => setResubmitForm({ ...resubmitForm, notes: e.target.value })}
                      placeholder="Any additional details about your payment..."
                      className="border-border text-foreground placeholder:text-muted-foreground resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full brand-gradient text-white font-bold hover:opacity-90 h-11"
                  >
                    {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-navy to-navy-dark rounded-xl p-5 text-white">
          <p className="font-bold text-white mb-1">Need Help with Your Payment?</p>
          <p className="text-white/60 text-sm mb-4">
            Contact our admin team for payment verification issues or subscription questions.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/25 text-white hover:bg-white/10"
            >
              <a href="/student/support">Message Admin</a>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => window.open('https://m.me/PHILMACCebuOfficial', '_blank')}
            >
              Message on Facebook
            </Button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  mono,
  statusColor,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
  statusColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={[
          'text-sm text-right',
          highlight ? 'font-black text-foreground text-base' : 'font-medium text-foreground',
          mono ? 'font-mono' : '',
          statusColor || '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
