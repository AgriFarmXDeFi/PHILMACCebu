import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, CreditCard, Network, BookOpen, TrendingUp, Award, Trophy, Image, MessageSquare, Settings, LogOut, Menu, X, ChevronRight, ShieldCheck, FileEdit } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import philmacLogo from '@/assets/philmac-logo.png';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Registrations', icon: ClipboardList, path: '/admin/registrations' },
  { label: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
  { label: 'Referral Network', icon: Network, path: '/admin/referrals' },
  { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
  { label: 'Challenges', icon: TrendingUp, path: '/admin/challenges' },
  { label: 'Certificates', icon: Award, path: '/admin/certificates' },
  { label: 'Awards', icon: Trophy, path: '/admin/awards' },
  { label: 'Gallery', icon: Image, path: '/admin/gallery' },
  { label: 'Website Content', icon: FileEdit, path: '/admin/content' },
  { label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

interface Props { children: React.ReactNode; }

export default function AdminLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <img src={philmacLogo} alt="PHILMAC" className="w-8 h-8 object-contain rounded-full bg-white p-0.5 shrink-0" />
          <div>
            <div className="font-black text-white text-sm leading-none">PHILMAC <span className="text-brand">Cebu</span></div>
            <div className="text-white/50 text-[10px] mt-0.5 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'brand-gradient text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="w-7 h-7 brand-gradient rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{admin?.name}</p>
            <p className="text-white/50 text-[10px] truncate">{admin?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[hsl(220,20%,96%)] overflow-hidden">
      <aside className="hidden lg:flex w-56 flex-col bg-navy-dark shadow-xl shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-56 bg-navy-dark flex flex-col shadow-xl">
            <button className="absolute top-4 right-3 text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
          <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-foreground lg:text-base">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{admin?.email}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
