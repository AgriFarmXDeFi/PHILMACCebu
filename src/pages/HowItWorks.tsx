import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

const STEPS = [
  {
    step: '01', phase: 'Registration', color: '#2563eb',
    title: 'Register Online',
    desc: 'Create your PHILMAC Cebu student account by filling out the registration form. Provide your personal details, preferred workshop schedule, and sponsor code if you were referred.',
    detail: 'After submission, our admin team will review your registration within 24–48 hours.'
  },
  {
    step: '02', phase: 'Activation', color: '#7c3aed',
    title: 'Subscribe for $100',
    desc: 'Activate your training access by submitting your $100 subscription payment via GCash, bank transfer, or cash. Upload your payment proof.',
    detail: 'Once payment is verified, your student portal is activated and you receive your unique referral code.'
  },
  {
    step: '03', phase: 'Learning', color: '#16a34a',
    title: 'Start Basic Course',
    desc: 'Begin your forex education journey with the Basic Forex Trading Course. Learn fundamentals, market structure, candlestick basics, and trading psychology.',
    detail: 'Complete all lessons and pass the assessment to unlock the next requirement.'
  },
  {
    step: '04', phase: 'Referral', color: '#d97706',
    title: 'Invite 3 Direct Students',
    desc: 'Share your unique referral code or link with friends, family, or contacts. When 3 of them subscribe for $100 each, you unlock the next course level.',
    detail: 'Referral link format: philmaccebu.com/register?ref=PHIL-XXXXXX'
  },
  {
    step: '05', phase: 'Growth', color: '#ea580c',
    title: 'Complete 3x3 Requirement',
    desc: 'Each of your 3 direct referrals must also invite 3 paid students. Once all 9 second-level students are verified, you unlock the Final Course.',
    detail: 'Your referral dashboard tracks all progress in real-time.'
  },
  {
    step: '06', phase: 'Mastery', color: '#dc2626',
    title: 'Complete Final Course',
    desc: 'Access the Advanced Trading Mentorship — the most comprehensive course. Prepare for the challenge evaluation stages.',
    detail: 'Complete all lessons and the final assessment before proceeding.'
  },
  {
    step: '07', phase: 'Challenge', color: '#0891b2',
    title: 'Pass 30-Day Training Challenge',
    desc: 'Submit daily trading logs, journal entries, screenshots, and risk management checklists for 30 consecutive days. Admin reviews each submission.',
    detail: 'All 30 days must be submitted and approved to advance.'
  },
  {
    step: '08', phase: 'Pro Firm', color: '#0f172a',
    title: 'Pass 30-Day Pro Firm Challenge',
    desc: 'Complete the final evaluation stage — 30 days of professional trading performance review, discipline checklist, and daily reporting.',
    detail: 'This is the final gate before certification.'
  },
  {
    step: '09', phase: 'Certification', color: 'hsl(18,90%,54%)',
    title: 'Receive Certificate + $500 Award',
    desc: 'Qualified students receive the official PHILMAC Cebu Training Certificate and a $500 Course Completion Award after admin verification of all requirements.',
    detail: 'Certificate is downloadable from the student portal after issuance.'
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">

        {/* Hero — dark bg, white text via inline styles */}
        <section className="bg-navy-dark py-14 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-3">
              Student Journey
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl font-black mb-4">
              How It Works
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)' }} className="text-lg">
              From registration to certification — 9 steps to becoming a PHILMAC Cebu Certified Trader.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical timeline connector */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

            <div className="space-y-8">
              {STEPS.map((s, i) => (
                <div key={s.step} className="relative flex gap-6">
                  {/* Step circle */}
                  <div
                    className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ background: s.color }}
                  >
                    <span style={{ color: '#ffffff' }} className="font-black text-sm">{s.step}</span>
                  </div>

                  {/* Card — white bg, dark text */}
                  <div className="flex-1 bg-white border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold uppercase tracking-wide">
                        {s.phase}
                      </span>
                      {i === STEPS.length - 1 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(217,119,6,0.12)', color: '#92400e' }}>
                          GOAL
                        </span>
                      )}
                    </div>
                    <h3 style={{ color: 'hsl(218,72%,12%)' }} className="text-lg font-bold mb-2">{s.title}</h3>
                    <p style={{ color: 'hsl(218,35%,40%)' }} className="text-sm leading-relaxed mb-2">{s.desc}</p>
                    <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs italic">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA block — dark bg, white text via inline styles */}
          <div className="mt-12 rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,10%))' }}>
            <h2 style={{ color: '#ffffff' }} className="text-2xl font-black mb-3">
              Ready to Start Your Journey?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.68)' }} className="mb-5 text-sm">
              Register today and take the first step toward becoming a certified forex trader.
            </p>
            <Button asChild size="lg" className="brand-gradient text-white font-bold hover:opacity-90">
              <Link to="/register">Register Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
