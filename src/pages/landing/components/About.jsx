import React from 'react';
import { motion } from 'framer-motion';
import { Boxes, ShieldCheck, Workflow, Rocket, Gauge, Users2 } from 'lucide-react';

const marqueeItems = [
  'MERIDIAN MFG.', 'APEX INDUSTRIES', 'PRESTIGE LOGISTICS', 'VERTEX METALS',
  'HARBOR SUPPLY CO.', 'ORION RETAIL GROUP', 'BLUEROCK TRADING', 'STELLAR BUILD',
  'KIRAN TEXTILES', 'NOVA PHARMA', 'DELTA AGRO', 'PINNACLE STEEL',
];

const values = [
  {
    Icon: Workflow, title: 'Built for real workflows', big: true,
    desc: 'Not a generic template — purchase, vendor, stock, and finance modules that mirror how your teams actually approve, ship, and reconcile work.',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
    color: '#8B5CF6',
  },
  {
    Icon: Boxes, title: 'One source of truth',
    desc: 'Every department reads from the same live data — no more reconciling five spreadsheets on a Friday.',
    color: '#34D399',
  },
  {
    Icon: Gauge, title: 'Fast by default',
    desc: 'Sub-second dashboards even at scale, across warehouses, teams, and thousands of SKUs.',
    color: '#A78BFA',
  },
  {
    Icon: ShieldCheck, title: 'Access, scoped right',
    desc: 'Granular, role-based permissions so people see exactly what their job needs — nothing more.',
    color: '#34D399',
  },
  {
    Icon: Users2, title: 'A team behind it',
    desc: 'Real onboarding support and a roadmap shaped by the businesses running on Aminoid Ai daily.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    big: false, color: '#8B5CF6',
  },
  {
    Icon: Rocket, title: 'Live in days',
    desc: 'Guided setup and data migration get most teams fully operational inside a week.',
    color: '#F59E0B',
  },
];

export default function About() {
  return (
    <section id="why" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Marquee trust bar */}
      <div style={{
        padding: '44px 0', borderTop: '1px solid rgba(139,92,246,0.10)',
        borderBottom: '1px solid rgba(139,92,246,0.10)', overflow: 'hidden',
        background: 'rgba(139,92,246,0.03)',
      }}>
        <p style={{ textAlign: 'center', fontSize: '0.68rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '22px' }}>
          Trusted by operations teams at
        </p>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marqueeScroll 36s linear infinite', gap: '72px' }}>
          {[...marqueeItems, ...marqueeItems].map((name, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700',
              color: i % 3 === 0 ? 'rgba(139,92,246,0.5)' : i % 3 === 1 ? 'rgba(52,211,153,0.4)' : 'rgba(244,241,251,0.25)',
              whiteSpace: 'nowrap', letterSpacing: '1.5px',
            }}>{name}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '120px 5% 0', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '-10%', width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div className="reveal" style={{ maxWidth: '620px', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600' }}>WHY AMINOID AI</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: '700', lineHeight: '1.15',
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: 'var(--text-primary)', marginTop: '16px',
            }}>
              Operations software that{' '}
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA, #34D399)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontWeight: '500',
              }}>doesn't fight you.</span>
            </h2>
          </div>

          {/* Bento grid */}
          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '220px', gap: '18px' }}>
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="reveal"
                whileHover={{ y: -6, borderColor: `${v.color}50` }}
                style={{
                  gridColumn: v.big ? 'span 2' : 'span 1',
                  padding: '0',
                  borderRadius: '22px',
                  background: 'rgba(31,23,53,0.5)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  overflow: 'hidden', position: 'relative',
                  transition: 'border-color 0.3s',
                }}
              >
                {v.img && (
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={v.img} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, filter: 'saturate(0.5)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(52,211,153,0.1))' }} />
                  </div>
                )}
                <div style={{ position: 'relative', zIndex: 1, padding: '28px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${v.color}18`, border: `1px solid ${v.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><v.Icon size={20} color={v.color} /></div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: v.big ? '1.35rem' : '1.05rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '10px' }}>{v.title}</h3>
                    <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: '1.7', fontWeight: '300', maxWidth: v.big ? '440px' : 'none' }}>{v.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: 1fr 1fr !important; }
          .bento-grid > div { grid-column: span 1 !important; }
        }
        @media (max-width: 560px) {
          .bento-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}