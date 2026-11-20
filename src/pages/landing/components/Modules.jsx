import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingCart, Handshake, Wallet, ChevronRight, CheckCircle2 } from 'lucide-react';

const modules = [
  {
    id: 'stock', label: 'Stock Management', Icon: Package, num: '01', color: '#34D399',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    features: ['Live inventory tracking', 'Multi-location warehousing', 'Bill of materials', 'Reorder automation'],
    desc: 'Complete end-to-end stock control across warehouses, categories, and production workflows — so nobody finds out about a shortage from a customer.',
    stats: [{ label: 'SKUs Tracked', val: '50K+' }, { label: 'Warehouses', val: '∞' }, { label: 'Accuracy', val: '99.8%' }],
  },
  {
    id: 'purchase', label: 'Purchase & Procurement', Icon: ShoppingCart, num: '02', color: '#8B5CF6',
    img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=800&q=80',
    features: ['PO creation & approval', 'Requisition workflows', 'Vendor price comparison', 'Delivery tracking'],
    desc: 'Streamlined procurement lifecycle from requisition to delivery, with a complete audit trail on every step.',
    stats: [{ label: 'Avg Approval', val: '< 2hr' }, { label: 'Cost Saved', val: '18%' }, { label: 'POs/month', val: '10K+' }],
  },
  {
    id: 'vendor', label: 'Vendor Management', Icon: Handshake, num: '03', color: '#A78BFA',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    features: ['Vendor onboarding', 'Contract management', 'SLA monitoring', 'Performance scorecards'],
    desc: 'Build and sustain stronger vendor relationships with contract tracking and real performance scorecards.',
    stats: [{ label: 'Vendors', val: '5K+' }, { label: 'SLA Hit Rate', val: '94%' }, { label: 'Disputes', val: '-70%' }],
  },
  {
    id: 'accounts', label: 'Accounts & Finance', Icon: Wallet, num: '04', color: '#F59E0B',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    features: ['General ledger', 'Payment reconciliation', 'Expense management', 'Financial reports'],
    desc: 'A full-spectrum financial command center giving finance leaders clarity and control over every rupee.',
    stats: [{ label: 'GST-ready', val: '✓ India' }, { label: 'Recon Time', val: '-80%' }, { label: 'Reports', val: '40+' }],
  },
];

export default function Modules() {
  const [active, setActive] = useState(0);
  const m = modules[active];

  return (
    <section id="modules" style={{ padding: '120px 5%', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600' }}>PLATFORM TOUR</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.6rem)', fontWeight: '700',
            lineHeight: '1.15', color: 'var(--text-primary)', marginTop: '16px',
          }}>
            Four modules.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA, #34D399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontWeight: '500',
            }}>One rhythm.</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '16px auto 0', lineHeight: '1.8', fontWeight: '300' }}>
            Every module is deeply connected — data flows automatically so your teams always work from the same source of truth.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
          {modules.map((mod, i) => (
            <motion.button
              key={mod.id}
              onClick={() => setActive(i)}
              whileHover={{ y: -2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 22px', borderRadius: '999px', cursor: 'pointer',
                border: active === i ? `1px solid ${mod.color}60` : '1px solid rgba(255,255,255,0.1)',
                background: active === i ? `${mod.color}18` : 'rgba(31,23,53,0.4)',
                color: active === i ? mod.color : 'rgba(255,255,255,0.5)',
                fontSize: '0.82rem', fontWeight: active === i ? '700' : '500',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.25s ease',
              }}>
              <mod.Icon size={15} />
              {mod.label}
            </motion.button>
          ))}
        </div>

        {/* Active module showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center',
              background: 'rgba(31,23,53,0.4)', border: '1px solid rgba(139,92,246,0.16)',
              borderRadius: '28px', overflow: 'hidden',
            }}>
            {/* Image side */}
            <div style={{ position: 'relative', height: '440px', overflow: 'hidden' }}>
              <img
                src={m.img}
                alt={m.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85)' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(120deg, rgba(11,7,19,0) 0%, rgba(11,7,19,0.7) 100%), linear-gradient(to top, rgba(11,7,19,0.8) 0%, transparent 50%)`,
              }} />
              {/* Number overlay */}
              <div style={{
                position: 'absolute', top: '24px', left: '24px',
                fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: '900',
                color: `${m.color}20`, lineHeight: 1,
              }}>{m.num}</div>
              {/* Stats overlay */}
              <div style={{
                position: 'absolute', bottom: '24px', left: '24px', right: '24px',
                display: 'flex', gap: '12px',
              }}>
                {m.stats.map(s => (
                  <div key={s.label} style={{
                    flex: 1, background: 'rgba(11,7,19,0.75)', backdropFilter: 'blur(12px)',
                    border: `1px solid ${m.color}30`, borderRadius: '12px', padding: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: m.color, fontWeight: '700' }}>{s.val}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content side */}
            <div style={{ padding: '48px 40px 48px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: `${m.color}20`, border: `1px solid ${m.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <m.Icon size={20} color={m.color} />
                </div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: m.color, fontWeight: '700' }}>{m.label}</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.85', fontWeight: '300', marginBottom: '28px' }}>{m.desc}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {m.features.map(feat => (
                  <motion.div
                    key={feat}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={16} color={m.color} />
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>{feat}</span>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActive((active + 1) % modules.length)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '11px 22px', borderRadius: '999px', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${m.color}, ${active % 2 === 0 ? '#34D399' : '#8B5CF6'})`,
                    border: 'none', color: '#0B0713', fontSize: '0.82rem', fontWeight: '700',
                    fontFamily: 'var(--font-body)',
                  }}>
                  Next Module <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .module-showcase { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}