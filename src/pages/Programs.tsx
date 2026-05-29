import { Link } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

const PROGRAMS = [
  {
    id: 'workshop', icon: '🎓', tag: 'FREE', tagBg: '#dcfce7', tagColor: '#15803d',
    title: 'Free Forex Derivative Trading Workshop', unlock: 'Open to all visitors',
    desc: 'Live educational sessions held every Wednesday and Saturday at our Cebu training center. Learn the basics of forex trading with no commitment required.',
    topics: ['What is Forex Trading', 'How Currency Markets Work', 'Live Demo of Trading Platform', 'Q&A with Mentors'],
    cta: '/free-workshop', ctaLabel: 'Reserve Free Seat',
    featured: true,
  },
  {
    id: 'basic', icon: '📘', tag: 'STARTER', tagBg: '#dbeafe', tagColor: '#1d4ed8',
    title: 'Basic Forex Trading Course', unlock: 'Requires $100 subscription',
    desc: 'Your first structured step into professional forex trading education. Learn the foundational concepts that every trader must know.',
    topics: ['Introduction to Forex Markets', 'Currency Pairs & Market Structure', 'Candlestick Chart Reading', 'Support & Resistance Basics', 'Risk Management Introduction', 'Trading Psychology Foundations'],
    cta: '/register', ctaLabel: 'Register to Access',
    featured: false,
  },
  {
    id: 'next', icon: '📊', tag: 'LEVEL 2', tagBg: '#ede9fe', tagColor: '#7c3aed',
    title: 'Technical Analysis Training', unlock: 'Requires 3 direct paid referrals',
    desc: 'Advance your trading skills with professional technical analysis. Learn to read markets like a professional trader.',
    topics: ['Advanced Chart Patterns', 'Indicators & Oscillators', 'Entry & Exit Planning', 'Trend Confirmation Methods', 'Trading Journal Setup', 'Risk-to-Reward Optimization'],
    cta: '/register', ctaLabel: 'Register to Unlock',
    featured: false,
  },
  {
    id: 'risk', icon: '🧠', tag: 'LEVEL 2', tagBg: '#ede9fe', tagColor: '#7c3aed',
    title: 'Risk Management & Trading Psychology', unlock: 'Included in Level 2 course bundle',
    desc: 'The most critical aspect of trading success. Learn to protect your capital and master your trading mindset.',
    topics: ['Position Sizing Rules', 'Stop Loss Strategies', 'Emotional Discipline', 'Dealing with Losses', 'Building a Trading Mindset', 'Journaling for Performance'],
    cta: '/register', ctaLabel: 'Register to Unlock',
    featured: false,
  },
  {
    id: 'final', icon: '🚀', tag: 'LEVEL 3', tagBg: '#fef3c7', tagColor: '#b45309',
    title: 'Advanced Trading Mentorship', unlock: 'Requires 3x3 referral network',
    desc: 'The final and most comprehensive course. Deep dive into advanced strategies, plan execution, and preparation for the trading challenges.',
    topics: ['Advanced Trading Strategy Development', 'Professional Risk Control', 'Building a Daily Trading Routine', 'Challenge Preparation Framework', 'Performance Review Methods', 'Final Mentorship Assessment'],
    cta: '/register', ctaLabel: 'Register to Unlock',
    featured: false,
  },
  {
    id: 'challenge1', icon: '🏆', tag: 'CHALLENGE', tagBg: 'rgba(234,88,12,0.12)', tagColor: '#9a3412',
    title: '30-Day Training Challenge', unlock: 'Requires Final Course completion',
    desc: 'Put your skills to the test with a structured 30-day challenge. Daily logs, journal entries, and admin verification.',
    topics: ['Daily Trading Logs', 'Screenshot Documentation', 'Risk Management Checklist', 'Trading Journal Entries', 'Market Analysis Notes', 'Final Admin Review'],
    cta: '/register', ctaLabel: 'Register to Participate',
    featured: false,
  },
  {
    id: 'challenge2', icon: '🎯', tag: 'PRO FIRM', tagBg: 'rgba(234,88,12,0.12)', tagColor: '#9a3412',
    title: '30-Day Pro Firm Challenge', unlock: 'Requires Training Challenge completion',
    desc: 'The final evaluation stage. Demonstrate professional-level trading discipline over 30 consecutive days.',
    topics: ['Professional Trading Evaluation', 'Daily Performance Reporting', 'Risk Monitoring', 'Trading Discipline Review', 'Final Performance Assessment', 'Certificate Qualification'],
    cta: '/register', ctaLabel: 'Register to Participate',
    featured: false,
  },
];

export default function Programs() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">

        {/* Hero — dark bg, white text via inline styles */}
        <section className="bg-navy-dark py-14 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-sm font-semibold tracking-wider uppercase mb-3">
              Training Programs
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl font-black mb-4">
              Complete Forex Trading Curriculum
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)' }} className="text-lg">
              7 progressive programs from beginner to certified professional trader.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="space-y-6">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                className="bg-white border rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all"
                style={{
                  borderColor: prog.featured ? 'hsl(18,90%,54%)' : 'hsl(215,18%,85%)',
                  boxShadow: prog.featured ? '0 0 0 1px hsl(18,90%,54%,0.2)' : undefined,
                }}
              >
                {prog.featured && (
                  <div className="mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(234,88,12,0.1)', color: 'hsl(18,90%,54%)' }}>
                      ⭐ FEATURED — 100% FREE
                    </span>
                  </div>
                )}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-4xl shrink-0">{prog.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: prog.tagBg, color: prog.tagColor }}
                          >
                            {prog.tag}
                          </span>
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'hsl(218,35%,52%)' }}>
                            <Lock className="w-3 h-3" /> {prog.unlock}
                          </div>
                        </div>
                        <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-lg sm:text-xl font-black">
                          {prog.title}
                        </h2>
                      </div>
                    </div>
                    <p style={{ color: 'hsl(218,35%,40%)' }} className="text-sm leading-relaxed mb-4">
                      {prog.desc}
                    </p>
                    <Button asChild size="sm" className="brand-gradient text-white font-semibold hover:opacity-90">
                      <Link to={prog.cta}>{prog.ctaLabel} <ArrowRight className="ml-1 w-3 h-3" /></Link>
                    </Button>
                  </div>

                  <div>
                    <p style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold uppercase tracking-wide mb-3">
                      Topics Covered
                    </p>
                    <ul className="space-y-1.5">
                      {prog.topics.map(topic => (
                        <li key={topic} className="flex items-start gap-2 text-sm" style={{ color: 'hsl(218,35%,40%)' }}>
                          <CheckCircle className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
