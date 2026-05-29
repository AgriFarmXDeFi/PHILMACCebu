import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import philmacLogo from '@/assets/philmac-logo.png';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Programs', path: '/programs' },
  { label: 'Free Workshop', path: '/free-workshop' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'hsl(218, 72%, 9%)'
          : 'hsl(218, 72%, 9%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={philmacLogo}
              alt="PHILMAC Logo"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow"
            />
            <div className="leading-tight">
              <span className="font-black text-white text-base tracking-wide">PHILMAC</span>
              <span style={{ color: 'hsl(18, 90%, 54%)' }} className="font-black text-base"> Cebu</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 text-sm font-medium rounded-md transition-all"
                style={{
                  color: location.pathname === link.path
                    ? 'hsl(18, 90%, 54%)'
                    : 'rgba(255,255,255,0.85)',
                  background: location.pathname === link.path
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                }}
                onMouseEnter={e => {
                  if (location.pathname !== link.path) {
                    (e.currentTarget as HTMLElement).style.color = 'hsl(18, 90%, 54%)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (location.pathname !== link.path) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-medium rounded-md transition-all"
              style={{ color: 'rgba(255,255,255,0.75)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'hsl(18, 90%, 54%)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              Student Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold rounded-lg text-white transition-all hover:opacity-90 shadow-md"
              style={{ background: 'linear-gradient(135deg, hsl(18,90%,58%), hsl(14,88%,46%))' }}
            >
              Register Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md transition-colors"
            style={{ color: 'white' }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            className="lg:hidden pb-4 space-y-1 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm rounded-md font-medium transition-colors"
                style={{
                  color: location.pathname === link.path
                    ? 'hsl(18, 90%, 54%)'
                    : 'rgba(255,255,255,0.85)',
                  background: location.pathname === link.path
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2 px-1">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                Student Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-bold rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, hsl(18,90%,58%), hsl(14,88%,46%))' }}
              >
                Register Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
