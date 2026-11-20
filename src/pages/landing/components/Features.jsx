import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Handshake, Wallet, BarChart3, ShieldCheck, Layers, Zap, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';

const features = [
  {
    Icon: BarChart3, title: 'Live Analytics', span: 2, color: '#8B5CF6',
    desc: 'Dashboards that turn operational data into decisions your leadership can act on — updated in real time, not overnight.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    tags: ['Real-time KPIs', 'Custom reports', 'Export to PDF'],
  },
  {
    Icon: Package, title: 'Inventory Intelligence', span: 1, color: '#34D399',
    desc: 'Stock visibility across every warehouse and stage. Automated reorder alerts and BOM tracking.',
    img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
    tags: ['Multi-warehouse', 'BOM tracking'],
  },
  {
    Icon: ShoppingCart, title: 'Procurement Automation', span: 1, color: '#8B5CF6',
    desc: 'Requisitions and POs routed automatically, with full audit trails.',
    img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=600&q=80',
    tags: ['Auto-PO', 'Audit trails'],
  },
  {
    Icon: Handshake, title: 'Vendor Collaboration', span: 1, color: '#34D399',
    desc: 'Onboard vendors, track SLAs, score performance from a shared workspace.',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    tags: ['SLA tracking', 'Scorecards'],
  },
  {
    Icon: Wallet, title: 'Financial Command', span: 2, color: '#A78BFA',
    desc: 'GST-ready invoicing, reconciliation, and reporting built for Indian businesses.',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    tags: ['GST-ready', 'Auto-reconciliation', 'Indian compliance'],
  },
  {
    Icon: ShieldCheck, title: 'Role-based Access', span: 1, color: '#34D399',
    desc: 'Granular permissions per team, department, and location.',
    img: null, tags: ['RBAC', 'Audit log'],
  },
  {
    Icon: Layers, title: 'Multi-location Support', span: 1, color: '#8B5CF6',
    desc: 'Run every site from one account with consolidated reporting.',
    img: null, tags: ['Unlimited sites', 'Consolidated view'],
  },
  {
    Icon: Zap, title: 'Rapid Onboarding', span: 1, color: '#34D399',
    desc: 'Live in days with guided migration and dedicated support.',
    img: null, tags: ['Data migration', 'Onboarding team'],
  },
];

export default function Features() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="features" style={{ padding: '120px 5%', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '20%', right: '-200px', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', left: '-180px', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="reveal" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          flexWrap: 'wrap', gap: '24px', marginBottom: '60px',
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600' }}>PLATFORM CAPABILITIES</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: '700',
              color: 'var(--text-primary)', marginTop: '14px', maxWidth: '560px', lineHeight: '1.15',
            }}>
              Everything each team needs.{' '}
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA, #34D399)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontWeight: '500',
              }}>Nothing they don't.</span>
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '320px', lineHeight: '1.8', fontWeight: '300' }}>
            From a single warehouse to a multi-site operation — Aminoid Ai scales with the way you actually work.
          </p>
        </div>

        <div className="features-bento" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="reveal"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -6, borderColor: `${f.color}60` }}
              style={{
                gridColumn: `span ${f.span}`,
                padding: f.img ? '0' : '28px',
                borderRadius: '20px',
                background: 'rgba(31,23,53,0.45)',
                border: '1px solid rgba(139,92,246,0.14)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: '200px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'default',
                transition: 'border-color 0.3s',
              }}
            >
              {f.img ? (
                <>
                  {/* Image background with overlay */}
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <img
                      src={f.img}
                      alt={f.title}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        opacity: hovered === i ? 0.3 : 0.18,
                        transition: 'opacity 0.4s ease',
                        filter: 'saturate(0.7)',
                      }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(160deg, rgba(20,14,40,0.7) 0%, rgba(20,14,40,0.9) 100%)',
                    }} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, padding: '28px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '13px',
                        background: `${f.color}20`, border: `1px solid ${f.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><f.Icon size={20} color={f.color} /></div>
                      <motion.div animate={{ x: hovered === i ? 0 : 4, opacity: hovered === i ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                        <ArrowRight size={16} color={f.color} />
                      </motion.div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: f.span === 2 ? '1.25rem' : '1rem', color: '#fff', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{f.title}</h3>
                      <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', fontWeight: '300', maxWidth: f.span === 2 ? '480px' : 'none', marginBottom: '14px' }}>{f.desc}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {f.tags.map(t => (
                          <span key={t} style={{
                            fontSize: '0.7rem', padding: '4px 10px', borderRadius: '999px',
                            background: `${f.color}18`, border: `1px solid ${f.color}35`,
                            color: f.color, fontWeight: '600',
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '13px',
                      background: `${f.color}18`, border: `1px solid ${f.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><f.Icon size={20} color={f.color} /></div>
                    <motion.div animate={{ x: hovered === i ? 0 : 4, opacity: hovered === i ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                      <ArrowRight size={16} color={f.color} />
                    </motion.div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.7', fontWeight: '300', marginBottom: '12px' }}>{f.desc}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {f.tags.map(t => (
                        <span key={t} style={{
                          fontSize: '0.7rem', padding: '4px 10px', borderRadius: '999px',
                          background: `${f.color}14`, border: `1px solid ${f.color}30`,
                          color: f.color, fontWeight: '600',
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .features-bento { grid-template-columns: 1fr 1fr !important; } .features-bento > div { grid-column: span 1 !important; } }
        @media (max-width: 560px) { .features-bento { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}