import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, ChevronRight, Star, Users, BookOpen, Trophy, Award, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
// heroBanner replaced by uploaded photo

const PROGRAMS = [
  { title: 'Free Forex Derivative Trading Workshop', icon: '🎓', tag: 'FREE', desc: 'Live sessions every Wednesday & Saturday. No cost, no commitment.' },
  { title: 'Basic Forex Trading Course', icon: '📘', tag: 'STARTER', desc: 'Forex basics, market structure, candlesticks, support & resistance.' },
  { title: 'Technical Analysis Training', icon: '📊', tag: 'LEVEL 2', desc: 'Chart patterns, indicators, entry/exit planning, trend confirmation.' },
  { title: 'Risk Management & Psychology', icon: '🧠', tag: 'LEVEL 2', desc: 'Protect your capital with structured risk frameworks and trading mindset.' },
  { title: 'Advanced Trading Mentorship', icon: '🚀', tag: 'LEVEL 3', desc: 'Strategy refinement, advanced planning, and challenge preparation.' },
  { title: '30-Day Training Challenge', icon: '🏆', tag: 'CHALLENGE', desc: 'Daily logs, journal entries, and performance evaluation over 30 days.' },
];

const STATS = [
  { value: '500+', label: 'Students Trained', icon: Users },
  { value: '12+', label: 'Training Modules', icon: BookOpen },
  { value: '30', label: 'Challenge Days', icon: Trophy },
  { value: '$500', label: 'Completion Award', icon: Award },
];

const STEPS = [
  { step: '01', title: 'Register Online', desc: 'Create your PHILMAC Cebu student account.' },
  { step: '02', title: 'Subscribe for $100', desc: 'Activate your training access and get your referral code.' },
  { step: '03', title: 'Start Basic Course', desc: 'Begin your structured forex education journey.' },
  { step: '04', title: 'Invite 3 Direct Students', desc: 'Unlock the next course when your 3 referrals subscribe.' },
  { step: '05', title: 'Complete 3x3 Requirement', desc: 'Your 3 directs each invite 3 paid students — unlock Final Course.' },
  { step: '06', title: 'Pass Both Challenges', desc: 'Complete 30-Day Training + Pro Firm Challenge.' },
  { step: '07', title: 'Earn Certificate + $500', desc: 'Receive your PHILMAC Cebu Certificate and Completion Award.' },
];

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  FREE:      { bg: '#dcfce7', color: '#15803d' },
  STARTER:   { bg: '#dbeafe', color: '#1d4ed8' },
  'LEVEL 2': { bg: '#ede9fe', color: '#7c3aed' },
  'LEVEL 3': { bg: '#fef3c7', color: '#b45309' },
  CHALLENGE: { bg: 'rgba(234,88,12,0.12)', color: '#9a3412' },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/philmac-hero.png" alt="PHILMAC Cebu" className="w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(5,12,35,0.93) 0%, rgba(8,18,50,0.82) 45%, rgba(8,18,50,0.60) 70%, rgba(5,12,35,0.40) 100%)' }} />
          {/* Extra darkening overlay */}
          <div className="absolute inset-0" style={{ background: 'rgba(4,9,28,0.30)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand/15 border border-brand/30 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-brand fill-[hsl(18,90%,54%)]" />
              <span style={{ color: 'hsl(18,90%,54%)' }} className="text-xs font-semibold tracking-wide">
                CEBU'S PREMIER FOREX ACADEMY
              </span>
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Learn Forex Trading with{' '}
              <span style={{ color: 'hsl(18,90%,54%)' }}>PHILMAC Cebu</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)' }} className="text-lg leading-relaxed mb-3 font-medium italic">
              "Invest in Education, Build Traders Generation"
            </p>
            <p style={{ color: 'rgba(255,255,255,0.60)' }} className="text-base leading-relaxed mb-8">
              Structured training, mentorship, and challenge-based learning for aspiring Filipino traders.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="brand-gradient text-white font-bold hover:opacity-90 shadow-xl">
                <Link to="/register">Register Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                <Link to="/free-workshop">Join Free Workshop</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <Link to="/login">Student Portal →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-navy-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div style={{ color: 'hsl(18,90%,54%)' }} className="text-2xl sm:text-3xl font-black">{value}</div>
                <div style={{ color: 'rgba(255,255,255,0.60)' }} className="text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE EVENT — Workshop + YouTube ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1.5px solid hsl(215,18%,80%)' }}>
            <div className="grid lg:grid-cols-2">
              {/* Left: Workshop Details — light background */}
              <div className="p-8 md:p-10 flex flex-col justify-center" style={{ background: '#ffffff' }}>
                <div
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-5 w-fit"
                  style={{ background: 'rgba(234,88,12,0.10)', border: '1px solid rgba(234,88,12,0.25)', color: 'hsl(18,76%,38%)' }}
                >
                  FREE EVENT
                </div>
                <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl sm:text-3xl font-black mb-3 leading-tight">
                  Free Forex Derivative<br />Trading Workshop
                </h2>
                <p style={{ color: 'hsl(218,35%,38%)' }} className="mb-6 leading-relaxed text-sm">
                  Join our live workshops and discover professional forex trading education — absolutely free. No experience required, all are welcome.
                </p>
                <div className="space-y-3 mb-7">
                  {[
                    { label: 'Every Wednesday', time: '6:00 PM' },
                    { label: 'Every Saturday',  time: '2:00 PM' },
                  ].map(({ label, time }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(234,88,12,0.10)' }}>
                        <Clock className="w-3.5 h-3.5" style={{ color: 'hsl(18,90%,48%)' }} />
                      </div>
                      <span style={{ color: 'hsl(218,35%,38%)' }} className="text-sm">
                        <strong style={{ color: 'hsl(218,72%,12%)' }}>{label}</strong> — {time}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(234,88,12,0.10)' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'hsl(18,90%,48%)' }} />
                    </div>
                    <span style={{ color: 'hsl(218,35%,45%)' }} className="text-sm leading-relaxed">
                      Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="brand-gradient text-white font-bold hover:opacity-90 flex-1">
                    <Link to="/free-workshop">Reserve My Seat</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 font-bold" style={{ borderColor: 'hsl(218,72%,22%)', color: 'hsl(218,72%,12%)' }}>
                    <Link to="/contact">Message Us Now</Link>
                  </Button>
                </div>
              </div>

              {/* Right: YouTube Embed */}
              <div className="relative min-h-[260px] lg:min-h-[380px]" style={{ background: 'hsl(218,72%,7%)' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                  title="PHILMAC Cebu Free Forex Derivative Trading Workshop"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute bottom-4 left-4 rounded-lg px-3 py-1.5 pointer-events-none z-10"
                  style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 fill-current" style={{ color: 'hsl(18,90%,54%)' }} />
                    <span style={{ color: '#ffffff' }} className="text-xs font-semibold">Workshop Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section className="py-16" style={{ background: 'hsl(210,20%,97%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-2">
              Training Programs
            </div>
            <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-3xl sm:text-4xl font-black mb-4">
              Structured Path to Trading Excellence
            </h2>
            <p style={{ color: 'hsl(218,35%,42%)' }} className="max-w-xl mx-auto">
              From beginner to pro — PHILMAC Cebu provides a complete curriculum with progressive course unlocking.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMS.map((prog, i) => {
              const tagStyle = TAG_STYLES[prog.tag] || { bg: '#f3f4f6', color: '#374151' };
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: i === 0 ? 'hsl(18,90%,54%)' : 'hsl(215,18%,85%)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{prog.icon}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: tagStyle.bg, color: tagStyle.color }}
                    >
                      {prog.tag}
                    </span>
                  </div>
                  <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold mb-2 leading-tight">
                    {prog.title}
                  </h3>
                  <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm leading-relaxed">
                    {prog.desc}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" style={{ borderColor: 'hsl(218,72%,18%)', color: 'hsl(218,72%,12%)' }}
              className="hover:bg-navy hover:text-white hover:border-navy">
              <Link to="/programs">View All Programs <ChevronRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── How It Works ── dark bg ── */}
      <section className="py-16 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-2">
              Student Journey
            </div>
            <h2 style={{ color: '#ffffff' }} className="text-3xl sm:text-4xl font-black mb-4">
              Your Path to Becoming a Certified Trader
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {STEPS.slice(0, 4).map((s) => (
              <div key={s.step} className="glass-card rounded-xl p-5">
                <div style={{ color: 'hsl(18,90%,54%)' }} className="text-3xl font-black mb-2">{s.step}</div>
                <h3 style={{ color: '#ffffff' }} className="font-bold mb-1.5">{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.60)' }} className="text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.slice(4).map((s) => (
              <div
                key={s.step}
                className="glass-card rounded-xl p-5"
                style={s.step === '07' ? { borderColor: 'hsl(18,90%,54%,0.4)' } : {}}
              >
                <div style={{ color: 'hsl(18,90%,54%)' }} className="text-3xl font-black mb-2">{s.step}</div>
                <h3
                  style={{ color: s.step === '07' ? 'hsl(18,90%,54%)' : '#ffffff' }}
                  className="font-bold mb-1.5"
                >
                  {s.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.60)' }} className="text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="brand-gradient text-white font-bold hover:opacity-90">
              <Link to="/register">Start Your Journey Today</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
