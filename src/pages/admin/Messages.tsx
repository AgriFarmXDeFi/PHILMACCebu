import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { MOCK_CONTACT_MESSAGES } from '@/lib/mockData';
import type { ContactMessage } from '@/types';

export default function AdminMessages() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
    const stored = localStorage.getItem('philmac_messages');
    const formMsgs = stored ? JSON.parse(stored) : [];
    setMessages([...MOCK_CONTACT_MESSAGES, ...formMsgs]);
  }, [admin, loading, navigate]);

  const markContacted = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'contacted' } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'contacted' } : null);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-5">
        <div>
          <h1 className="text-xl font-black text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground text-sm">{messages.filter(m => m.status === 'new').length} new messages</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${selected?.id === msg.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelected(msg)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">{msg.name}</p>
                        {msg.status === 'new' && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message.slice(0, 60)}...</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${msg.status === 'new' ? 'bg-red-100 text-red-700' : msg.status === 'contacted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <div className="pb-4 border-b border-border">
                <h3 className="font-bold text-foreground">{selected.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">From: <strong>{selected.name}</strong></p>
                <p className="text-xs text-muted-foreground">{selected.email} · {selected.mobile}</p>
                <p className="text-xs text-muted-foreground">{new Date(selected.submittedAt).toLocaleString('en-PH')}</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed">{selected.message}</p>
              </div>
              {selected.status === 'new' && (
                <Button size="sm" onClick={() => markContacted(selected.id)} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="w-3.5 h-3.5" /> Mark as Contacted
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
