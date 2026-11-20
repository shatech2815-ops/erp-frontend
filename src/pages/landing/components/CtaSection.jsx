import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section id="contact" style={{ padding: '60px 5% 120px', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: '32px', padding: '80px 60px',
            border: '1px solid rgba(139,92,246,0.25)',
            textAlign: 'center',
          }}
        >
          {/* Background photo */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, filter: 'saturate(0.5)' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #201640 0%, #0B0713 70%)',
              opacity: 0.92,
            }} />
          </div>

          {/* Glows */}
          <div className="pulse-glow" style={{
            position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: '560px', height: '280px',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.4), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-15%', right: '10%',
            width: '300px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(52,211,153,0.2), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 18px', borderRadius: '999px',
                border: '1px solid rgba(139,92,246,0.4)',
                background: 'rgba(139,92,246,0.12)',
                fontSize: '0.72rem', letterSpacing: '3px',
                textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600', marginBottom: '28px',
              }}>
              <Sparkles size={12} color="#A78BFA" />
              Ready when you are
            </motion.div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: '700',
              lineHeight: '1.08', color: 'var(--text-primary)', marginBottom: '20px', maxWidth: '700px', margin: '0 auto 20px',
            }}>
              Bring every team onto{' '}
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA, #34D399)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', fontWeight: '500',
              }}>one platform.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 44px', lineHeight: '1.8', fontWeight: '300' }}>
              Talk to our team about a demo, or jump straight into the dashboard — no credit card required.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ y: -3, boxShadow: '0 22px 55px rgba(139,92,246,0.5)' }}
                onClick={() => navigate('/login')}
                data-hover="true"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '17px 36px', background: 'linear-gradient(135deg, #8B5CF6, #34D399)',
                  color: '#0B0713', border: 'none', borderRadius: '12px',
                  fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  boxShadow: '0 14px 40px rgba(139,92,246,0.45)',
                  transition: 'box-shadow 0.3s',
                }}
              >Enter ERP Dashboard <ArrowRight size={16} strokeWidth={2.5} /></motion.button>
              <a href="mailto:hello@aminoidai.com" data-hover="true" style={{
                padding: '17px 32px', color: 'var(--text-primary)', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px',
                fontSize: '0.88rem', fontWeight: '600', fontFamily: 'var(--font-body)',
                transition: 'border-color 0.25s, background 0.25s',
                background: 'rgba(255,255,255,0.03)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >Talk to sales</a>
            </div>
          </div>
        </motion.div>

        {/* Compact contact strip */}
        <div className="contact-strip reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
          marginTop: '32px', background: 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.12)', borderRadius: '20px', overflow: 'hidden',
        }}>
          {[
            { Icon: Phone, label: 'Call us', value: '+91 11 4000 1234', color: '#34D399' },
            { Icon: Mail, label: 'Email', value: 'hello@aminoidai.com', color: '#8B5CF6' },
            { Icon: MapPin, label: 'Head office', value: 'Chennai, Tamil Nadu, India', color: '#A78BFA' },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} style={{
              background: 'rgba(31,23,53,0.6)', padding: '26px 30px',
              display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'background 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31,23,53,0.6)'; }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${color}18`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '500' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media (max-width: 700px) { .contact-strip { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}