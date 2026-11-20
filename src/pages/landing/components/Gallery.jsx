import React from 'react';
import { motion } from 'framer-motion';

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=85', label: 'Warehouse Operations', cat: 'Inventory' },
  { src: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=700&q=85', label: 'Stock Management', cat: 'Inventory' },
  { src: 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=700&q=85', label: 'Procurement Flow', cat: 'Purchase' },
  { src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=85', label: 'Live Analytics', cat: 'Finance' },
  { src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=85', label: 'Vendor Relations', cat: 'Vendors' },
  { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=85', label: 'Finance Dashboard', cat: 'Finance' },
  { src: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=700&q=85', label: 'Production Floor', cat: 'Operations' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=85', label: 'Team Excellence', cat: 'HR' },
  { src: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=700&q=85', label: 'Supply Chain', cat: 'Logistics' },
  { src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=85', label: 'Remote Teams', cat: 'Collaboration' },
];

const catColors = {
  Inventory: '#34D399', Purchase: '#8B5CF6', Finance: '#A78BFA',
  Vendors: '#34D399', Operations: '#8B5CF6', HR: '#F59E0B',
  Logistics: '#34D399', Collaboration: '#8B5CF6',
};

export default function Gallery() {
  const strip = [...galleryImages, ...galleryImages];

  return (
    <section id="gallery" style={{ padding: '100px 0', overflow: 'hidden', position: 'relative' }}>
      {/* Section header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%', marginBottom: '56px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600' }}>
            IN ACTION
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
            fontWeight: '700', lineHeight: '1.15',
            color: 'var(--text-primary)', marginTop: '16px',
          }}>
            See Aminoid Ai{' '}
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA, #34D399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontStyle: 'italic', fontWeight: '400',
            }}>in Action.</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '440px', margin: '16px auto 0', lineHeight: '1.8', fontWeight: '300' }}>
            From warehouses to boardrooms — Aminoid Ai powers the decisions that keep businesses moving.
          </p>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{
          display: 'flex', gap: '16px',
          animation: 'scrollLeft 45s linear infinite',
          width: 'max-content',
        }}>
          {strip.map((img, i) => (
            <div key={i} style={{
              width: '360px', height: '230px',
              borderRadius: '16px', overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
              border: '1px solid rgba(139,92,246,0.18)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            }}
              onMouseEnter={e => {
                const overlay = e.currentTarget.querySelector('.gal-overlay');
                if (overlay) overlay.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.transition = 'transform 0.3s ease';
              }}
              onMouseLeave={e => {
                const overlay = e.currentTarget.querySelector('.gal-overlay');
                if (overlay) overlay.style.opacity = '0';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85)' }} />
              <div className="gal-overlay" style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(11,7,19,0.92), rgba(11,7,19,0.15))',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
                padding: '20px 22px',
                opacity: 0, transition: 'opacity 0.3s ease',
              }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: catColors[img.cat] || '#34D399',
                  background: `${catColors[img.cat] || '#34D399'}22`,
                  padding: '3px 10px', borderRadius: '999px',
                  marginBottom: '6px',
                  border: `1px solid ${catColors[img.cat] || '#34D399'}40`,
                }}>{img.cat}</span>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600', letterSpacing: '0.5px' }}>{img.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, #0B0713, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, #0B0713, transparent)', pointerEvents: 'none' }} />
      </div>

      {/* Row 2 — scrolls right */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', gap: '16px',
          animation: 'scrollRight 50s linear infinite',
          width: 'max-content',
        }}>
          {[...strip].reverse().map((img, i) => (
            <div key={i} style={{
              width: '290px', height: '185px',
              borderRadius: '14px', overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid rgba(139,92,246,0.10)',
            }}>
              <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, filter: 'saturate(0.6)' }} />
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, #0B0713, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, #0B0713, transparent)', pointerEvents: 'none' }} />
      </div>

      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}