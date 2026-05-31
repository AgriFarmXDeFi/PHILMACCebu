import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, Search, X, CheckCircle, Clock, AlertCircle,
  Tag, User, Phone, Mail, Inbox, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';
import type { ContactMessage } from '@/types';

// ── Constants ────────────────────────────────────────────────────────────────
const TICKETS_KEY = 'philmac_support_tickets';
const CONTACT_KEY = 'philmac_contact_messages';

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

const CONTACT_STATUS_META = {
  new:        { label: 'New',        bg: '#dbeafe', color: '#1e40af' },
  contacted:  { label: 'Contacted',  bg: '#fef3c7', color: '#92400e' },
  converted:  { label: 'Converted',  bg: '#dcfce7', color: '#166534' },
};

// ── Types ────────────────────────────────────────────────────────────────────
interface TicketMessage { id: string; from: 'student' | 'admin'; text: string; sentAt: string; }
interface Ticket {
  id: string; studentId: string; studentName: string; category: string;
  subject: string; message: string; submittedAt: string;
  status: 'open' | 'in_progress' | 'resolved'; thread: TicketMessage[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadAllTickets(): Ticket[] {
  const s = localStorage.getItem(TICKETS_KEY);
  if (!s) return [];
  return (JSON.parse(s) as Ticket[]).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
function saveAllTickets(t: Ticket[]) { localStorage.setItem(TICKETS_KEY, JSON.stringify(t)); }

function loadContactMessages(): ContactMessage[] {
  const s = localStorage.getItem(CONTACT_KEY);
  if (!s) return [];
  return (JSON.parse(s) as ContactMessage[]).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
function saveContactMessages(msgs: ContactMessage[]) { localStorage.setItem(CONTACT_KEY, JSON.stringify(msgs)); }

// ── Component ────────────────────────────────────────────────────────────────
type MainTab = 'tickets' | 'inquiries';

export default function AdminMessages() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [mainTab, setMainTab] = useState<MainTab>('tickets');

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Contact inquiries state
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | ContactMessage['status']>('all');
  const [adminNote, setAdminNote] = useState('');

  const students = getStudentsStore();

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    setTickets(loadAllTickets());
    setContacts(loadContactMessages());
  }, [admin, loading, navigate]);

  if (loading || !admin) return null;

  const refreshTickets = () => {
    const all = loadAllTickets();
    setTickets(all);
    if (selectedTicket) {
      const updated = all.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  // ── Ticket handlers ──
  const filteredTickets = useMemo(() => {
    let list = [...tickets];
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory);
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      list = list.filter(t =>
        t.studentName.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, filterStatus, filterCategory, ticketSearch]);

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    const all = loadAllTickets();
    const updated = all.map(t => t.id === ticketId ? { ...t, status } : t);
    saveAllTickets(updated);
    refreshTickets();
    toast.success(`Ticket marked as ${status.replace(/_/g, ' ')}`);
  };

  const sendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    const all = loadAllTickets();
    const ticket = all.find(t => t.id === selectedTicket.id);
    if (!ticket) return;
    const newMsg: TicketMessage = { id: `msg-${Date.now()}`, from: 'admin', text: replyText, sentAt: new Date().toISOString() };
    ticket.thread = [...(ticket.thread || []), newMsg];
    ticket.status = 'in_progress';
    saveAllTickets(all);
    setReplyText('');
    refreshTickets();
    toast.success('Reply sent');
  };

  const getCategoryMeta = (val: string) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];
  const getStudentInfo = (id: string) => students.find(s => s.id === id);

  const statusCounts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  // ── Contact inquiry handlers ──
  const filteredContacts = useMemo(() => {
    let list = [...contacts];
    if (contactStatusFilter !== 'all') list = list.filter(c => c.status === contactStatusFilter);
    if (contactSearch.trim()) {
      const q = contactSearch.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, contactStatusFilter, contactSearch]);

  const updateContactStatus = (id: string, status: ContactMessage['status']) => {
    const all = loadContactMessages();
    const updated = all.map(c => c.id === id ? { ...c, status } : c);
    saveContactMessages(updated);
    setContacts(updated);
    if (selectedContact?.id === id) {
      const found = updated.find(c => c.id === id);
      if (found) setSelectedContact(found);
    }
    toast.success(`Inquiry marked as ${status}`);
  };

  const contactCounts = {
    all: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    converted: contacts.filter(c => c.status === 'converted').length,
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-foreground">Messages & Inquiries</h1>
          <p className="text-muted-foreground text-sm">
            Support tickets from students and contact inquiries from visitors.
          </p>
        </div>

        {/* Main Tab Bar */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'hsl(210,20%,94%)' }}>
          {[
            { key: 'tickets' as MainTab,   label: 'Support Tickets',    icon: HelpCircle, count: tickets.length },
            { key: 'inquiries' as MainTab, label: 'Contact Inquiries',  icon: Inbox,      count: contacts.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: mainTab === tab.key ? '#ffffff' : 'transparent',
                color: mainTab === tab.key ? 'hsl(218,72%,12%)' : 'hsl(218,35%,52%)',
                boxShadow: mainTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : undefined,
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: mainTab === tab.key ? 'hsl(218,72%,16%)' : 'hsl(215,18%,88%)',
                  color: mainTab === tab.key ? '#ffffff' : 'hsl(218,35%,52%)',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SUPPORT TICKETS TAB                                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {mainTab === 'tickets' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',       val: statusCounts.all,         bg: '#dbeafe', color: '#1e40af' },
                { label: 'Open',        val: statusCounts.open,        bg: '#fee2e2', color: '#991b1b' },
                { label: 'In Progress', val: statusCounts.in_progress, bg: '#fef3c7', color: '#92400e' },
                { label: 'Resolved',    val: statusCounts.resolved,    bg: '#dcfce7', color: '#166534' },
              ].map(({ label, val, bg, color }) => (
                <div key={label} className="bg-white border border-border rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color }}>{val}</p>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-5">
              {/* Ticket List */}
              <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '78vh' }}>
                <div className="p-4 border-b border-border space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={ticketSearch} onChange={e => setTicketSearch(e.target.value)} placeholder="Search tickets..." className="pl-8 text-xs" style={{ color: 'hsl(218,72%,12%)' }} />
                    {ticketSearch && <button onClick={() => setTicketSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                      <button key={f} onClick={() => setFilterStatus(f)} className="px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                        style={{ background: filterStatus === f ? 'hsl(218,72%,16%)' : 'hsl(210,20%,95%)', color: filterStatus === f ? '#ffffff' : 'hsl(218,35%,52%)' }}>
                        {f.replace(/_/g, ' ')} ({statusCounts[f]})
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="flex-1 text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'hsl(215,18%,85%)', color: 'hsl(218,72%,12%)', background: '#ffffff' }}>
                      <option value="all">All Categories</option>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-border">
                  {filteredTickets.length === 0 && (
                    <div className="text-center py-12"><MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} /><p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No tickets found</p></div>
                  )}
                  {filteredTickets.map(ticket => {
                    const sm = STATUS_META[ticket.status];
                    const StatusIcon = sm.icon;
                    const catMeta = getCategoryMeta(ticket.category);
                    const isSelected = selectedTicket?.id === ticket.id;
                    const lastMsg = (ticket.thread || [])[(ticket.thread || []).length - 1];
                    return (
                      <button key={ticket.id} className="w-full text-left p-4 transition-colors hover:bg-muted/20"
                        style={{ background: isSelected ? 'rgba(234,88,12,0.06)' : undefined }}
                        onClick={() => { setSelectedTicket(ticket); setReplyText(''); }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>
                            {ticket.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5"><span style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-xs truncate">{ticket.studentName}</span>
                              {ticket.status === 'open' && lastMsg?.from === 'student' && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#dc2626' }} />}
                            </div>
                            <p style={{ color: 'hsl(218,72%,14%)' }} className="text-xs font-medium truncate mt-0.5">{ticket.subject}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: sm.bg, color: sm.color }}>
                                <StatusIcon className="w-2.5 h-2.5" />{sm.label}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: catMeta.bg, color: catMeta.color }}>{catMeta.label}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Detail */}
              {selectedTicket ? (
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="bg-white border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base leading-tight">{selectedTicket.subject}</h2>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: STATUS_META[selectedTicket.status].bg, color: STATUS_META[selectedTicket.status].color }}>{STATUS_META[selectedTicket.status].label}</span>
                        </div>
                        <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{new Date(selectedTicket.submittedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {selectedTicket.status !== 'open' && <button onClick={() => updateTicketStatus(selectedTicket.id, 'open')} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>Reopen</button>}
                        {selectedTicket.status !== 'in_progress' && <button onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#fef3c7', color: '#92400e' }}>In Progress</button>}
                        {selectedTicket.status !== 'resolved' && <button onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#dcfce7', color: '#166534' }}>Resolve</button>}
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-border" style={{ background: 'hsl(210,20%,97.5%)' }}>
                        <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">Conversation</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '36vh', background: 'hsl(210,20%,97.5%)' }}>
                        {(selectedTicket.thread || []).map(msg => {
                          const isAdm = msg.from === 'admin';
                          return (
                            <div key={msg.id} className={`flex gap-2 ${isAdm ? 'justify-end' : 'justify-start'}`}>
                              {!isAdm && <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>{selectedTicket.studentName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</div>}
                              <div className="max-w-[80%] rounded-2xl px-4 py-2.5" style={{ background: isAdm ? 'linear-gradient(135deg, hsl(218,72%,20%), hsl(218,72%,14%))' : '#ffffff', border: isAdm ? 'none' : '1px solid hsl(215,18%,85%)', borderRadius: isAdm ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                                <p className="text-sm leading-relaxed" style={{ color: isAdm ? '#ffffff' : 'hsl(218,72%,12%)' }}>{msg.text}</p>
                                <p className="text-xs mt-1" style={{ color: isAdm ? 'rgba(255,255,255,0.50)' : 'hsl(218,35%,60%)', textAlign: isAdm ? 'right' : 'left' }}>
                                  {isAdm ? 'Admin' : selectedTicket.studentName.split(' ')[0]} · {new Date(msg.sentAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {isAdm && <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, hsl(18,90%,50%), hsl(18,80%,40%))' }}>A</div>}
                            </div>
                          );
                        })}
                      </div>
                      {selectedTicket.status !== 'resolved' ? (
                        <div className="p-4 border-t border-border bg-white">
                          <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your admin reply..." rows={3} style={{ color: 'hsl(218,72%,12%)', resize: 'none' }} className="placeholder:text-muted-foreground text-sm mb-2" onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendReply(); }} />
                          <div className="flex items-center justify-between gap-2">
                            <span style={{ color: 'hsl(218,35%,60%)' }} className="text-xs">Ctrl+Enter to send</span>
                            <Button onClick={sendReply} disabled={!replyText.trim()} className="gap-1.5 font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>
                              <Send className="w-3.5 h-3.5" /> Send Reply
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center gap-2 border-t border-border" style={{ background: '#f0fdf4' }}>
                          <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                          <p style={{ color: '#166534' }} className="text-sm font-semibold">Ticket resolved.</p>
                          <button onClick={() => updateTicketStatus(selectedTicket.id, 'open')} className="ml-auto text-xs font-semibold underline" style={{ color: '#1d4ed8' }}>Reopen</button>
                        </div>
                      )}
                    </div>

                    {/* Student info sidebar */}
                    <div className="space-y-3">
                      <div className="bg-white border border-border rounded-2xl p-4">
                        <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Student Info</p>
                        {(() => {
                          const info = getStudentInfo(selectedTicket.studentId);
                          return info ? (
                            <div className="space-y-2">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm mx-auto" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>
                                {info.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm text-center">{info.fullName}</p>
                              {[{ icon: Mail, val: info.email }, { icon: Phone, val: info.mobile }].map(({ icon: Icon, val }) => (
                                <div key={val} className="flex items-center gap-2"><Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(218,35%,55%)' }} /><span style={{ color: 'hsl(218,72%,14%)' }} className="text-xs truncate">{val}</span></div>
                              ))}
                              <div className="pt-2 mt-2 border-t border-border space-y-1.5">
                                {[['Code', info.referralCode], ['Status', info.status.replace(/_/g, ' ')], ['Refs', `${info.directReferrals.length}/3`]].map(([l, v]) => (
                                  <div key={l} className="flex justify-between gap-2 text-xs"><span style={{ color: 'hsl(218,35%,55%)' }}>{l}</span><span style={{ color: 'hsl(218,72%,12%)', fontWeight: 600 }} className="capitalize truncate max-w-[55%]">{v}</span></div>
                                ))}
                              </div>
                            </div>
                          ) : <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs text-center py-4">Student not found</p>;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20" style={{ borderColor: 'hsl(215,18%,82%)' }}>
                  <MessageSquare className="w-12 h-12 mb-3" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No Ticket Selected</p>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center max-w-xs">Select a ticket from the list to view the conversation.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CONTACT INQUIRIES TAB                                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {mainTab === 'inquiries' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',     val: contactCounts.all,       bg: '#dbeafe', color: '#1e40af' },
                { label: 'New',       val: contactCounts.new,       bg: '#fee2e2', color: '#991b1b' },
                { label: 'Contacted', val: contactCounts.contacted, bg: '#fef3c7', color: '#92400e' },
                { label: 'Converted', val: contactCounts.converted, bg: '#dcfce7', color: '#166534' },
              ].map(({ label, val, bg, color }) => (
                <div key={label} className="bg-white border border-border rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black" style={{ color }}>{val}</p>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-5">
              {/* Inquiry List */}
              <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '72vh' }}>
                <div className="p-4 border-b border-border space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search inquiries..." className="pl-8 text-xs" style={{ color: 'hsl(218,72%,12%)' }} />
                    {contactSearch && <button onClick={() => setContactSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(['all', 'new', 'contacted', 'converted'] as const).map(f => (
                      <button key={f} onClick={() => setContactStatusFilter(f)} className="px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                        style={{ background: contactStatusFilter === f ? 'hsl(218,72%,16%)' : 'hsl(210,20%,95%)', color: contactStatusFilter === f ? '#ffffff' : 'hsl(218,35%,52%)' }}>
                        {f} ({contactCounts[f]})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-border">
                  {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                      <Inbox className="w-10 h-10 mx-auto mb-2" style={{ color: 'hsl(218,35%,72%)' }} />
                      <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">No inquiries found</p>
                      {contacts.length === 0 && <p style={{ color: 'hsl(218,35%,60%)' }} className="text-xs mt-1 max-w-48 mx-auto">Contact form submissions from the public website will appear here.</p>}
                    </div>
                  )}
                  {filteredContacts.map(c => {
                    const sm = CONTACT_STATUS_META[c.status] || CONTACT_STATUS_META.new;
                    const isSelected = selectedContact?.id === c.id;
                    return (
                      <button key={c.id} className="w-full text-left p-4 transition-colors hover:bg-muted/20"
                        style={{ background: isSelected ? 'rgba(234,88,12,0.06)' : undefined }}
                        onClick={() => setSelectedContact(c)}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>
                            {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5"><span style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-xs">{c.name}</span></div>
                            <p style={{ color: 'hsl(218,72%,14%)' }} className="text-xs font-medium truncate mt-0.5">{c.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                              <span style={{ color: 'hsl(218,35%,60%)' }} className="text-xs">{new Date(c.submittedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inquiry Detail */}
              {selectedContact ? (
                <div className="lg:col-span-3 space-y-4">
                  {/* Header card */}
                  <div className="bg-white border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">{selectedContact.subject}</h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: CONTACT_STATUS_META[selectedContact.status]?.bg || '#dbeafe', color: CONTACT_STATUS_META[selectedContact.status]?.color || '#1e40af' }}>
                            {CONTACT_STATUS_META[selectedContact.status]?.label || selectedContact.status}
                          </span>
                          <span style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">
                            {new Date(selectedContact.submittedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap shrink-0">
                        {selectedContact.status !== 'contacted' && <button onClick={() => updateContactStatus(selectedContact.id, 'contacted')} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#fef3c7', color: '#92400e' }}>Mark Contacted</button>}
                        {selectedContact.status !== 'converted' && <button onClick={() => updateContactStatus(selectedContact.id, 'converted')} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#dcfce7', color: '#166534' }}>Mark Converted</button>}
                        {selectedContact.status !== 'new' && <button onClick={() => updateContactStatus(selectedContact.id, 'new')} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>Reset to New</button>}
                      </div>
                    </div>
                  </div>

                  {/* Message + Contact info */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 bg-white border border-border rounded-2xl p-5">
                      <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-3">Message</p>
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>

                      {/* Admin note */}
                      <div className="mt-5 pt-4 border-t border-border">
                        <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide mb-2">Admin Note</p>
                        <Textarea
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Add a private note about this inquiry..."
                          rows={2}
                          style={{ color: 'hsl(218,72%,12%)', resize: 'none' }}
                          className="placeholder:text-muted-foreground text-sm mb-2"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-semibold text-xs border-border"
                          style={{ color: 'hsl(218,72%,12%)' }}
                          onClick={() => { toast.success('Note saved (in-memory)'); }}
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
                      <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Sender Details
                      </p>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm mx-auto" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>
                        {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm text-center">{selectedContact.name}</p>
                      {[
                        { icon: Mail,  val: selectedContact.email },
                        { icon: Phone, val: selectedContact.mobile },
                      ].map(({ icon: Icon, val }) => (
                        <div key={val} className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(218,35%,55%)' }} />
                          <span style={{ color: 'hsl(218,72%,14%)' }} className="text-xs truncate">{val}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border">
                        <Button asChild size="sm" className="w-full gap-1.5 font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}>
                          <a href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject)}`}>
                            <Mail className="w-3.5 h-3.5" /> Reply via Email
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20" style={{ borderColor: 'hsl(215,18%,82%)' }}>
                  <Inbox className="w-12 h-12 mb-3" style={{ color: 'hsl(218,35%,72%)' }} />
                  <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-base mb-1">No Inquiry Selected</p>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center max-w-xs">Select an inquiry from the list to view details and manage its status.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
