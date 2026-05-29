import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginStudent, loginAdmin } from '@/lib/auth';
import { toast } from 'sonner';
import philmacLogo from '@/assets/philmac-logo.png';

export default function Login() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (mode === 'admin') {
        const admin = loginAdmin(email, password);
        if (admin) {
          toast.success(`Welcome back, ${admin.name}!`);
          navigate('/admin/dashboard');
        } else {
          toast.error('Invalid admin credentials');
        }
      } else {
        const student = loginStudent(email, password);
        if (student) {
          toast.success(`Welcome back, ${student.fullName}!`);
          navigate('/student/dashboard');
        } else {
          toast.error('Student account not found. Please register first.');
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-2">
            <img src={philmacLogo} alt="PHILMAC Logo" className="w-16 h-16 object-contain rounded-full bg-white p-1.5 shadow-xl" />
            <div>
              <span className="font-black text-white text-xl tracking-wide">PHILMAC</span>
              <span className="text-brand font-black text-xl"> Cebu</span>
            </div>
          </Link>
          <p className="text-white/40 text-xs mt-1">Invest in Education, Build Traders Generation</p>
          <h1 className="text-xl font-bold text-white mt-4 mb-1">Welcome Back</h1>
          <p className="text-white/60 text-sm">Sign in to your portal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'student' ? 'brand-gradient text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setMode('admin')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${mode === 'admin' ? 'brand-gradient text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/80 text-sm">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={mode === 'admin' ? 'admin@philmaccebu.com' : 'your@email.com'}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-brand"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-sm">Password</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-brand pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'student' && (
              <div className="bg-brand/10 border border-brand/20 rounded-lg p-3 text-xs text-brand/80">
                <strong>Demo:</strong> Use email <span className="font-mono">maria@example.com</span> with any password (4+ chars).
              </div>
            )}
            {mode === 'admin' && (
              <div className="bg-brand/10 border border-brand/20 rounded-lg p-3 text-xs text-brand/80">
                <strong>Demo:</strong> Email: <span className="font-mono">admin@philmaccebu.com</span> / Password: <span className="font-mono">admin2026</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full brand-gradient text-white font-bold hover:opacity-90 h-11">
              {loading ? 'Signing in...' : `Sign In as ${mode === 'admin' ? 'Admin' : 'Student'}`}
            </Button>
          </form>

          <p className="text-center text-white/50 text-sm mt-4">
            No account yet?{' '}
            <Link to="/register" className="text-brand hover:text-brand/80 font-medium">Register here</Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-white/40 hover:text-white/70 text-xs">← Back to Website</Link>
        </p>
      </div>
    </div>
  );
}
