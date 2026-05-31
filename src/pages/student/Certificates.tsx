import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, Lock, CheckCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/components/layout/StudentLayout';
import { useStudentAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import philmacLogo from '@/assets/philmac-logo.png';

// ── Print CSS injection ──────────────────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  /* Hide everything except the certificate */
  body > * { display: none !important; }
  body #philmac-print-root { display: flex !important; }

  #philmac-print-root {
    display: flex !important;
    width: 100vw !important;
    height: 100vh !important;
    align-items: center !important;
    justify-content: center !important;
    background: #ffffff !important;
    position: fixed !important;
    inset: 0 !important;
    z-index: 99999 !important;
  }

  #philmac-certificate {
    width: 277mm !important;
    height: 190mm !important;
    max-width: none !important;
    aspect-ratio: auto !important;
    display: block !important;
    border-radius: 0 !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Hide nav, sidebar, layout chrome */
  nav, header, aside, footer,
  [data-sidebar], [data-navbar],
  .no-print { display: none !important; }
}
`;

export default function StudentCertificates() {
  const navigate = useNavigate();
  const { student, loading } = useStudentAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const printRootRef = useRef<HTMLDivElement>(null);

  // Inject print styles once
  useEffect(() => {
    const existing = document.getElementById('philmac-print-styles');
    if (existing) return;
    const style = document.createElement('style');
    style.id = 'philmac-print-styles';
    style.textContent = PRINT_STYLES;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    if (!loading && !student) navigate('/login');
  }, [student, loading, navigate]);

  if (loading || !student) return null;

  const handlePrint = () => {
    if (!certRef.current) return;
    // Assign print root ID so @media print rules apply
    if (printRootRef.current) {
      printRootRef.current.id = 'philmac-print-root';
    }
    window.print();
    toast.success('Print dialog opened — choose "Save as PDF" for a digital copy.');
  };

  const requirements = [
    { label: 'Basic Course', done: student.basicCourseStatus === 'completed' },
    { label: 'Technical Analysis Training', done: student.nextCourseStatus === 'completed' },
    { label: 'Advanced Trading Mentorship', done: student.finalCourseStatus === 'completed' },
    { label: '30-Day Training Challenge', done: student.challengeTrainingStatus === 'passed' },
    { label: '30-Day Pro Firm Challenge', done: student.challengeProfirmStatus === 'passed' },
    { label: 'Admin Verification', done: student.certificateIssued },
  ];
  const doneCount = requirements.filter(r => r.done).length;

  return (
    <StudentLayout>
      {/* Hidden print-only root — wraps only the certificate */}
      <div
        ref={printRootRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        {student.certificateIssued && (
          <div id="philmac-certificate" ref={certRef} style={{ width: '100%', maxWidth: 850 }}>
            <CertificateTemplate
              name={student.fullName}
              certNumber={student.certificateNumber || 'PMAC-2026-0001'}
              certDate={student.certificateDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              logoSrc={philmacLogo}
            />
          </div>
        )}
      </div>

      {/* Screen content */}
      <div className="max-w-3xl space-y-6 no-print">
        <div>
          <h1 className="text-xl font-black text-foreground">My Certificate</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Official PHILMAC Cebu Training Certificate.</p>
        </div>

        {!student.certificateIssued ? (
          <div className="space-y-5">
            {/* Progress toward certificate */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'hsl(218,72%,10%)' }}>
                  <Award className="w-6 h-6" style={{ color: 'hsl(18,90%,54%)' }} />
                </div>
                <div>
                  <h2 style={{ color: 'hsl(218,72%,12%)' }} className="font-black text-base">Certificate in Progress</h2>
                  <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs">{doneCount} of {requirements.length} requirements met</p>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 mb-5">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${(doneCount / requirements.length) * 100}%`,
                    background: 'linear-gradient(90deg, hsl(218,72%,22%), hsl(18,90%,54%))',
                  }}
                />
              </div>

              <div className="space-y-3">
                {requirements.map(req => (
                  <div key={req.label} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: req.done ? '#dcfce7' : '#f3f4f6' }}
                    >
                      {req.done
                        ? <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                        : <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(215,18%,75%)' }} />}
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: req.done ? 'hsl(218,72%,12%)' : 'hsl(218,35%,55%)', fontWeight: req.done ? 600 : 400 }}
                    >
                      {req.label}
                    </span>
                    {req.done && <span className="ml-auto text-xs font-semibold" style={{ color: '#16a34a' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Certificate Preview */}
            <div className="relative rounded-2xl overflow-hidden" style={{ filter: 'blur(3px) grayscale(0.6)', pointerEvents: 'none', opacity: 0.45 }}>
              <CertificateTemplate
                name="Your Name Here"
                certNumber="PMAC-2026-XXXX"
                certDate="Pending"
                logoSrc={philmacLogo}
              />
            </div>
            <div className="flex items-center justify-center gap-2 -mt-2">
              <Lock className="w-4 h-4" style={{ color: 'hsl(218,35%,55%)' }} />
              <p style={{ color: 'hsl(218,35%,45%)' }} className="text-sm">Complete all requirements to unlock your certificate</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Live Certificate — screen preview */}
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid hsl(215,18%,82%)' }}>
              <CertificateTemplate
                name={student.fullName}
                certNumber={student.certificateNumber || 'PMAC-2026-0001'}
                certDate={student.certificateDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                logoSrc={philmacLogo}
              />
            </div>

            {/* Print hint */}
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
            >
              <Printer className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#0284c7' }} />
              <div>
                <p style={{ color: '#0c4a6e' }} className="text-sm font-semibold">Print as A4 Landscape PDF</p>
                <p style={{ color: '#0369a1' }} className="text-xs mt-0.5">
                  Click "Print / Save as PDF" below. In the print dialog, select <strong>A4 landscape</strong> and enable
                  <strong> Background Graphics</strong> to preserve certificate colors. Save as PDF for a digital copy.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={handlePrint}
                size="lg"
                className="gap-2 font-bold text-white"
                style={{ background: 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))' }}
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </Button>
              <Button
                onClick={() => toast.info('Digital download available after connecting Supabase Storage.')}
                size="lg"
                variant="outline"
                className="gap-2 font-bold"
                style={{ borderColor: 'hsl(215,18%,78%)', color: 'hsl(218,72%,12%)' }}
              >
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>

            {/* Certificate Details */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 style={{ color: 'hsl(218,72%,12%)' }} className="font-bold text-sm mb-4">Certificate Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  ['Certificate Number', student.certificateNumber || 'PMAC-2026-0001'],
                  ['Issued To', student.fullName],
                  ['Date Issued', student.certificateDate || 'May 2026'],
                  ['Program', 'PHILMAC Cebu Forex Trading Program'],
                  ['Issued By', 'PHILMAC Cebu Training Academy'],
                  ['Award Status', student.awardStatus === 'paid' ? '$500 Award Released' : 'Pending Award'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ color: 'hsl(218,35%,52%)' }} className="text-xs mb-0.5">{label}</p>
                    <p style={{ color: 'hsl(218,72%,12%)' }} className="font-semibold">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

// ── Certificate Template Component ──────────────────────────────────────────
function CertificateTemplate({ name, certNumber, certDate, logoSrc }: {
  name: string; certNumber: string; certDate: string; logoSrc: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1.41',
        background: 'linear-gradient(160deg, #fdfbf5 0%, #fff9ec 50%, #fdfbf5 100%)',
        border: '2px solid hsl(218,72%,20%)',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Outer decorative border */}
      <div style={{ position: 'absolute', inset: 10, border: '1.5px solid hsl(218,72%,30%)', borderRadius: 10, pointerEvents: 'none' }} />
      {/* Inner thin gold border */}
      <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(234,88,12,0.35)', borderRadius: 8, pointerEvents: 'none' }} />

      {/* Corner ornaments */}
      {[{ top: 18, left: 18 }, { top: 18, right: 18 }, { bottom: 18, left: 18 }, { bottom: 18, right: 18 }].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos, width: 28, height: 28,
          borderTop: i < 2 ? '3px solid hsl(18,90%,48%)' : 'none',
          borderBottom: i >= 2 ? '3px solid hsl(18,90%,48%)' : 'none',
          borderLeft: i % 2 === 0 ? '3px solid hsl(18,90%,48%)' : 'none',
          borderRight: i % 2 === 1 ? '3px solid hsl(18,90%,48%)' : 'none',
        }} />
      ))}

      {/* Background watermark */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(234,88,12,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20,40,100,0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '36px 48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <img src={logoSrc} alt="PHILMAC" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.18em', color: 'hsl(218,72%,16%)', textTransform: 'uppercase' }}>
                PHILMAC Cebu
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.22em', color: 'hsl(218,35%,45%)', textTransform: 'uppercase' }}>
                Training Academy
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '8px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, hsl(18,90%,54%))' }} />
            <div style={{ width: 6, height: 6, background: 'hsl(18,90%,54%)', borderRadius: '50%' }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, hsl(18,90%,54%), transparent)' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'hsl(218,35%,48%)', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
            Certificate of Completion
          </div>
          <div style={{ fontSize: 11, color: 'hsl(218,35%,42%)', fontFamily: 'Arial, sans-serif', marginTop: 4 }}>
            This is to certify that
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'hsl(218,72%,14%)', letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(0,0,0,0.08)', borderBottom: '2px solid rgba(234,88,12,0.40)', paddingBottom: 6, marginTop: 2 }}>
            {name}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(218,35%,42%)', fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
            has successfully completed the
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'hsl(18,80%,42%)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Georgia, serif', marginTop: 2 }}>
            Forex Trading Program
          </div>
          <div style={{ fontSize: 10, color: 'hsl(218,35%,45%)', fontFamily: 'Arial, sans-serif', maxWidth: 380, textAlign: 'center', lineHeight: 1.6 }}>
            Including Basic Course, Technical Analysis Training, Advanced Trading Mentorship,
            30-Day Training Challenge and 30-Day Pro Firm Challenge
          </div>
        </div>

        {/* Footer */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '6px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, hsl(218,72%,30%))' }} />
            <div style={{ width: 6, height: 6, background: 'hsl(218,72%,22%)', borderRadius: '50%' }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, hsl(218,72%,30%), transparent)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center', minWidth: 130 }}>
              <div style={{ borderTop: '1.5px solid hsl(218,35%,50%)', paddingTop: 5, marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'hsl(218,72%,14%)' }}>PHILMAC Admin</div>
                <div style={{ fontSize: 9, color: 'hsl(218,35%,52%)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Academy Director</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, hsl(218,72%,20%), hsl(218,72%,10%))', border: '3px solid hsl(18,90%,48%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <div style={{ fontSize: 7, color: 'hsl(18,90%,70%)', letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1.3 }}>PHILMAC<br/>CEBU</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 130 }}>
              <div style={{ fontSize: 9, color: 'hsl(218,35%,52%)', marginBottom: 2 }}>Certificate No.</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'hsl(218,72%,14%)', marginBottom: 6, letterSpacing: '0.05em' }}>{certNumber}</div>
              <div style={{ fontSize: 9, color: 'hsl(218,35%,52%)', marginBottom: 2 }}>Date Issued</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'hsl(218,72%,14%)' }}>{certDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
