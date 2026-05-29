import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import { toast } from 'sonner';

export default function FreeWorkshop() {
  const [reserved, setReserved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', schedule: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setReserved(true); setLoading(false); }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">

        {/* Hero — dark bg, white text via inline styles */}
        <section className="bg-navy-dark py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
            >
              100% FREE — NO COST
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl font-black mb-4">
              Free Forex Derivative Trading Workshop
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)' }} className="text-lg max-w-2xl mx-auto">
              Join our live educational sessions and discover the world of forex trading. No experience required — all are welcome.
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

            {/* Left column */}
            <div>
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black mb-6">
                Workshop Schedule
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  { day: 'Every Wednesday', time: '6:00 PM', spots: '20 seats available' },
                  { day: 'Every Saturday', time: '2:00 PM', spots: '25 seats available' }
                ].map(s => (
                  <div key={s.day} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-brand" />
                      <span style={{ color: 'hsl(218,72%,12%)' }} className="font-bold">{s.day}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'hsl(218,35%,42%)' }}>
                      <Clock className="w-4 h-4 text-brand" /> {s.time}
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: '#dcfce7', color: '#15803d' }}>
                      {s.spots}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-border rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Training Venue</p>
                    <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm mt-1">
                      Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  'Learn forex fundamentals from expert mentors',
                  'Live demo of a professional trading platform',
                  'Understand how to read forex charts',
                  'Ask questions in an interactive session',
                  'Discover how students earn with PHILMAC',
                  'No commitment — come and learn for free'
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'hsl(218,35%,42%)' }}>
                    <CheckCircle className="w-4 h-4 text-brand shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div>
              {reserved ? (
                <div className="bg-white border border-border rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#dcfce7' }}>
                    <CheckCircle className="w-8 h-8" style={{ color: '#16a34a' }} />
                  </div>
                  <h3 style={{ color: 'hsl(218,72%,12%)' }} className="text-xl font-black mb-3">Seat Reserved!</h3>
                  <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm mb-5">
                    Thank you, <strong style={{ color: 'hsl(218,72%,12%)' }}>{form.name}</strong>! Your seat for the free workshop has been reserved.
                    We will send you a confirmation message.
                  </p>
                  <Button asChild className="brand-gradient text-white font-bold w-full">
                    <Link to="/register">Register as a Student</Link>
                  </Button>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                  <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-xl font-black mb-1">
                    Reserve Your Free Seat
                  </h2>
                  <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm mb-5">
                    Fill out this form to confirm your attendance.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Full Name *</Label>
                      <Input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        required
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Email Address *</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Mobile Number *</Label>
                      <Input
                        value={form.mobile}
                        onChange={e => setForm({ ...form, mobile: e.target.value })}
                        placeholder="09XX XXX XXXX"
                        required
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Preferred Schedule *</Label>
                      <Select onValueChange={v => setForm({ ...form, schedule: v })} required>
                        <SelectTrigger style={{ color: 'hsl(218,72%,12%)' }}>
                          <SelectValue placeholder="Choose a schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wednesday">Wednesday 6:00 PM</SelectItem>
                          <SelectItem value="saturday">Saturday 2:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full brand-gradient text-white font-bold hover:opacity-90"
                    >
                      {loading ? 'Reserving...' : 'Reserve My Free Seat'}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
