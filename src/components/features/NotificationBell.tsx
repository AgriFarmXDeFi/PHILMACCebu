import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, CreditCard, BookOpen, Trophy, Award, Megaphone, X, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: 'announcement' | 'payment' | 'course' | 'challenge' | 'certificate' | 'award';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const TYPE_CONFIG = {
  announcement: { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
  payment: { icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50 border-green-100' },
  course: { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
  challenge: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
  certificate: { icon: Award, color: 'text-brand', bg: 'bg-orange-50 border-orange-100' },
  award: { icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'payment',
    title: 'Payment Verified',
    message: 'Your $100 subscription payment has been verified. Your student portal is now fully active!',
    timestamp: '2026-05-28T10:30:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'course',
    title: 'Course Unlocked: Technical Analysis Training',
    message: 'Congratulations! You have completed 3 direct referrals. The Technical Analysis Training course is now unlocked.',
    timestamp: '2026-05-25T14:00:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'announcement',
    title: 'Workshop This Saturday',
    message: 'Our free forex workshop is happening this Saturday at 2:00 PM. Invite your friends to join!',
    timestamp: '2026-05-23T09:00:00Z',
    read: true,
  },
  {
    id: 'notif-4',
    type: 'challenge',
    title: 'Challenge Review Complete',
    message: 'Admin has reviewed your Day 15 trading log. Keep up the great work! Continue your daily submissions.',
    timestamp: '2026-05-20T16:00:00Z',
    read: true,
  },
  {
    id: 'notif-5',
    type: 'announcement',
    title: 'New Trading Tips Posted',
    message: 'Check your Basic Course — new supplemental materials on risk management have been added.',
    timestamp: '2026-05-18T11:00:00Z',
    read: true,
  },
];

const STORAGE_KEY = 'philmac_notifications';

function loadNotifications(studentId: string): Notification[] {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${studentId}`);
  if (stored) return JSON.parse(stored);
  return MOCK_NOTIFICATIONS;
}

function saveNotifications(studentId: string, notifications: Notification[]) {
  localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(notifications));
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Props {
  studentId: string;
}

export default function NotificationBell({ studentId }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(loadNotifications(studentId));
  }, [studentId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(studentId, updated);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(studentId, updated);
  };

  const dismiss = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveNotifications(studentId, updated);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-foreground" />
              <span className="font-bold text-foreground text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-brand font-semibold hover:underline px-2 py-1 rounded"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-muted/60 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const config = TYPE_CONFIG[notif.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    className={`relative px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${!notif.read ? 'bg-orange-50/40' : 'hover:bg-muted/20'}`}
                    onClick={() => markAsRead(notif.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className={`text-sm font-bold leading-tight ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-brand rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/70">{formatRelativeTime(notif.timestamp)}</p>
                      </div>
                    </div>
                    {/* Dismiss button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                      className="absolute top-3 right-3 p-0.5 rounded hover:bg-muted/60 text-muted-foreground/50 hover:text-muted-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Mark as read check */}
                    {!notif.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                        className="absolute bottom-3 right-3 p-0.5 rounded hover:bg-green-100 text-muted-foreground/50 hover:text-green-600"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-center">
            <p className="text-[10px] text-muted-foreground">
              Email notifications will be enabled once Supabase is connected
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
