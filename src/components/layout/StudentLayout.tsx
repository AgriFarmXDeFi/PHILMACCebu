import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, TrendingUp, Award, Trophy, FileText, MessageCircle, LogOut, Menu, X, ChevronRight, UserCircle, BarChart2, CreditCard } from 'lucide-react';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import philmacLogo from '@/assets/philmac-logo.png';
import NotificationBell from '@/components/features/NotificationBell';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
  { label: 'My Subscription', icon: CreditCard, path: '/student/subscription' },
  { label: 'My Courses', icon: BookOpen, path: '/student/courses' },
  { label: 'Stage Progress', icon: BarChart2, path: '/student/stages' },
  { label: 'Referral Network', icon: Users, path: '/student/referrals' },
  { label: 'Training Challenge', icon: TrendingUp, path: '/student/challenge-training' },
  { label: 'Pro Firm Challenge', icon: Trophy, path: '/student/challenge-profirm' },
  { label: 'Certificates', icon: Award, path: '/student/certificates' },
  { label: 'Awards', icon: FileText, path: '/student/awards' },
  { label: 'Support', icon: MessageCircle, path: '/student/support' },
  { label: 'Profile', icon: UserCircle, path: '/student/profile' },
];

interface Props { children: React.ReactNode; }

export default function StudentLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { student, logout } = useStudentAuth();

  // Load profile photo from localStorage
  const photoPreview = student ? localStorage.getItem(`philmac_photo_${student.id}`) : null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <img src={philmacLogo} alt="PHILMAC" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" />
          <span className="font-black text-white text-sm">PHILMAC <span className="text-brand">Cebu</span></span>
        </Link>
      </div>
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center brand-gradient shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">
                {student?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'S'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{student?.fullName || 'Student'}</p>
            <p className="text-white/50 text-xs truncate">{student?.referralCode || 'PHIL-XXXXX'}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[hsl(220,20%,96%)] overflow-hidden">
      <aside className="hidden lg:flex w-60 flex-col bg-navy-dark shadow-xl shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-60 bg-navy-dark flex flex-col shadow-xl">
            <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
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
          <h1 className="text-sm font-semibold text-foreground lg:text-base">Student Portal</h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground">{student?.email}</span>
            {student && <NotificationBell studentId={student.id} />}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
