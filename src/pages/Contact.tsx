import { useState } from 'react';
import { MapPin, Clock, Facebook, Mail, Phone, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import type { ContactMessage } from '@/types';

const CONTACT_MESSAGES_KEY = 'philmac_contact_messages';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const msg: ContactMessage = {
        id: `MSG-${Date.now()}`,
        ...form,
        submittedAt: new Date().toISOString(),
        status: 'new',
      };

      // Save to new key used by admin messages page
      const existing: ContactMessage[] = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify([...existing, msg]));

      // Also keep old key for backward compatibility
      const oldExisting = JSON.parse(localStorage.getItem('philmac_messages') || '[]');
      localStorage.setItem('philmac_messages', JSON.stringify([...oldExisting, msg]));

      console.log('Contact message saved:', msg);
      setSubmitted(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16">

        {/* Hero */}
        <section className="py-14 px-4 text-center" style={{ background: 'hsl(218,72%,10%)' }}>
          <div className="max-w-3xl mx-auto">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-xs font-bold tracking-widest uppercase mb-3">
              Get in Touch
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl font-black mb-3">Contact PHILMAC Cebu</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-base">
              Have questions? We are here to help you start your trading journey.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Contact Info */}
            <div>
              <h2 style={{ color: 'hsl(218,72%,12%)' }} className="text-2xl font-black mb-6">Our Information</h2>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    title: 'Training Location',
                    content: 'Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000',
                  },
                  {
                    icon: Clock,
                    title: 'Workshop Schedule',
                    content: 'Every Wednesday — 6:00 PM\nEvery Saturday — 2:00 PM',
                  },
                  {
                    icon: Facebook,
                    title: 'Facebook Page',
                    content: 'PHILMAC Cebu Official',
                  },
                  {
                    icon: Mail,
                    title: 'Email',
                    content: 'info@philmaccebu.com',
                  },
                  {
                    icon: Phone,
                    title: 'Mobile / Viber',
                    content: '+63 917 123 4567',
                  },
                ].map(({ icon: Icon, title, content }) => (
                  <div key={title} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(218,72%,10%)', border: '1px solid hsl(218,72%,20%)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'hsl(18,90%,54%)' }} />
                    </div>
                    <div>
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm mb-1">{title}</p>
                      <p style={{ color: 'hsl(218,35%,42%)' }} className="text-sm whitespace-pre-line">{content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div
                className="mt-7 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: 'hsl(210,20%,95%)', border: '1px solid hsl(215,18%,85%)', height: 160 }}
              >
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(218,35%,65%)' }} />
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm">
                    USPF Building, Salinas Drive, Lahug, Cebu City
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {submitted ? (
                <div
                  className="bg-white border border-border rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center"
                  style={{ minHeight: 360 }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'linear-gradient(135deg, hsl(218,72%,16%), hsl(218,72%,10%))' }}
                  >
                    <CheckCircle className="w-10 h-10" style={{ color: 'hsl(18,90%,54%)' }} />
                  </div>
                  <h3 style={{ color: 'hsl(218,72%,12%)' }} className="text-xl font-black mb-2">Message Sent!</h3>
                  <p style={{ color: 'hsl(218,35%,45%)' }} className="text-sm mb-5 max-w-xs">
                    Thank you for reaching out, <strong>{form.name}</strong>. Our team will contact you within 24 hours.
                  </p>
                  <Button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', mobile: '', subject: '', message: '' }); }}
                    variant="outline"
                    className="font-semibold"
                    style={{ borderColor: 'hsl(215,18%,80%)', color: 'hsl(218,72%,12%)' }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-5" style={{ background: 'hsl(218,72%,12%)' }}>
                    <h2 style={{ color: '#ffffff' }} className="text-xl font-black">Send Us a Message</h2>
                    <p style={{ color: 'rgba(255,255,255,0.50)' }} className="text-xs mt-0.5">
                      We will respond within 24 hours on business days.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                          Name <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                        </Label>
                        <Input
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="Your full name"
                          required
                          style={{ color: 'hsl(218,72%,12%)' }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                          Mobile <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                        </Label>
                        <Input
                          value={form.mobile}
                          onChange={e => setForm({ ...form, mobile: e.target.value })}
                          placeholder="09XX XXX XXXX"
                          required
                          style={{ color: 'hsl(218,72%,12%)' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                        Email <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        style={{ color: 'hsl(218,72%,12%)' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                        Subject <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                      </Label>
                      <Input
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="What is your inquiry about?"
                        required
                        style={{ color: 'hsl(218,72%,12%)' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                        Message <span style={{ color: 'hsl(18,90%,54%)' }}>*</span>
                      </Label>
                      <Textarea
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Type your message here..."
                        rows={4}
                        required
                        style={{ color: 'hsl(218,72%,12%)', resize: 'none' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                      className="w-full gap-2 font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                    >
                      <Send className="w-4 h-4" />
                      {isLoading ? 'Sending...' : 'Send Message'}
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
