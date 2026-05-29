import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Send, Plus, ChevronDown, ChevronUp, Clock,
  CheckCircle, AlertCircle, X, Paperclip, Phone, Mail, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const TICKETS_KEY = 'philmac_support_tickets';

const CATEGORIES = [
  { value: 'payment',     label: '💳 Payment Verification',    color: '#1d4ed8', bg: '#dbeafe' },
  { value: 'course',      label: '📘 Course Access Issue',      color: '#7c3aed', bg: '#ede9fe' },
  { value: 'referral',    label: '🔗 Referral / Network Issue', color: '#92400e', bg: '#fef3c7' },
  { value: 'challenge',   label: '🏆 Challenge Submission',     color: '#065f46', bg: '#d1fae5' },
  { value: 'certificate', label: '🎓 Certificate Request',      color: '#9a3412', bg: 'rgba(234,88,12,0.12)' },
  { value: 'award',       label: '🏅 Award Inquiry',            color: '#1e40af', bg: '#eff6ff' },
  { value: 'other',       label: '❓ Other',                    color: 'hsl(218,35%,45%)', bg: 'hsl(215,18%,92%)' },
];

const STATUS_META = {
  open:        { label: 'Open',        icon: AlertCircle, bg: '#fee2e2', color: '#991b1b' },
  in_progress: { label: 'In Progress', icon: Clock,       bg: '#fef3c7', color: '#92400e' },
  resolved:    { label: 'Resolved',    icon: CheckCircle, bg: '#dcfce7', color: '#166534' },
};

interface TicketMessage {
  id: string;
  from: 'student' | 'admin';
  text: string;
  sentAt: string;
}

interface Ticket {
  id: string;
  studentId: string;
  studentName: string;
  category: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'open' | 'in_progress' | 'resolved';
  thread: TicketMessage[];
}

function loadTickets(studentId: string): Ticket[] {
  const stored = localStorage.getItem(TICKETS_KEY);
  if (!stored) return [];
  const all: Ticket[] = JSON.parse(stored);
  return all.filter(t => t.studentId === studentId).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

function saveTicket(ticket: Ticket) {
  const stored = localStorage.getItem(TICKETS_KEY);
  const all: Ticket[] = stored ? JSON.parse(stored) : [];
  const idx = all.findIndex(t => t.id === ticket.id);
  if (idx >= 0) all[idx] = ticket;
  else all.push(ticket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(all));
}

// Mock admin auto-reply
function getMockAdminReply(category: string): string {
  const replies: Record<string, string> = {
    payment:     'Thank you for reaching out. We have received your payment inquiry and will verify your payment reference within 24 hours. Please ensure your GCash/bank reference number is correct.',
    course:      'Hi! We are looking into your course access issue. Please try logging out and logging back in. If the issue persists, we will manually unlock your course within 2 business days.',
    referral:    'Thanks for your message. We will review your referral network status and update you within 24 hours. Make sure your referrals have completed their subscriptions.',
    challenge:   'Your challenge submission inquiry has been noted. Our trainers will review your logs and provide feedback within 48 hours.',
    certificate: 'Thank you for your certificate request. We will verify all your requirements and issue your certificate within 3-5 business days.',
    award:       'We have received your award inquiry. Once all requirements are verified, we will process your $500 award within 5-7 business days.',
    other:       'Thank you for contacting PHILMAC Cebu support. We will get back to you within 24 hours. For urgent matters, please reach us on Facebook or Viber.',
  };
  return replies[category] || replies.other;
}

export default function StudentSupport() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ category: '', subject: '', message: '' });
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    if (!loading && !student) navigate('/login');
    if (student) setTickets(loadTickets(student.id));
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const filteredTickets = useMemo(() => {
    if (filterStatus === 'all') return tickets;
    return tickets.filter(t => t.status === filterStatus);
  }, [tickets, filterStatus]);

  const submitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    if (!form.subject.trim()) { toast.error('Subject is required'); return; }
    if (!form.message.trim()) { toast.error('Message is required'); return; }

    const newTicket: Ticket = {
      id: `TKT-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      category: form.category,
      subject: form.subject,
      message: form.message,
      submittedAt: new Date().toISOString(),
      status: 'open',
      thread: [
        {
          id: `msg-${Date.now()}-1`,
          from: 'student',
          text: form.message,
          sentAt: new Date().toISOString(),
        },
        // Mock admin auto-reply after 1 second delay
        {
          id: `msg-${Date.now()}-2`,
          from: 'admin',
          text: getMockAdminReply(form.category),
          sentAt: new Date(Date.now() + 2000).toISOString(),
        },
      ],
    };

    saveTicket(newTicket);
    const updated = loadTickets(student.id);
    setTickets(updated);
    setForm({ category: '', subject: '', message: '' });
    setShowForm(false);
    setExpandedTicket(newTicket.id);
    toast.success('Support ticket created! Check for admin reply below.');
    console.log('Ticket created:', newTicket);
  };

  const sendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const stored = localStorage.getItem(TICKETS_KEY);
    const all: Ticket[] = stored ? JSON.parse(stored) : [];
    const ticket = all.find(t => t.id === ticketId);
    if (!ticket) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      from: 'student',
      text: replyText,
      sentAt: new Date().toISOString(),
    };
    ticket.thread = [...(ticket.thread || []), newMsg];
    ticket.status = 'in_progress';
    saveTicket(ticket);
    setTickets(loadTickets(student.id));
    setReplyText('');
    toast.success('Reply sent');
  };

  const getCategoryMeta = (val: string) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <StudentLayout>
      <div className="max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Support</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Contact the PHILMAC Cebu admin team for help.</p>
          </div>
          <Button
            onClick={() => setShowForm(s => !s)}
            className="gap-2 font-bold text-white"
            style={{ background: showForm ? 'hsl(218,35%,40%)' : 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Ticket'}
          </Button>
        </div>

        {/* ── New Ticket Form ── */}
        {showForm && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ background: 'hsl(218,72%,14%)' }}
            >
              <MessageCircle className="w-4 h-4" style={{ color: 'hsl(18,90%,54%)' }} />
              <div>
                <p style={{ color: '#ffffff' }} className="font-bold text-sm">Create Support Ticket</p>
                <p style={{ color: 'rgba(255,255,255,0.50)' }} className="text-xs">As: {student.fullName} ({student.referralCode})</p>
              </div>
            </div>
            <form onSubmit={submitTicket} className="p-5 space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                  Category <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, category: cat.value }))}
                      className="text-left text-xs px-3 py-2.5 rounded-xl border transition-all font-medium"
                      style={{
                        borderColor: form.category === cat.value ? cat.color : 'hsl(215,18%,85%)',
                        background: form.category === cat.value ? cat.bg : '#ffffff',
                        color: form.category === cat.value ? cat.color : 'hsl(218,35%,48%)',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                  Subject <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                </Label>
                <Input
                  value={form.subject}
                  onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue..."
                  style={{ color: 'hsl(218,72%,12%)' }}
                  className="placeholder:text-muted-foreground"
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                  Message <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                </Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Explain your concern in detail — include any reference numbers, course names, or dates relevant to your inquiry..."
                  rows={4}
                  required
                  style={{ color: 'hsl(218,72%,12%)' }}
                  className="resize-none placeholder:text-muted-foreground"
                />
              </div>

              {/* Attachment Placeholder */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
                style={{ border: '1px dashed hsl(215,18%,78%)' }}
                onClick={() => toast.info('File attachments available after connecting Supabase Storage.')}
              >
                <Paperclip className="w-4 h-4" style={{ color: 'hsl(218,35%,55%)' }} />
                <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                  Attach screenshot or payment proof (requires Supabase Storage)
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  className="flex-1 gap-2 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                >
                  <Send className="w-4 h-4" /> Submit Ticket
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Ticket History ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-sm">
              My Tickets ({tickets.length})
            </p>
            {/* Status Filter */}
            <div className="flex gap-1">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    background: filterStatus === f ? 'hsl(218,72%,16%)' : 'hsl(210,20%,95%)',
                    color: filterStatus === f ? '#ffffff' : 'hsl(218,35%,52%)',
                  }}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredTickets.length === 0 && (
            <div
              className="rounded-2xl border-2 border-dashed py-12 text-center"
              style={{ borderColor: 'hsl(215,18%,82%)' }}
            >
              <MessageCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,70%)' }} />
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-1">
                {tickets.length === 0 ? 'No tickets yet' : 'No tickets in this category'}
              </p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                {tickets.length === 0 ? 'Click "New Ticket" to contact support.' : 'Try a different filter.'}
              </p>
            </div>
          )}

          {filteredTickets.map(ticket => {
            const statusMeta = STATUS_META[ticket.status];
            const StatusIcon = statusMeta.icon;
            const catMeta = getCategoryMeta(ticket.category);
            const isExpanded = expandedTicket === ticket.id;
            const thread = ticket.thread || [];
            const lastMsg = thread[thread.length - 1];

            return (
              <div
                key={ticket.id}
                className="bg-white border rounded-2xl overflow-hidden"
                style={{ borderColor: 'hsl(215,18%,82%)' }}
              >
                {/* Ticket Header */}
                <button
                  className="w-full text-left p-4 hover:bg-muted/10 transition-colors"
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                      style={{ background: catMeta.bg }}
                    >
                      {catMeta.label.split(' ')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm leading-tight">{ticket.subject}</p>
                          <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-0.5 capitalize">{catMeta.label.replace(/^.+? /, '')}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: statusMeta.bg, color: statusMeta.color }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusMeta.label}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />
                            : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'hsl(218,35%,55%)' }} />}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span style={{ color: 'hsl(218,35%,60%)' }} className="text-xs font-mono">{ticket.id}</span>
                        <span style={{ color: 'hsl(215,18%,70%)' }}>·</span>
                        <span style={{ color: 'hsl(218,35%,60%)' }} className="text-xs">
                          {new Date(ticket.submittedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {lastMsg?.from === 'admin' && (
                          <>
                            <span style={{ color: 'hsl(215,18%,70%)' }}>·</span>
                            <span className="text-xs font-semibold" style={{ color: '#1d4ed8' }}>Admin replied</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Chat Thread */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid hsl(215,18%,88%)' }}>
                    <div
                      className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto"
                      style={{ background: 'hsl(210,20%,97.5%)' }}
                    >
                      {thread.map(msg => {
                        const isStudent = msg.from === 'student';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${isStudent ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isStudent && (
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                                style={{ background: 'hsl(218,72%,18%)' }}
                              >
                                A
                              </div>
                            )}
                            <div
                              className="max-w-[80%] rounded-2xl px-4 py-2.5"
                              style={{
                                background: isStudent ? 'hsl(218,72%,18%)' : '#ffffff',
                                border: isStudent ? 'none' : '1px solid hsl(215,18%,85%)',
                                borderRadius: isStudent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              }}
                            >
                              <p
                                className="text-sm leading-relaxed"
                                style={{ color: isStudent ? '#ffffff' : 'hsl(218,72%,12%)' }}
                              >
                                {msg.text}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: isStudent ? 'rgba(255,255,255,0.50)' : 'hsl(218,35%,60%)', textAlign: isStudent ? 'right' : 'left' }}
                              >
                                {isStudent ? 'You' : 'PHILMAC Admin'} · {new Date(msg.sentAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {isStudent && (
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                                style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                              >
                                {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input */}
                    {ticket.status !== 'resolved' && (
                      <div className="p-4 flex gap-2 border-t border-border bg-white">
                        <Input
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type a reply..."
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="flex-1 placeholder:text-muted-foreground"
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(ticket.id); } }}
                        />
                        <Button
                          onClick={() => sendReply(ticket.id)}
                          disabled={!replyText.trim()}
                          className="gap-1.5 font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {ticket.status === 'resolved' && (
                      <div
                        className="p-4 flex items-center gap-2 border-t border-border"
                        style={{ background: '#f0fdf4' }}
                      >
                        <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                        <p style={{ color: '#166534' }} className="text-sm font-semibold">This ticket has been resolved.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Contact Info ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'hsl(218,72%,12%)', border: '1px solid hsl(218,72%,22%)' }}
        >
          <p style={{ color: '#ffffff' }} className="font-black text-sm mb-3">Other Ways to Reach Us</p>
          <div className="space-y-2.5">
            {[
              { icon: Phone,  label: 'Viber / Mobile',  val: '+63 917 123 4567' },
              { icon: Mail,   label: 'Email',            val: 'info@philmaccebu.com' },
              { icon: MapPin, label: 'Location',         val: 'USPF Building, Salinas Drive, Lahug, Cebu City' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" style={{ color: 'hsl(18,90%,54%)' }} />
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }} className="text-xs">{label}: </span>
                  <span style={{ color: '#ffffff' }} className="text-xs font-semibold">{val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
