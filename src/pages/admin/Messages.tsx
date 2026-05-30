import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, Search, X, ChevronDown, ChevronUp,
  CheckCircle, Clock, AlertCircle, Users, Filter, User,
  Phone, Mail, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';

const TICKETS_KEY = 'philmac_support_tickets';

const CATEGORIES = [
  { value: 'payment',     label: 'Payment',      color: '#1d4ed8', bg: '#dbeafe' },
  { value: 'course',      label: 'Course',        color: '#7c3aed', bg: '#ede9fe' },
  { value: 'referral',    label: 'Referral',      color: '#92400e', bg: '#fef3c7' },
  { value: 'challenge',   label: 'Challenge',     color: '#065f46', bg: '#d1fae5' },
  { value: 'certificate', label: 'Certificate',   color: '#9a3412', bg: 'rgba(234,88,12,0.12)' },
  { value: 'award',       label: 'Award',         color: '#1e40af', bg: '#eff6ff' },
  { value: 'other',       label: 'Other',         color: 'hsl(218,35%,45%)', bg: 'hsl(215,18%,92%)' },
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

function loadAllTickets(): Ticket[] {
  const stored = localStorage.getItem(TICKETS_KEY);
  if (!stored) return [];
  return (JSON.parse(stored) as Ticket[]).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

function saveAllTickets(tickets: Ticket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const students = getStudentsStore();

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setTickets(loadAllTickets());
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const refresh = () => {
    const all = loadAllTickets();
    setTickets(all);
    if (selected) {
      const updated = all.find(t => t.id === selected.id);
      if (updated) setSelected(updated);
    }
  };

  const filteredTickets = useMemo(() => {
    let list = [...tickets];
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.studentName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, filterStatus, filterCategory, search]);

  const updateStatus = (ticketId: string, newStatus: Ticket['status']) => {
    const all = loadAllTickets();
    const updated = all.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
    saveAllTickets(updated);
    refresh();
    toast.success(`Ticket marked as ${newStatus.replace(/_/g, ' ')}`);
  };

  const sendReply = () => {
    if (!selected || !replyText.trim()) return;
    const all = loadAllTickets();
    const ticket = all.find(t => t.id === selected.id);
    if (!ticket) return;
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      from: 'admin',
      text: replyText,
      sentAt: new Date().toISOString(),
    };
    ticket.thread = [...(ticket.thread || []), newMsg];
    ticket.status = 'in_progress';
    saveAllTickets(all);
    setReplyText('');
    refresh();
    toast.success('Reply sent');
  };

  const getCategoryMeta = (val: string) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];
  const getStudentInfo = (studentId: string) => students.find(s => s.id === studentId);

  const statusCounts = {
    all:         tickets.length,
    open:        tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved:    tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground text-sm">
            {statusCounts.open} open · {statusCounts.in_progress} in progress · {statusCounts.resolved} resolved
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Tickets',  val: statusCounts.all,         bg: '#dbeafe', color: '#1e40af' },
            { label: 'Open',           val: statusCounts.open,        bg: '#fee2e2', color: '#991b1b' },
            { label: 'In Progress',    val: statusCounts.in_progress, bg: '#fef3c7', color: '#92400e' },
            { label: 'Resolved',       val: statusCounts.resolved,    bg: '#dcfce7', color: '#166534' },
          ].map(({ label, val, bg, color }) => (
            <div key={label} className="bg-white border border-border rounded-2xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color }}>{val}</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">

          {/* ── Left: Ticket List ── */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '78vh' }}>
            {/* Filters */}
            <div className="p-4 border-b border-border space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="pl-8 text-xs"
                  style={{ color: 'hsl(218,72%,12%)' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 flex-wrap">
                {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className="px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={{
                      background: filterStatus === f ? 'hsl(218,72%,16%)' : 'hsl(210,20%,95%)',
                      color: filterStatus === f ? '#ffffff' : 'hsl(218,35%,52%)',
                    }}
                  >
                    {f.replace(/_/g, ' ')} ({statusCounts[f]})
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="flex-1 text-xs rounded-lg border px-2 py-1.5"
                  style={{ borderColor: 'hsl(215,18%,85%)', color: 'hsl(218,72%,12%)', background: '#ffffff' }}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ticket Items */}
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No tickets found</p>
                </div>
              )}
              {filteredTickets.map(ticket => {
                const statusMeta = STATUS_META[ticket.status];
                const StatusIcon = statusMeta.icon;
                const catMeta = getCategoryMeta(ticket.category);
                const lastMsg = (ticket.thread || [])[(ticket.thread || []).length - 1];
                const isSelected = selected?.id === ticket.id;
                const hasUnread = ticket.status === 'open' && lastMsg?.from === 'student';

                return (
                  <button
                    key={ticket.id}
                    className="w-full text-left p-4 transition-colors hover:bg-muted/20"
                    style={{ background: isSelected ? 'rgba(234,88,12,0.06)' : undefined }}
                    onClick={() => { setSelected(ticket); setReplyText(''); }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                      >
                        {ticket.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-xs truncate">{ticket.studentName}</span>
                          {hasUnread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#dc2626' }} />}
                        </div>
                        <p style={{ color: 'hsl(218,72%,14%)' }} className="text-xs font-medium truncate mt-0.5">{ticket.subject}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: statusMeta.bg, color: statusMeta.color }}
                          >
                            <StatusIcon className="w-2.5 h-2.5" />
                            {statusMeta.label}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: catMeta.bg, color: catMeta.color }}
                          >
                            {catMeta.label}
                          </span>
                        </div>
                        <p style={{ color: 'hsl(218,35%,60%)' }} className="text-xs mt-1">
                          {new Date(ticket.submittedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                          &nbsp;· {ticket.thread?.length || 1} message{(ticket.thread?.length || 1) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Ticket Detail ── */}
          {selected ? (
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Ticket Header */}
              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base leading-tight">{selected.subject}</h2>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: STATUS_META[selected.status].bg,
                          color: STATUS_META[selected.status].color,
                        }}
                      >
                        {STATUS_META[selected.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: 'hsl(218,35,55%)' }} className="text-xs font-mono text-muted-foreground">{selected.id}</span>
                      <span style={{ color: 'hsl(215,18%,70%)' }}>·</span>
                      <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs capitalize">
                        {getCategoryMeta(selected.category).label}
                      </span>
                      <span style={{ color: 'hsl(215,18%,70%)' }}>·</span>
                      <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                        {new Date(selected.submittedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {/* Status actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {selected.status !== 'open' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'open')}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: '#fee2e2', color: '#991b1b' }}
                      >
                        Reopen
                      </button>
                    )}
                    {selected.status !== 'in_progress' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'in_progress')}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: '#fef3c7', color: '#92400e' }}
                      >
                        In Progress
                      </button>
                    )}
                    {selected.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'resolved')}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: '#dcfce7', color: '#166534' }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Two-column: Thread + Student Details */}
              <div className="grid sm:grid-cols-3 gap-4">

                {/* Chat Thread */}
                <div className="sm:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col">
                  <div
                    className="px-4 py-3 border-b border-border flex items-center justify-between"
                    style={{ background: 'hsl(210,20%,97.5%)' }}
                  >
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Conversation</p>
                    <span style={{ color: 'hsl(218,35%,55%)' }} className="text-xs">
                      {selected.thread?.length || 0} messages
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '36vh', background: 'hsl(210,20%,97.5%)' }}>
                    {(selected.thread || []).map(msg => {
                      const isAdmin = msg.from === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isAdmin && (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                              style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                            >
                              {selected.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div
                            className="max-w-[80%] rounded-2xl px-4 py-2.5"
                            style={{
                              background: isAdmin ? 'linear-gradient(135deg, hsl(218,72%,20%), hsl(218,72%,14%))' : '#ffffff',
                              border: isAdmin ? 'none' : '1px solid hsl(215,18%,85%)',
                              borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            }}
                          >
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: isAdmin ? '#ffffff' : 'hsl(218,72%,12%)' }}
                            >
                              {msg.text}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{
                                color: isAdmin ? 'rgba(255,255,255,0.50)' : 'hsl(218,35%,60%)',
                                textAlign: isAdmin ? 'right' : 'left',
                              }}
                            >
                              {isAdmin ? 'Admin' : selected.studentName.split(' ')[0]} · {new Date(msg.sentAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {isAdmin && (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                              style={{ background: 'linear-gradient(135deg, hsl(18,90%,50%), hsl(18,80%,40%))' }}
                            >
                              A
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input */}
                  {selected.status !== 'resolved' ? (
                    <div className="p-4 border-t border-border bg-white">
                      <Textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your admin reply..."
                        rows={3}
                        style={{ color: 'hsl(218,72%,12%)', resize: 'none' }}
                        className="placeholder:text-muted-foreground text-sm mb-2"
                        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendReply(); }}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span style={{ color: 'hsl(218,35%,60%)' }} className="text-xs">Ctrl+Enter to send</span>
                        <Button
                          onClick={sendReply}
                          disabled={!replyText.trim()}
                          className="gap-1.5 font-bold text-white text-xs"
                          style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                        >
                          <Send className="w-3.5 h-3.5" /> Send Reply
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-4 flex items-center gap-2 border-t border-border"
                      style={{ background: '#f0fdf4' }}
                    >
                      <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                      <p style={{ color: '#166534' }} className="text-sm font-semibold">This ticket has been resolved.</p>
                      <button
                        onClick={() => updateStatus(selected.id, 'open')}
                        className="ml-auto text-xs font-semibold underline"
                        style={{ color: '#1d4ed8' }}
                      >
                        Reopen
                      </button>
                    </div>
                  )}
                </div>

                {/* Student Details Panel */}
                <div className="space-y-3">
                  <div className="bg-white border border-border rounded-2xl p-4">
                    <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Student Info
                    </p>
                    {(() => {
                      const info = getStudentInfo(selected.studentId);
                      return info ? (
                        <div className="space-y-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm mx-auto"
                            style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                          >
                            {info.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm text-center">{info.fullName}</p>
                          {[
                            { icon: Mail,  val: info.email },
                            { icon: Phone, val: info.mobile },
                          ].map(({ icon: Icon, val }) => (
                            <div key={val} className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(218,35%,55%)' }} />
                              <span style={{ color: 'hsl(218,72%,14%)' }} className="text-xs truncate">{val}</span>
                            </div>
                          ))}
                          <div className="pt-2 mt-2 border-t border-border space-y-1.5">
                            {[
                              ['Ref Code', info.referralCode],
                              ['Status', info.status.replace(/_/g, ' ')],
                              ['Refs', `${info.directReferrals.length}/3`],
                              ['Course', info.basicCourseStatus.replace(/_/g, ' ')],
                            ].map(([label, val]) => (
                              <div key={label} className="flex justify-between gap-2 text-xs">
                                <span style={{ color: 'hsl(218,35%,55%)' }}>{label}</span>
                                <span style={{ color: 'hsl(218,72%,12%)', fontWeight: 600 }} className="capitalize truncate max-w-[55%]">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs text-center py-4">
                          Student not found
                        </p>
                      );
                    })()}
                  </div>

                  {/* Category Badge */}
                  <div className="bg-white border border-border rounded-2xl p-4">
                    <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Category
                    </p>
                    <div
                      className="px-3 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: getCategoryMeta(selected.category).bg,
                        color: getCategoryMeta(selected.category).color,
                      }}
                    >
                      {getCategoryMeta(selected.category).label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="lg:col-span-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20"
              style={{ borderColor: 'hsl(215,18%,82%)' }}
            >
              <MessageSquare className="w-12 h-12 mb-3" style={{ color: 'hsl(218,35%,72%)' }} />
              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No Ticket Selected</p>
              <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center max-w-xs">
                Select a ticket from the list to view the conversation thread and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
