import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, Users, Clock } from 'lucide-react';

function CountUp({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { value: 99, suffix: '.9%', label: 'Platform uptime', sub: 'SLA guaranteed', Icon: TrendingUp, color: '#34D399' },
  { value: 60, suffix: '%', label: 'Faster approvals', sub: 'vs manual workflows', Icon: Clock, color: '#8B5CF6' },
  { value: 500, suffix: '+', label: 'Businesses onboard', sub: 'across India', Icon: Users, color: '#A78BFA' },
  { value: 24, suffix: '/7', label: 'Live visibility', sub: 'real-time data sync', Icon: Package, color: '#34D399' },
];

export default function Stats() {
  return (
    <section style={{ padding: '0 5% 120px', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '1100px', margin: '0 auto',
          position: 'relative', overflow: 'hidden',
          borderRadius: '32px',
          background: 'rgba(31,23,53,0.5)',
          border: '1px solid rgba(139,92,246,0.22)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '32px' }}>
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, filter: 'saturate(0.3)' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(52,211,153,0.1))',
          }} />
        </div>

        {/* Pulse glow */}
        <div className="pulse-glow" style={{
          position: 'absolute', top: '-50%', left: '40%', width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.28), transparent 70%)', pointerEvents: 'none',
        }} />

        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px', pointerEvents: 'none', borderRadius: '32px',
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          padding: '60px 40px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0',
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                textAlign: 'center', position: 'relative', zIndex: 1,
                padding: '20px',
                borderRight: i < 3 ? '1px solid rgba(139,92,246,0.15)' : 'none',
              }}>
              {/* Icon */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: `${stat.color}18`, border: `1px solid ${stat.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <stat.Icon size={22} color={stat.color} />
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: '700',
                color: stat.color, lineHeight: 1, marginBottom: '8px',
              }}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 700px) {
          section > div > div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}