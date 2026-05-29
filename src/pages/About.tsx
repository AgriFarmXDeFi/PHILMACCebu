import { Link } from 'react-router-dom';
import { Target, Eye, MapPin, Users, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">

        {/* ── Hero — dark bg ── */}
        <section className="bg-navy-dark py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-3">
              About Us
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl font-black mb-5">
              About <span style={{ color: 'hsl(18,90%,54%)' }}>PHILMAC Cebu</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.70)' }} className="text-lg leading-relaxed max-w-2xl mx-auto">
              Philippine Learning and Management Academy — a trading education academy focused on helping students understand forex trading, market analysis, risk management, discipline, and trading psychology.
            </p>
          </div>
        </section>

        {/* ── Mission & Vision — light bg, explicit dark text ── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

            {/* Mission — dark card */}
            <div
              className="rounded-2xl p-8"
              style={{ background: 'linear-gradient(135deg, hsl(218,72%,18%), hsl(218,72%,10%))' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <Target className="w-6 h-6" style={{ color: 'hsl(18,90%,54%)' }} />
              </div>
              <h2 style={{ color: '#ffffff' }} className="text-2xl font-black mb-4">Our Mission</h2>
              <p style={{ color: 'rgba(255,255,255,0.78)' }} className="leading-relaxed">
                To provide accessible, structured, and comprehensive forex trading education that empowers every Filipino to achieve financial independence through disciplined trading practice and continuous learning.
              </p>
            </div>

            {/* Vision — light card */}
            <div
              className="rounded-2xl p-8"
              style={{ background: '#ffffff', border: '2px solid rgba(234,88,12,0.20)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'hsl(18,90%,54%)' }}
              >
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black mb-4">Our Vision</h2>
              <p style={{ color: 'hsl(218,35%,38%)' }} className="leading-relaxed">
                To become the leading forex trading academy in Cebu and the Philippines, producing a generation of disciplined, knowledgeable, and profitable traders who contribute to the nation's financial literacy.
              </p>
            </div>
          </div>
        </section>

        {/* ── Academy Overview — light bg ── */}
        <section className="py-16 px-4" style={{ background: 'hsl(210,20%,97%)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-3">
                  The Academy
                </div>
                <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-3xl font-black mb-5">
                  More Than a Training Program
                </h2>
                <p style={{ color: 'hsl(218,35%,38%)' }} className="leading-relaxed mb-5">
                  PHILMAC Cebu is not just a trading course — it is a complete educational ecosystem. We combine structured curriculum with a referral-based community model that incentivizes students to learn, share, and grow together.
                </p>
                <p style={{ color: 'hsl(218,35%,38%)' }} className="leading-relaxed mb-6">
                  Our challenge-based certification system ensures that only traders who demonstrate real discipline, consistency, and skill receive the PHILMAC Cebu certificate and completion award.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[['500+', 'Students'], ['3', 'Core Courses'], ['$500', 'Award']].map(([val, lbl]) => (
                    <div key={lbl} className="text-center bg-white rounded-xl border p-4" style={{ borderColor: 'hsl(215,18%,85%)' }}>
                      <div style={{ color: 'hsl(18,90%,54%)' }} className="text-2xl font-black">{val}</div>
                      <div style={{ color: 'hsl(218,35%,42%)' }} className="text-xs mt-1">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: MapPin, title: 'Training Location', desc: 'Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000' },
                  { icon: Users, title: 'Community-Driven Learning', desc: 'Our referral system creates a supportive network of traders who help each other grow and succeed.' },
                  { icon: BookOpen, title: 'Structured Curriculum', desc: 'Three progressive course levels unlock based on your commitment and referral milestones.' },
                  { icon: Award, title: 'Challenge Certification', desc: 'Two 30-day challenges validate your skills before you receive the official PHILMAC Cebu certificate.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 bg-white rounded-xl p-4" style={{ border: '1px solid hsl(215,18%,85%)' }}>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(218,72%,12%)/10' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'hsl(218,72%,18%)' }} />
                    </div>
                    <div>
                      <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-1">{title}</h3>
                      <p style={{ color: 'hsl(218,35%,42%)' }} className="text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA — dark bg ── */}
        <section className="py-16 px-4 bg-navy-dark text-center">
          <div className="max-w-2xl mx-auto">
            <h2 style={{ color: '#ffffff' }} className="text-3xl font-black mb-4">
              Ready to Join PHILMAC Cebu?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.60)' }} className="mb-6">
              Start with a free workshop or register as a student today.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="brand-gradient text-white font-bold hover:opacity-90">
                <Link to="/register">Register Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/free-workshop">Join Free Workshop</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
