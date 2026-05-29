import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Shield, Plus, Trash2, Eye, EyeOff,
  Save, Download, AlertTriangle, ToggleLeft, ToggleRight, RefreshCw,
  Users, CreditCard, Globe, Upload, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminAuth } from '@/hooks/useAuth';
import { getStudentsStore } from '@/lib/auth';
import { toast } from 'sonner';

const SETTINGS_KEY = 'philmac_system_settings';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Moderator';
  createdAt: string;
}

interface SystemSettings {
  siteName: string;
  siteTagline: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  workshopSeatsLimit: number;
  admins: AdminAccount[];
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'PHILMAC Cebu',
  siteTagline: 'Invest in Education, Build Traders Generation',
  maintenanceMode: false,
  registrationOpen: true,
  workshopSeatsLimit: 25,
  admins: [
    { id: 'admin-001', name: 'Super Admin', email: 'admin@philmaccebu.com', role: 'Super Admin', createdAt: '2026-01-01T00:00:00Z' },
  ],
};

function loadSettings(): SystemSettings {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function saveSettings(s: SystemSettings) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

type Section = 'general' | 'accounts' | 'security' | 'export';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { admin, loading } = useAdminAuth();
  const [settings, setSettings] = useState<SystemSettings>(loadSettings());
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Admin' as AdminAccount['role'] });
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [logoUploaded, setLogoUploaded] = useState(false);

  useEffect(() => {
    if (!loading && !admin) navigate('/login');
  }, [admin, loading, navigate]);

  const saveAll = () => { saveSettings(settings); toast.success('Settings saved successfully'); };

  const toggleMaintenance = () => {
    const updated = { ...settings, maintenanceMode: !settings.maintenanceMode };
    setSettings(updated);
    saveSettings(updated);
    toast.success(`Maintenance mode ${updated.maintenanceMode ? 'enabled' : 'disabled'}`);
  };

  const toggleRegistration = () => {
    const updated = { ...settings, registrationOpen: !settings.registrationOpen };
    setSettings(updated);
    saveSettings(updated);
    toast.success(`Registration ${updated.registrationOpen ? 'opened' : 'closed'}`);
  };

  const addAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) { toast.error('Name and email required'); return; }
    const account: AdminAccount = {
      id: `admin-${Date.now()}`,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...settings, admins: [...settings.admins, account] };
    setSettings(updated);
    saveSettings(updated);
    setNewAdmin({ name: '', email: '', role: 'Admin' });
    setShowAddAdmin(false);
    toast.success('Admin account added');
  };

  const removeAdmin = (id: string) => {
    if (settings.admins.length === 1) { toast.error('Cannot remove the last admin account'); return; }
    const updated = { ...settings, admins: settings.admins.filter(a => a.id !== id) };
    setSettings(updated);
    saveSettings(updated);
    toast.success('Admin account removed');
  };

  const changePassword = () => {
    if (!pwForm.current) { toast.error('Current password required'); return; }
    if (pwForm.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.current !== 'admin123') { toast.error('Current password is incorrect'); return; }
    setPwForm({ current: '', next: '', confirm: '' });
    toast.success('Password changed successfully');
  };

  const exportStudentsCSV = () => {
    const students = getStudentsStore();
    const header = 'ID,Name,Email,Mobile,Referral Code,Status,Direct Refs,Basic Course,Certificate,Award,Registered At';
    const rows = students.map(s =>
      `"${s.id}","${s.fullName}","${s.email}","${s.mobile}","${s.referralCode}","${s.status}",${s.directReferrals.length},"${s.basicCourseStatus}","${s.certificateIssued ? s.certificateNumber || 'Yes' : 'No'}","${s.awardStatus}","${new Date(s.registeredAt).toLocaleDateString()}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `philmac_students_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Students exported to CSV');
  };

  const exportPaymentsCSV = () => {
    const students = getStudentsStore();
    const header = 'Student Name,Email,Payment Method,Reference Number,Status,Registered At';
    const rows = students.map(s =>
      `"${s.fullName}","${s.email}","${s.paymentMethod}","${s.paymentReference}","${s.status}","${new Date(s.registeredAt).toLocaleDateString()}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `philmac_payments_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Payment records exported to CSV');
  };

  if (loading || !admin) return null;

  const NAV: Array<{ id: Section; label: string; icon: React.ElementType }> = [
    { id: 'general',  label: 'General',       icon: Globe },
    { id: 'accounts', label: 'Admin Accounts', icon: Shield },
    { id: 'security', label: 'Security',       icon: SettingsIcon },
    { id: 'export',   label: 'Data Export',    icon: Download },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-xl font-black text-foreground">System Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage admin accounts, system configuration, and data exports.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar Nav */}
          <div className="lg:w-48 shrink-0">
            <nav className="space-y-1">
              {NAV.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      background: active ? 'hsl(218,72%,16%)' : 'transparent',
                      color: active ? '#ffffff' : 'hsl(218,35%,42%)',
                      borderLeft: active ? '3px solid hsl(18,90%,54%)' : '3px solid transparent',
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-5">

            {/* ── General Settings ── */}
            {activeSection === 'general' && (
              <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
                <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">General Configuration</h2>

                <div className="space-y-1.5">
                  <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    style={{ color: 'hsl(218,72%,12%)' }}
                    className="placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Site Tagline</Label>
                  <Input
                    value={settings.siteTagline}
                    onChange={e => setSettings(prev => ({ ...prev, siteTagline: e.target.value }))}
                    style={{ color: 'hsl(218,72%,12%)' }}
                    className="placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Workshop Seats Limit</Label>
                  <Input
                    type="number"
                    value={settings.workshopSeatsLimit}
                    onChange={e => setSettings(prev => ({ ...prev, workshopSeatsLimit: Number(e.target.value) }))}
                    min={1} max={100}
                    style={{ color: 'hsl(218,72%,12%)' }}
                    className="placeholder:text-muted-foreground max-w-xs"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-1.5">
                  <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold">Site Logo</Label>
                  <div
                    className="rounded-xl border-2 border-dashed p-5 flex flex-col items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                    style={{ borderColor: 'hsl(215,18%,78%)' }}
                    onClick={() => { setLogoUploaded(true); toast.success('Logo upload will be available after connecting Supabase Storage.'); }}
                  >
                    {logoUploaded
                      ? <CheckCircle className="w-8 h-8" style={{ color: '#16a34a' }} />
                      : <Upload className="w-8 h-8" style={{ color: 'hsl(218,35%,55%)' }} />}
                    <div className="text-center">
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="text-sm font-semibold">
                        {logoUploaded ? 'Logo staged for upload' : 'Click to upload new logo'}
                      </p>
                      <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">
                        PNG, JPG up to 2MB. Requires Supabase Storage to persist.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">System Controls</h3>

                  {/* Registration Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">Student Registration</p>
                      <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">
                        {settings.registrationOpen ? 'New registrations are currently accepted.' : 'Registration is currently closed.'}
                      </p>
                    </div>
                    <button onClick={toggleRegistration}>
                      {settings.registrationOpen
                        ? <ToggleRight className="w-8 h-8" style={{ color: '#22c55e' }} />
                        : <ToggleLeft className="w-8 h-8" style={{ color: 'hsl(218,35%,65%)' }} />}
                    </button>
                  </div>

                  {/* Maintenance Toggle */}
                  <div
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{ borderColor: settings.maintenanceMode ? '#fca5a5' : 'hsl(215,18%,85%)', background: settings.maintenanceMode ? '#fff1f2' : '#ffffff' }}
                  >
                    <div className="flex items-start gap-3">
                      {settings.maintenanceMode && <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#ef4444' }} />}
                      <div>
                        <p style={{ color: settings.maintenanceMode ? '#991b1b' : 'hsl(218,72%,12%)' }} className="font-semibold text-sm">
                          Maintenance Mode
                        </p>
                        <p style={{ color: settings.maintenanceMode ? '#dc2626' : 'hsl(218,35%,52%)' }} className="text-xs mt-0.5">
                          {settings.maintenanceMode ? 'Site is currently in maintenance mode — public pages are hidden.' : 'Site is publicly accessible.'}
                        </p>
                      </div>
                    </div>
                    <button onClick={toggleMaintenance}>
                      {settings.maintenanceMode
                        ? <ToggleRight className="w-8 h-8" style={{ color: '#ef4444' }} />
                        : <ToggleLeft className="w-8 h-8" style={{ color: 'hsl(218,35%,65%)' }} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveAll} className="brand-gradient text-white font-bold gap-2">
                    <Save className="w-4 h-4" /> Save Settings
                  </Button>
                </div>
              </div>
            )}

            {/* ── Admin Accounts ── */}
            {activeSection === 'accounts' && (
              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Admin Accounts</h2>
                    <Button
                      size="sm"
                      onClick={() => setShowAddAdmin(s => !s)}
                      className="gap-1.5 brand-gradient text-white font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      {showAddAdmin ? 'Cancel' : 'Add Admin'}
                    </Button>
                  </div>

                  {/* Add Admin Form */}
                  {showAddAdmin && (
                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={{ background: 'hsl(210,20%,97%)', border: '1px solid hsl(215,18%,85%)' }}
                    >
                      <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">New Admin Account</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label style={{ color: 'hsl(218,72%,15%)' }} className="text-xs font-semibold">Full Name</Label>
                          <Input
                            value={newAdmin.name}
                            onChange={e => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Admin name"
                            style={{ color: 'hsl(218,72%,12%)' }}
                            className="placeholder:text-muted-foreground text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label style={{ color: 'hsl(218,72%,15%)' }} className="text-xs font-semibold">Email Address</Label>
                          <Input
                            type="email"
                            value={newAdmin.email}
                            onChange={e => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="admin@philmaccebu.com"
                            style={{ color: 'hsl(218,72%,12%)' }}
                            className="placeholder:text-muted-foreground text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label style={{ color: 'hsl(218,72%,15%)' }} className="text-xs font-semibold">Role</Label>
                        <select
                          value={newAdmin.role}
                          onChange={e => setNewAdmin(prev => ({ ...prev, role: e.target.value as AdminAccount['role'] }))}
                          className="w-full rounded-lg border px-3 py-2 text-sm"
                          style={{ borderColor: 'hsl(215,18%,85%)', color: 'hsl(218,72%,12%)', background: '#ffffff' }}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </div>
                      <Button onClick={addAdmin} className="brand-gradient text-white font-semibold gap-1.5 text-sm">
                        <Plus className="w-3.5 h-3.5" /> Add Account
                      </Button>
                    </div>
                  )}

                  {/* Admin List */}
                  <div className="space-y-2">
                    {settings.admins.map(acc => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border"
                        style={{ borderColor: 'hsl(215,18%,85%)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black"
                            style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
                          >
                            {acc.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold text-sm">{acc.name}</p>
                            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{acc.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: acc.role === 'Super Admin' ? 'rgba(234,88,12,0.12)' : '#dbeafe',
                              color: acc.role === 'Super Admin' ? '#9a3412' : '#1e40af',
                            }}
                          >
                            {acc.role}
                          </span>
                          {acc.role !== 'Super Admin' && (
                            <button
                              onClick={() => removeAdmin(acc.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Security / Password ── */}
            {activeSection === 'security' && (
              <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
                <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Change Admin Password</h2>
                <p style={{ color: 'hsl(218,35%,48%)' }} className="text-sm">
                  Update your admin account password. Default password for demo: <strong>admin123</strong>
                </p>

                <div className="space-y-4 max-w-md">
                  {[
                    { label: 'Current Password', key: 'current' as const },
                    { label: 'New Password',     key: 'next'    as const },
                    { label: 'Confirm Password', key: 'confirm' as const },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-1.5">
                      <Label style={{ color: 'hsl(218,72%,15%)' }} className="font-semibold text-sm">{label}</Label>
                      <div className="relative">
                        <Input
                          type={showPw ? 'text' : 'password'}
                          value={pwForm[key]}
                          onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder="••••••••"
                          style={{ color: 'hsl(218,72%,12%)' }}
                          className="placeholder:text-muted-foreground pr-10"
                        />
                        {key === 'current' && (
                          <button
                            type="button"
                            onClick={() => setShowPw(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button onClick={changePassword} className="brand-gradient text-white font-bold gap-2">
                    <Shield className="w-4 h-4" /> Update Password
                  </Button>
                </div>

                <div
                  className="rounded-xl p-4 flex gap-3 mt-4"
                  style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                  <div>
                    <p style={{ color: '#92400e' }} className="text-sm font-semibold">Security Note</p>
                    <p style={{ color: '#b45309' }} className="text-xs mt-0.5">
                      Connect Supabase to enable real authentication, secure password storage, and session management.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Data Export ── */}
            {activeSection === 'export' && (
              <div className="space-y-4">
                <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
                  <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Export Data</h2>
                  <p style={{ color: 'hsl(218,35%,48%)' }} className="text-sm">
                    Download student and payment data as CSV files for offline review or backup.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        icon: Users,
                        title: 'Student Records',
                        desc: 'All students: name, email, status, referrals, course progress, certificate.',
                        color: '#2563eb',
                        bg: '#dbeafe',
                        action: exportStudentsCSV,
                        label: 'Export Students CSV',
                      },
                      {
                        icon: CreditCard,
                        title: 'Payment Records',
                        desc: 'All payment references, methods, and subscription statuses.',
                        color: '#16a34a',
                        bg: '#dcfce7',
                        action: exportPaymentsCSV,
                        label: 'Export Payments CSV',
                      },
                    ].map(item => (
                      <div
                        key={item.title}
                        className="rounded-xl p-5 space-y-3"
                        style={{ background: '#fafafa', border: '1px solid hsl(215,18%,85%)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                            <item.icon className="w-5 h-5" style={{ color: item.color }} />
                          </div>
                          <div>
                            <p style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm">{item.title}</p>
                            <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{item.desc}</p>
                          </div>
                        </div>
                        <Button
                          onClick={item.action}
                          size="sm"
                          className="w-full gap-2 font-semibold"
                          style={{ background: item.color, color: '#ffffff' }}
                        >
                          <Download className="w-3.5 h-3.5" /> {item.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-4 flex gap-3"
                  style={{ background: 'hsl(218,72%,16%)', border: '1px solid hsl(218,72%,24%)' }}
                >
                  <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'hsl(18,90%,54%)' }} />
                  <div>
                    <p style={{ color: '#ffffff' }} className="text-sm font-semibold">Supabase Backup</p>
                    <p style={{ color: 'rgba(255,255,255,0.60)' }} className="text-xs mt-0.5">
                      After connecting Supabase, you can export directly from PostgreSQL with advanced filtering and scheduling.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
