import { useState } from 'react';
import { MapPin, Clock, Facebook, Mail, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import type { ContactMessage } from '@/types';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const msg: ContactMessage = {
        id: `MSG-${Date.now()}`, ...form,
        submittedAt: new Date().toISOString(), status: 'new',
      };
      const existing = JSON.parse(localStorage.getItem('philmac_messages') || '[]');
      localStorage.setItem('philmac_messages', JSON.stringify([...existing, msg]));
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">
        <section className="bg-navy-dark py-14 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-brand text-sm font-semibold tracking-wider uppercase mb-3">Get in Touch</div>
            <h1 className="text-4xl font-black text-white mb-3">Contact PHILMAC Cebu</h1>
            <p className="text-white/70">Have questions? We are here to help you start your trading journey.</p>
          </div>
        </section>

        <section className="py-16 px-4 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-black text-foreground mb-6">Our Information</h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Training Location</p>
                    <p className="text-muted-foreground text-sm">Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Workshop Schedule</p>
                    <p className="text-muted-foreground text-sm">Every Wednesday — 6:00 PM</p>
                    <p className="text-muted-foreground text-sm">Every Saturday — 2:00 PM</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                    <Facebook className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Facebook Page</p>
                    <p className="text-muted-foreground text-sm">PHILMAC Cebu Official</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Email</p>
                    <p className="text-muted-foreground text-sm">info@philmaccebu.com</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Mobile / Viber</p>
                    <p className="text-muted-foreground text-sm">+63 917 123 4567</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {submitted ? (
                <div className="bg-white border border-border rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-black text-foreground mb-4">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Name *</Label>
                        <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Mobile *</Label>
                        <Input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="09XX XXX XXXX" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subject *</Label>
                      <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="What is your inquiry about?" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Message *</Label>
                      <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Type your message here..." rows={4} required />
                    </div>
                    <Button type="submit" disabled={loading} size="lg" className="w-full brand-gradient text-white font-bold hover:opacity-90">
                      {loading ? 'Sending...' : 'Send Message'}
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
