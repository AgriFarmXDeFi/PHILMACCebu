import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Trash2,
  Home, Calendar, Phone, Megaphone, HelpCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const STORAGE_KEY = 'philmac_site_content';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  active: boolean;
  createdAt: string;
}

interface SiteContent {
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroTagline: string;
  workshopWednesdayTime: string;
  workshopSaturdayTime: string;
  workshopLocation: string;
  contactEmail: string;
  contactPhone1: string;
  contactPhone2: string;
  contactFacebook: string;
  contactAddress: string;
  announcements: Announcement[];
  faqs: FAQ[];
}

const DEFAULT_CONTENT: SiteContent = {
  heroBadge: "CEBU'S PREMIER FOREX ACADEMY",
  heroHeading: 'Learn Forex Trading with PHILMAC Cebu',
  heroSubheading: '"Invest in Education, Build Traders Generation"',
  heroTagline: 'Structured training, mentorship, and challenge-based learning for aspiring Filipino traders.',
  workshopWednesdayTime: '6:00 PM',
  workshopSaturdayTime: '2:00 PM',
  workshopLocation: 'Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000',
  contactEmail: 'philmaccebu2022@gmail.com',
  contactPhone1: '0961 963 3844',
  contactPhone2: '0995 576 2738',
  contactFacebook: 'PHILMAC Cebu Official',
  contactAddress: 'Upper Ground Floor, USPF Building, Salinas Drive, Lahug, Cebu City, Philippines 6000',
  announcements: [
    {
      id: 'ann-1',
      title: 'Free Workshop This Saturday',
      body: 'Join us for a free forex trading workshop every Saturday at 2:00 PM. All are welcome — no prior experience needed.',
      active: true,
      createdAt: new Date().toISOString(),
    }
  ],
  faqs: [
    { id: 'faq-1', question: 'How much does the training cost?', answer: 'The subscription fee is $100 USD. This covers full student portal access, all course materials, and eligibility for the $500 completion award.' },
    { id: 'faq-2', question: 'What is the referral requirement?', answer: 'To unlock the Next Course, you need 3 direct paid referrals. To unlock the Final Course, your 3 directs must each also have 3 paid referrals (3×3 structure).' },
    { id: 'faq-3', question: 'What is the $500 completion award?', answer: 'After completing all courses and passing both 30-day challenges, admin reviews your account. If all requirements are met, you receive a PHILMAC Cebu Certificate and $500 completion award.' },
    { id: 'faq-4', question: 'How long does the training take?', answer: 'There is no fixed duration. Progress depends on your pace and when you complete the referral and challenge requirements.' },
  ],
};

function loadContent(): SiteContent {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return { ...DEFAULT_CONTENT, ...JSON.parse(stored) };
  return DEFAULT_CONTENT;
}

function saveContent(content: SiteContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

type Section = 'hero' | 'workshop' | 'contact' | 'announcements' | 'faq';

const SECTIONS: Array<{ id: Section; label: string; icon: React.ElementType; color: string }> = [
  { id: 'hero',          label: 'Homepage Banner',     icon: Home,        color: '#2563eb' },
  { id: 'workshop',      label: 'Workshop Schedule',   icon: Calendar,    color: '#16a34a' },
  { id: 'contact',       label: 'Contact Details',     icon: Phone,       color: '#7c3aed' },
  { id: 'announcements', label: 'Announcements',       icon: Megaphone,   color: '#ea580c' },
  { id: 'faq',           label: 'FAQ Section',         icon: HelpCircle,  color: '#0891b2' },
];

export default function AdminContent() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [content, setContent] = useState<SiteContent>(loadContent());
  const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
    hero: true, workshop: false, contact: false, announcements: false, faq: false,
  });
  const [unsaved, setUnsaved] = useState<Record<Section, boolean>>({
    hero: false, workshop: false, contact: false, announcements: false, faq: false,
  });
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
  }, [admin, loading, navigate]);

  const update = useCallback((section: Section, field: keyof SiteContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
    setUnsaved(prev => ({ ...prev, [section]: true }));
  }, []);

  const saveSection = (section: Section) => {
    saveContent(content);
    setUnsaved(prev => ({ ...prev, [section]: false }));
    toast.success(`${SECTIONS.find(s => s.id === section)?.label} saved successfully`);
  };

  const resetToDefaults = () => {
    setContent(DEFAULT_CONTENT);
    saveContent(DEFAULT_CONTENT);
    toast.success('Content reset to defaults');
  };

  const toggleSection = (id: Section) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Announcements helpers
  const addAnnouncement = () => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: '',
      body: '',
      active: true,
      createdAt: new Date().toISOString(),
    };
    setContent(prev => ({ ...prev, announcements: [newAnn, ...prev.announcements] }));
    setUnsaved(prev => ({ ...prev, announcements: true }));
  };

  const updateAnnouncement = (id: string, field: keyof Announcement, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
    setUnsaved(prev => ({ ...prev, announcements: true }));
  };

  const deleteAnnouncement = (id: string) => {
    setContent(prev => ({ ...prev, announcements: prev.announcements.filter(a => a.id !== id) }));
    setUnsaved(prev => ({ ...prev, announcements: true }));
  };

  // FAQ helpers
  const addFaq = () => {
    const newFaq: FAQ = { id: `faq-${Date.now()}`, question: '', answer: '' };
    setContent(prev => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
    setUnsaved(prev => ({ ...prev, faq: true }));
  };

  const updateFaq = (id: string, field: keyof FAQ, value: string) => {
    setContent(prev => ({
      ...prev,
      faqs: prev.faqs.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
    setUnsaved(prev => ({ ...prev, faq: true }));
  };

  const deleteFaq = (id: string) => {
    setContent(prev => ({ ...prev, faqs: prev.faqs.filter(f => f.id !== id) }));
    setUnsaved(prev => ({ ...prev, faq: true }));
  };

  if (loading || !admin) return null;

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-foreground">Website Content</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Edit homepage text, workshop schedule, contact details, announcements, and FAQ.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(!preview)}
              className="gap-1.5 border-border text-foreground"
            >
              {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {preview ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" /> Reset Defaults
            </Button>
          </div>
        </div>

        {/* Live Preview Banner */}
        {preview && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(218,72%,10%), hsl(218,72%,6%))' }}
          >
            <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p style={{ color: 'hsl(18,90%,54%)' }} className="text-xs font-bold uppercase tracking-widest">
                Live Preview — Homepage Hero Section
              </p>
            </div>
            <div className="p-8 text-center">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold"
                style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.3)', color: 'hsl(18,90%,62%)' }}
              >
                ⭐ {content.heroBadge}
              </div>
              <h1 style={{ color: '#ffffff', fontSize: 26, fontWeight: 900 }} className="mb-3 leading-tight">
                {content.heroHeading}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }} className="text-sm mb-2">
                {content.heroSubheading}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs">
                {content.heroTagline}
              </p>
            </div>
          </div>
        )}

        {/* Content Sections */}
        {SECTIONS.map(section => (
          <div
            key={section.id}
            className="bg-white border border-border rounded-2xl overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${section.color}18` }}
                >
                  <section.icon style={{ width: 16, height: 16, color: section.color }} />
                </div>
                <span style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">
                  {section.label}
                </span>
                {unsaved[section.id] && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#fef3c7', color: '#92400e' }}
                  >
                    Unsaved changes
                  </span>
                )}
              </div>
              {openSections[section.id]
                ? <ChevronUp style={{ width: 16, height: 16, color: 'hsl(218,35%,55%)' }} />
                : <ChevronDown style={{ width: 16, height: 16, color: 'hsl(218,35%,55%)' }} />}
            </button>

            {/* Section Body */}
            {openSections[section.id] && (
              <div className="border-t border-border px-5 py-5 space-y-4">

                {/* ── Hero Section ── */}
                {section.id === 'hero' && (
                  <>
                    <FieldGroup label="Badge Text" hint="Shown above the main headline">
                      <Input
                        value={content.heroBadge}
                        onChange={e => update('hero', 'heroBadge', e.target.value)}
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </FieldGroup>
                    <FieldGroup label="Main Headline" hint="Large H1 text on the hero banner">
                      <Input
                        value={content.heroHeading}
                        onChange={e => update('hero', 'heroHeading', e.target.value)}
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </FieldGroup>
                    <FieldGroup label="Subheadline / Tagline (italic)" hint="Appears below main headline">
                      <Input
                        value={content.heroSubheading}
                        onChange={e => update('hero', 'heroSubheading', e.target.value)}
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="placeholder:text-muted-foreground"
                      />
                    </FieldGroup>
                    <FieldGroup label="Description Text" hint="Supporting paragraph below tagline">
                      <Textarea
                        value={content.heroTagline}
                        onChange={e => update('hero', 'heroTagline', e.target.value)}
                        rows={2}
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="resize-none placeholder:text-muted-foreground"
                      />
                    </FieldGroup>
                  </>
                )}

                {/* ── Workshop Schedule ── */}
                {section.id === 'workshop' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldGroup label="Wednesday Session Time">
                        <Input
                          value={content.workshopWednesdayTime}
                          onChange={e => update('workshop', 'workshopWednesdayTime', e.target.value)}
                          placeholder="e.g. 6:00 PM"
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </FieldGroup>
                      <FieldGroup label="Saturday Session Time">
                        <Input
                          value={content.workshopSaturdayTime}
                          onChange={e => update('workshop', 'workshopSaturdayTime', e.target.value)}
                          placeholder="e.g. 2:00 PM"
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </FieldGroup>
                    </div>
                    <FieldGroup label="Workshop Location / Venue">
                      <Textarea
                        value={content.workshopLocation}
                        onChange={e => update('workshop', 'workshopLocation', e.target.value)}
                        rows={2}
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="resize-none placeholder:text-muted-foreground"
                      />
                    </FieldGroup>
                  </>
                )}

                {/* ── Contact Details ── */}
                {section.id === 'contact' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldGroup label="Email Address">
                        <Input
                          type="email"
                          value={content.contactEmail}
                          onChange={e => update('contact', 'contactEmail', e.target.value)}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </FieldGroup>
                      <FieldGroup label="Facebook Page Name">
                        <Input
                          value={content.contactFacebook}
                          onChange={e => update('contact', 'contactFacebook', e.target.value)}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </FieldGroup>
                      <FieldGroup label="Phone / Smart">
                        <Input
                          value={content.contactPhone1}
                          onChange={e => update('contact', 'contactPhone1', e.target.value)}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </FieldGroup>
                      <FieldGroup label="Phone / Globe">
                        <Input
                          value={content.contactPhone2}
                          onChange={e => update('contact', 'contactPhone2', e.target.value)}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground"
                        />
                      </FieldGroup>
                    </div>
                    <FieldGroup label="Full Address">
                      <Textarea
                        value={content.contactAddress}
                        onChange={e => update('contact', 'contactAddress', e.target.value)}
                        rows={2}
                        style={{ color: 'hsl(218,72%,12%)' }}
                        className="resize-none placeholder:text-muted-foreground"
                      />
                    </FieldGroup>
                  </>
                )}

                {/* ── Announcements ── */}
                {section.id === 'announcements' && (
                  <div className="space-y-4">
                    <Button
                      size="sm"
                      onClick={addAnnouncement}
                      className="brand-gradient text-white font-semibold gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Announcement
                    </Button>
                    {content.announcements.length === 0 && (
                      <p style={{ color: 'hsl(218,35%,52%)' }} className="text-sm text-center py-6">
                        No announcements yet. Click "Add Announcement" to create one.
                      </p>
                    )}
                    {content.announcements.map((ann, idx) => (
                      <div
                        key={ann.id}
                        className="rounded-xl border p-4 space-y-3"
                        style={{ borderColor: ann.active ? '#bbf7d0' : 'hsl(215,18%,85%)', background: ann.active ? '#f0fdf4' : '#fafafa' }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold uppercase tracking-wide">
                            Announcement #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ann.active}
                                onChange={e => updateAnnouncement(ann.id, 'active', e.target.checked)}
                                className="rounded"
                              />
                              <span style={{ color: 'hsl(218,72%,12%)' }} className="text-xs font-semibold">Active</span>
                            </label>
                            <button
                              onClick={() => deleteAnnouncement(ann.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <Input
                          value={ann.title}
                          onChange={e => updateAnnouncement(ann.id, 'title', e.target.value)}
                          placeholder="Announcement title..."
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground font-semibold"
                        />
                        <Textarea
                          value={ann.body}
                          onChange={e => updateAnnouncement(ann.id, 'body', e.target.value)}
                          placeholder="Announcement details..."
                          rows={2}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="resize-none placeholder:text-muted-foreground"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── FAQ ── */}
                {section.id === 'faq' && (
                  <div className="space-y-4">
                    <Button
                      size="sm"
                      onClick={addFaq}
                      className="brand-gradient text-white font-semibold gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add FAQ
                    </Button>
                    {content.faqs.map((faq, idx) => (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-border p-4 space-y-3 bg-muted/20"
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'hsl(218,35%,48%)' }} className="text-xs font-semibold uppercase tracking-wide">
                            FAQ #{idx + 1}
                          </span>
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <Input
                          value={faq.question}
                          onChange={e => updateFaq(faq.id, 'question', e.target.value)}
                          placeholder="Question..."
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground font-semibold"
                        />
                        <Textarea
                          value={faq.answer}
                          onChange={e => updateFaq(faq.id, 'answer', e.target.value)}
                          placeholder="Answer..."
                          rows={3}
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="resize-none placeholder:text-muted-foreground"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    onClick={() => saveSection(section.id)}
                    className="gap-1.5 font-bold"
                    style={{
                      background: unsaved[section.id]
                        ? 'linear-gradient(135deg, hsl(18,90%,58%), hsl(14,88%,46%))'
                        : 'hsl(215,18%,90%)',
                      color: unsaved[section.id] ? '#ffffff' : 'hsl(218,35%,52%)',
                    }}
                  >
                    <Save className="w-4 h-4" />
                    {unsaved[section.id] ? 'Save Changes' : 'Saved'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Save All */}
        <div
          className="rounded-xl p-5 flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, hsl(218,72%,18%), hsl(218,72%,12%))' }}
        >
          <div>
            <p style={{ color: '#ffffff' }} className="font-bold text-sm">Save All Content</p>
            <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs mt-0.5">
              Saves all sections to localStorage. Connect Supabase to persist across devices.
            </p>
          </div>
          <Button
            onClick={() => {
              saveContent(content);
              setUnsaved({ hero: false, workshop: false, contact: false, announcements: false, faq: false });
              toast.success('All content saved successfully!');
            }}
            className="brand-gradient text-white font-bold gap-2 shrink-0"
          >
            <Save className="w-4 h-4" /> Save All
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold text-sm">
          {label}
        </Label>
        {hint && (
          <p style={{ color: 'hsl(218,35%,55%)' }} className="text-xs mt-0.5">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}
