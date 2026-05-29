import { Link } from 'react-router-dom';
import { Users, ChevronRight, Lock, Unlock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

export default function ReferralSystem() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">

        {/* Hero — dark bg, white text via inline styles */}
        <section className="bg-navy-dark py-14 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-3">
              Referral Program
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl font-black mb-4">
              The PHILMAC Referral System
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)' }} className="text-lg">
              Invite others to learn trading and unlock your next course levels.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 max-w-5xl mx-auto">

          {/* How it works */}
          <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black mb-6">
            How the Referral System Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {[
              { icon: '1️⃣', title: 'Get Your Referral Code', desc: 'After subscribing for $100, you receive a unique PHIL-XXXXXX referral code and link.' },
              { icon: '2️⃣', title: 'Share with 3 People', desc: 'Invite 3 friends, colleagues, or family members to register using your code and subscribe.' },
              { icon: '3️⃣', title: 'Unlock Next Course', desc: 'Once your 3 direct referrals have subscribed, your Next Course automatically unlocks.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-border rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold mb-2">{item.title}</h3>
                <p style={{ color: 'hsl(218,35%,40%)' }} className="text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 3x3 Requirement — dark bg, white text via inline styles */}
          <div
            className="rounded-2xl p-8 mb-12"
            style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,10%))' }}
          >
            <h2 style={{ color: '#ffffff' }} className="text-2xl font-black mb-4">
              The 3×3 Requirement — Unlocking the Final Course
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }} className="mb-6">
              To unlock the Final Course (Advanced Trading Mentorship), your 3 direct referrals must each also invite 3 paid students. This creates a 3×3 structure of 9 second-level students.
            </p>
            <div
              className="rounded-xl p-5 font-mono text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p style={{ color: 'hsl(18,90%,54%)' }} className="font-bold mb-2">
                You (Main Student)
              </p>
              <div className="ml-4 space-y-1" style={{ color: 'rgba(255,255,255,0.80)' }}>
                <p>├── Direct 1 → Invites: Student 1A, 1B, 1C ✅</p>
                <p>├── Direct 2 → Invites: Student 2A, 2B, 2C ✅</p>
                <p>└── Direct 3 → Invites: Student 3A, 3B, 3C ✅</p>
              </div>
              <p style={{ color: 'hsl(18,90%,54%)' }} className="mt-3 text-xs font-semibold">
                → Final Course Unlocked!
              </p>
            </div>
          </div>

          {/* Course Unlock Map */}
          <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black mb-6">
            Course Unlock Roadmap
          </h2>
          <div className="space-y-4 mb-12">
            {[
              { status: 'unlocked', title: 'Basic Course', req: 'Subscribe for $100', icon: Unlock, borderColor: '#bbf7d0', bgColor: '#f0fdf4' },
              { status: 'referral', title: 'Next Course (Technical Analysis)', req: '3 direct paid referrals required', icon: Users, borderColor: '#fde68a', bgColor: '#fffbeb' },
              { status: 'locked', title: 'Final Course (Advanced Mentorship)', req: '3×3 referral network required (9 second-level students)', icon: Lock, borderColor: '#bfdbfe', bgColor: '#eff6ff' },
              { status: 'challenge', title: '30-Day Training Challenge', req: 'Final Course must be completed', icon: Award, borderColor: '#e9d5ff', bgColor: '#faf5ff' },
              { status: 'award', title: 'Certificate + $500 Award', req: 'Both challenges passed + admin verification', icon: Award, borderColor: 'hsl(18,90%,70%)', bgColor: 'rgba(234,88,12,0.07)' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-xl border p-4"
                  style={{ borderColor: item.borderColor, background: item.bgColor }}
                >
                  <Icon className="w-5 h-5 shrink-0" style={{ color: 'hsl(218,35%,45%)' }} />
                  <div className="flex-1">
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                      {item.title}
                    </p>
                    <p style={{ color: 'hsl(218,35%,45%)' }} className="text-xs mt-0.5">
                      {item.req}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: 'hsl(218,35%,55%)' }} />
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="brand-gradient text-white font-bold hover:opacity-90">
              <Link to="/register">Register and Get Your Referral Code</Link>
            </Button>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
