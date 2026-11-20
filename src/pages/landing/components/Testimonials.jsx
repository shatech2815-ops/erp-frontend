import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Aminoid Ai transformed our procurement process entirely. What used to take days now happens in hours. Visibility across our 8 warehouses is unmatched.",
    name: "Rajesh Kumar",
    title: "VP Operations",
    company: "Meridian Manufacturing",
    avatar: "RK", size: 'lg',
  },
  {
    quote: "The vendor management module alone justified the investment. Our supplier relationships are more strategic and payment cycles are 30% faster.",
    name: "Priya Nair",
    title: "Supply Chain Director",
    company: "Apex Industries",
    avatar: "PN", size: 'sm',
  },
  {
    quote: "Implementation was seamless and the financial analytics gave our CFO clarity they never had before.",
    name: "Anand Mehta",
    title: "CEO",
    company: "Prestige Logistics Group",
    avatar: "AM", size: 'sm',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: '120px 5%', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600' }}>CUSTOMER STORIES</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: '600',
            lineHeight: '1.2', color: 'var(--text-primary)', margin: '16px 0 0',
          }}>
            Trusted by <span style={{
              background: 'linear-gradient(135deg, #A78BFA, #34D399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontWeight: '500',
            }}>industry leaders.</span>
          </h2>
        </div>

        <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: 'auto auto', gap: '20px' }}>
          <motion.div
            className="reveal"
            whileHover={{ y: -5 }}
            style={{
              gridRow: 'span 2', padding: '44px', borderRadius: '22px',
              background: 'linear-gradient(150deg, rgba(139,92,246,0.16), rgba(31,23,53,0.5))',
              border: '1px solid rgba(139,92,246,0.22)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}
          >
            <Quote size={34} color="#8B5CF6" strokeWidth={1.5} />
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: '400',
              color: 'var(--text-primary)', lineHeight: '1.55', margin: '24px 0 32px',
            }}>"{testimonials[0].quote}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #34D399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '700', color: '#0B0713',
              }}>{testimonials[0].avatar}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>{testimonials[0].name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-bright)' }}>{testimonials[0].title}, {testimonials[0].company}</div>
              </div>
            </div>
          </motion.div>

          {testimonials.slice(1).map((t, i) => (
            <motion.div
              key={t.name}
              className="reveal"
              whileHover={{ y: -5 }}
              style={{
                padding: '32px', borderRadius: '22px',
                background: 'rgba(31,23,53,0.5)', border: '1px solid rgba(139,92,246,0.14)',
              }}
            >
              <p style={{ fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: '1.7', fontWeight: '300', marginBottom: '22px' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6, #34D399)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: '700', color: '#0B0713',
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-bright)' }}>{t.title}, {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .testimonial-grid > div:first-child { grid-row: auto !important; }
        }
      `}</style>
    </section>
  );
}