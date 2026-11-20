import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Why Aminoid Ai', href: '#why' },
    { label: 'Capabilities', href: '#features' },
    { label: 'Platform Tour', href: '#modules' },
    { label: 'Customers', href: '#testimonials' },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '18px 5%' }}
    >
      <div style={{
        maxWidth: '1240px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '10px 10px 10px 22px' : '14px 14px 14px 26px',
        background: scrolled ? 'rgba(21,15,38,0.75)' : 'rgba(21,15,38,0.35)',
        border: '1px solid rgba(139,92,246,0.18)',
        borderRadius: '999px',
        backdropFilter: 'blur(18px)',
        boxShadow: scrolled ? '0 12px 40px rgba(0,0,0,0.35)' : 'none',
        transition: 'all 0.35s ease',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} data-hover="true">
          <Logo height={34} />
        </a>

        <div className="nav-links" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {links.map(link => (
            <a key={link.label} href={link.href} data-hover="true" style={{
              color: 'var(--text-muted)', textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: '500',
              padding: '8px 14px', borderRadius: '999px',
              fontFamily: 'var(--font-body)',
              transition: 'color 0.25s, background 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(139,92,246,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >{link.label}</a>
          ))}
        </div>

        <button data-hover="true" onClick={() => navigate('/login')} className="nav-links" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #8B5CF6, #34D399)',
          color: '#0B0713', border: 'none',
          borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700',
          cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>
          Launch ERP <ArrowUpRight size={14} strokeWidth={3} />
        </button>

        <button className="nav-burger" data-hover="true" onClick={() => setMenuOpen(o => !o)} style={{
          display: 'none', background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '50%', width: '40px', height: '40px', color: '#fff',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            style={{
              maxWidth: '1240px', margin: '10px auto 0',
              background: 'rgba(21,15,38,0.96)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px',
              padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px',
            }}
          >
            {links.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
                color: '#fff', textDecoration: 'none', padding: '10px 8px',
                fontSize: '0.95rem', fontWeight: '600', fontFamily: 'var(--font-body)',
              }}>{link.label}</a>
            ))}
            <button onClick={() => { setMenuOpen(false); navigate('/login'); }} style={{
              marginTop: '8px', padding: '13px 20px',
              background: 'linear-gradient(135deg, #8B5CF6, #34D399)',
              color: '#0B0713', border: 'none', borderRadius: '12px',
              fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>Launch ERP</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 820px) {
          .nav-links { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>
    </motion.header>
  );
}