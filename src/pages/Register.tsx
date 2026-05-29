import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import { toast } from 'sonner';
import type { Registration } from '@/types';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', facebook: '',
    address: '', experience: '', preferredSchedule: '',
    sponsorCode: searchParams.get('ref') || '',
    paymentMethod: '', paymentReference: '',
    password: '', confirmPassword: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!agreed) { toast.error('Please agree to the terms and conditions'); return; }
    setLoading(true);
    setTimeout(() => {
      const reg: Registration = {
        id: `REG-${Date.now()}`,
        fullName: form.fullName, email: form.email, mobile: form.mobile,
        facebook: form.facebook, address: form.address, experience: form.experience,
        preferredSchedule: form.preferredSchedule, sponsorCode: form.sponsorCode,
        paymentMethod: form.paymentMethod, paymentReference: form.paymentReference,
        status: 'pending', submittedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('philmac_registrations') || '[]');
      localStorage.setItem('philmac_registrations', JSON.stringify([...existing, reg]));
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-4">Registration Submitted!</h1>
            <div className="bg-white border border-border rounded-xl p-6 text-left mb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thank you for registering with <strong>PHILMAC Cebu</strong>. Your registration has been received.<br /><br />
                Our admin team will verify your subscription payment within 24 hours. Once approved, your student portal access will be activated.<br /><br />
                You will be notified via your registered email and mobile number.
              </p>
            </div>
            <Button asChild className="brand-gradient text-white font-bold hover:opacity-90">
              <Link to="/login">Go to Student Login</Link>
            </Button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-brand/10 border border-brand/20 text-brand text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              $100 Training Subscription Required
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">Student Registration</h1>
            <p className="text-muted-foreground">Join PHILMAC Cebu and begin your forex trading journey</p>
            {form.sponsorCode && (
              <div className="inline-block mt-3 bg-brand/10 border border-brand/30 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                Referred by: {form.sponsorCode}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="text-sm font-bold text-foreground border-b border-border pb-2">Personal Information</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Juan dela Cruz" required />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number *</Label>
                <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="09XX XXX XXXX" required />
              </div>
              <div className="space-y-1.5">
                <Label>Facebook / Messenger Link</Label>
                <Input value={form.facebook} onChange={e => update('facebook', e.target.value)} placeholder="fb.com/yourprofile" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Complete Address *</Label>
              <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street, Barangay, City, Province" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Trading Experience</Label>
                <Select onValueChange={v => update('experience', v)}>
                  <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No experience</SelectItem>
                    <SelectItem value="beginner">Beginner (heard about forex)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (tried trading)</SelectItem>
                    <SelectItem value="advanced">Advanced (trading regularly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Workshop Schedule</Label>
                <Select onValueChange={v => update('preferredSchedule', v)}>
                  <SelectTrigger><SelectValue placeholder="Select schedule" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wednesday">Wednesday 6:00 PM</SelectItem>
                    <SelectItem value="saturday">Saturday 2:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm font-bold text-foreground border-b border-border pb-2 pt-2">Referral & Payment</div>
            <div className="space-y-1.5">
              <Label>Referral / Sponsor Code</Label>
              <Input value={form.sponsorCode} onChange={e => update('sponsorCode', e.target.value)} placeholder="PHIL-XXXXXX (optional)" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Payment Method *</Label>
                <Select onValueChange={v => update('paymentMethod', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash (in-person)</SelectItem>
                    <SelectItem value="maya">Maya / PayMaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Reference Number *</Label>
                <Input value={form.paymentReference} onChange={e => update('paymentReference', e.target.value)} placeholder="Transaction reference" required />
              </div>
            </div>
            <div className="bg-brand/8 border border-brand/20 rounded-lg p-3 flex items-start gap-3">
              <Upload className="w-4 h-4 text-brand mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-800">Subscription Amount: $100 USD</p>
                <p className="text-xs text-orange-700 mt-0.5">Upload your payment proof to our Facebook page or send via Messenger after registration. Admin will verify within 24 hours.</p>
              </div>
            </div>

            <div className="text-sm font-bold text-foreground border-b border-border pb-2 pt-2">Account Setup</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 6 characters" required />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password *</Label>
                <Input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter password" required />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox id="agree" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
              <Label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I agree to the PHILMAC Cebu Terms and Conditions, Privacy Policy, and confirm that all information provided is accurate.
              </Label>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full brand-gradient text-white font-bold hover:opacity-90">
              {loading ? 'Submitting Registration...' : 'Submit Registration'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="text-navy hover:text-brand font-semibold">Login here</Link>
            </p>
          </form>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
