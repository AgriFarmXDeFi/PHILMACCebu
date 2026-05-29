import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import workshop1 from '@/assets/workshop-1.jpg';
import workshop2 from '@/assets/workshop-2.jpg';
import workshop3 from '@/assets/workshop-3.jpg';
import graduation from '@/assets/graduation.jpg';
import philmacBanner from '@/assets/philmac-banner.jpg';

const GALLERY_ITEMS = [
  {
    src: graduation,
    title: 'PHILMAC Graduation Ceremony',
    category: 'Graduates',
    desc: 'Proud graduates of the PHILMAC trading academy certification program.',
    featured: true,
  },
  {
    src: workshop1,
    title: 'Free Forex Workshop Session',
    category: 'Workshops',
    desc: 'Live forex derivative trading workshop at USPF Building, Cebu City.',
    featured: false,
  },
  {
    src: workshop2,
    title: 'PHILMAC Classroom Training',
    category: 'Workshops',
    desc: 'Hands-on forex training session with instructor-led discussion.',
    featured: false,
  },
  {
    src: workshop3,
    title: 'Group Learning Session',
    category: 'Workshops',
    desc: 'Students engage in an interactive learning session at PHILMAC Cebu.',
    featured: false,
  },
  {
    src: philmacBanner,
    title: 'PHILMAC Cebu Official Banner',
    category: 'Events',
    desc: 'Official PHILMAC contact information and trading education services.',
    featured: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    title: 'Forex Chart Analysis Session',
    category: 'Workshops',
    desc: 'Professional forex market analysis and candlestick chart reading.',
    featured: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=800&q=80',
    title: 'Trading Platform Demo',
    category: 'Workshops',
    desc: 'Students learning to navigate professional trading platforms.',
    featured: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
    title: 'Risk Management Workshop',
    category: 'Workshops',
    desc: 'Advanced session on forex risk management and capital protection.',
    featured: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    title: 'Certificate Awarding Ceremony',
    category: 'Graduates',
    desc: 'Students receiving their PHILMAC Cebu trading certificates.',
    featured: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    title: 'PHILMAC Annual Event',
    category: 'Events',
    desc: 'Annual gathering of PHILMAC Cebu students, graduates, and mentors.',
    featured: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    title: 'Trading Seminar Stage',
    category: 'Events',
    desc: 'Special forex trading seminar organized by PHILMAC Cebu for the community.',
    featured: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80',
    title: 'Graduate Batch 2026',
    category: 'Graduates',
    desc: 'Celebrating the latest batch of PHILMAC Cebu certified traders.',
    featured: false,
  },
];

const TABS = ['All', 'Workshops', 'Graduates', 'Events'] as const;
type TabType = (typeof TABS)[number];

// Lazy-loading image component with fade-in animation
function LazyImage({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={inView ? src : undefined}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

// Masonry column layout
function MasonryGrid({ items, onOpen }: { items: typeof GALLERY_ITEMS; onOpen: (idx: number) => void }) {
  // Distribute items across 3 columns
  const cols = [0, 1, 2];
  const columns: (typeof GALLERY_ITEMS[number] & { origIdx: number })[][] = [[], [], []];
  items.forEach((item, i) => {
    columns[i % 3].push({ ...item, origIdx: i });
  });

  // Heights to simulate masonry: featured items get more height
  const getHeight = (item: typeof GALLERY_ITEMS[number]) => {
    if (item.featured) return 'aspect-[3/4]';
    return item.title.length > 25 ? 'aspect-[4/3]' : 'aspect-square';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cols.map(col => (
        <div key={col} className="flex flex-col gap-3">
          {columns[col].map((item) => (
            <div
              key={item.origIdx}
              className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: '1px solid hsl(215,18%,85%)' }}
              onClick={() => onOpen(item.origIdx)}
            >
              <div className={`relative overflow-hidden ${getHeight(item)}`}>
                {/* Skeleton */}
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{ background: 'hsl(215,18%,90%)' }}
                />
                <LazyImage
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,18,40,0.80) 0%, rgba(10,18,40,0) 55%)',
                    opacity: 0.6,
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}
                    >
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }} className="text-xs font-bold leading-tight truncate">
                      {item.title}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'rgba(234,88,12,0.85)', color: '#ffffff', fontSize: 10 }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Gallery() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = activeTab === 'All' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(g => g.category === activeTab);

  const openLightbox = (idx: number) => {
    // Map filtered index to absolute index
    setLightboxIdx(idx);
  };

  const closeLightbox = () => setLightboxIdx(null);

  const prevItem = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx(prev => prev === null ? null : (prev - 1 + filtered.length) % filtered.length);
  };

  const nextItem = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx(prev => prev === null ? null : (prev + 1) % filtered.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'ArrowLeft')  prevItem();
      if (e.key === 'ArrowRight') nextItem();
      if (e.key === 'Escape')     closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx]);

  const lightboxItem = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  const tabCounts: Record<TabType, number> = {
    All:       GALLERY_ITEMS.length,
    Workshops: GALLERY_ITEMS.filter(g => g.category === 'Workshops').length,
    Graduates: GALLERY_ITEMS.filter(g => g.category === 'Graduates').length,
    Events:    GALLERY_ITEMS.filter(g => g.category === 'Events').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <div className="pt-24 pb-16">

        {/* ── Hero ── */}
        <section className="py-14 px-4 text-center" style={{ background: 'hsl(218,72%,10%)' }}>
          <div className="max-w-3xl mx-auto">
            <div style={{ color: 'hsl(18,90%,54%)' }} className="text-xs font-bold tracking-widest uppercase mb-3">
              Photo Gallery
            </div>
            <h1 style={{ color: '#ffffff' }} className="text-4xl sm:text-5xl font-black mb-4">
              Our <span style={{ color: 'hsl(18,90%,54%)' }}>Journey</span> in Photos
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.60)' }} className="text-lg max-w-xl mx-auto">
              Workshops, graduations, and training moments from PHILMAC Cebu.
            </p>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setLightboxIdx(null); }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    background: activeTab === tab
                      ? 'linear-gradient(135deg, hsl(218,72%,22%), hsl(218,72%,14%))'
                      : '#ffffff',
                    color: activeTab === tab ? '#ffffff' : 'hsl(218,35%,42%)',
                    border: `1.5px solid ${activeTab === tab ? 'transparent' : 'hsl(215,18%,82%)'}`,
                    boxShadow: activeTab === tab ? '0 4px 12px rgba(20,40,100,0.25)' : undefined,
                  }}
                >
                  {tab}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: activeTab === tab ? 'rgba(255,255,255,0.20)' : 'hsl(215,18%,90%)',
                      color: activeTab === tab ? '#ffffff' : 'hsl(218,35%,52%)',
                    }}
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>

            {/* Masonry Grid */}
            <MasonryGrid items={filtered} onOpen={openLightbox} />

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p style={{ color: 'hsl(218,35%,52%)' }} className="text-base">No photos in this category yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Lightbox ── */}
      {lightboxItem && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(5,10,25,0.95)', backdropFilter: 'blur(8px)' }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.12)' }}
            onClick={closeLightbox}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Navigation — Prev */}
          <button
            className="absolute left-3 sm:left-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.10)' }}
            onClick={e => { e.stopPropagation(); prevItem(); }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl w-full px-16"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightboxItem.src}
              alt={lightboxItem.title}
              className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              style={{ display: 'block' }}
            />
            {/* Caption */}
            <div className="mt-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'hsl(18,90%,54%)', color: '#ffffff' }}
                >
                  {lightboxItem.category}
                </span>
              </div>
              <p style={{ color: '#ffffff' }} className="font-bold text-base">{lightboxItem.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.55)' }} className="text-sm mt-1">{lightboxItem.desc}</p>
              <p style={{ color: 'rgba(255,255,255,0.30)' }} className="text-xs mt-3">
                {lightboxIdx + 1} / {filtered.length} · Press ← → to navigate · Esc to close
              </p>
            </div>
          </div>

          {/* Navigation — Next */}
          <button
            className="absolute right-3 sm:right-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.10)' }}
            onClick={e => { e.stopPropagation(); nextItem(); }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightboxIdx(i); }}
                className="rounded-full transition-all"
                style={{
                  width: i === lightboxIdx ? 20 : 6,
                  height: 6,
                  background: i === lightboxIdx ? 'hsl(18,90%,54%)' : 'rgba(255,255,255,0.30)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
