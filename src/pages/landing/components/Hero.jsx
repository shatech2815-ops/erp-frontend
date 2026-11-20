import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, PlayCircle, TrendingUp, Package, Wallet, Zap, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

const barHeights = [38, 62, 44, 78, 55, 90, 68, 75, 52];

/* ── Typewriter Hook ── */
function useTypewriter(words, speed = 80, pause = 1800) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(c => c + 1);
        }
      } else {
        setText(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setWordIdx(w => (w + 1) % words.length);
          setCharIdx(0);
        } else {
          setCharIdx(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
}

/* ── 3D Tilt Card ── */
function TiltCard({ children, style }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Spotlight beam ── */
function Spotlight() {
  const [pos, setPos] = useState({ x: 50, y: 30 });
  useEffect(() => {
    const move = (e) => setPos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.12), transparent 60%)`,
      transition: 'background 0.1s ease',
    }} />
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const typed = useTypewriter(['one screen.', 'one click.', 'one system.', 'real time.'], 90, 2000);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingTop: '110px' }}>
      <Spotlight />

      {/* Aurora mesh */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 55% at 10% 15%, rgba(139,92,246,0.32), transparent 60%),
          radial-gradient(ellipse 55% 50% at 88% 80%, rgba(16,185,129,0.22), transparent 55%),
          radial-gradient(ellipse 45% 40% at 65% 5%,  rgba(167,139,250,0.14), transparent 50%)
        `,
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)',
        backgroundSize: '54px 54px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)',
      }} />

      {/* Animated grain noise overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px',
      }} />

      <div style={{
        maxWidth: '1320px', margin: '0 auto', padding: '0 5%',
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center',
        position: 'relative', zIndex: 2, width: '100%',
      }}>

        {/* ── LEFT ── */}
        <div>
          {/* Announcement chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            style={{ marginBottom: '28px' }}>
            <a href="#features" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 6px 6px 14px', borderRadius: '999px',
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.38)',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)' }}>
                🚀 Now live: real-time multi-warehouse sync
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'linear-gradient(135deg,#8B5CF6,#34D399)',
                padding: '4px 12px', borderRadius: '999px',
                fontSize: '0.7rem', fontWeight: '700', color: '#0B0713',
              }}>
                New <ChevronRight size={11} strokeWidth={3} />
              </span>
            </a>
          </motion.div>

          {/* Headline with typewriter */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.06 }}
            style={{
              fontFamily: 'var(--font-display)', fontWeight: '800',
              fontSize: 'clamp(2.8rem, 5.5vw, 5rem)', lineHeight: '1.02',
              color: '#fff', marginBottom: '26px', letterSpacing: '-2px',
            }}>
            Run your business<br />from{' '}
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #34D399 80%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontStyle: 'italic', fontWeight: '700',
            }}>
              {typed}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                style={{ WebkitTextFillColor: '#34D399', fontStyle: 'normal' }}>|</motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', lineHeight: '1.85', maxWidth: '500px', marginBottom: '32px', fontWeight: '300' }}>
            Aminoid Ai merges purchasing, vendors, stock, and finance into a single connected
            system — decisions at the speed of data, not the speed of spreadsheets.
          </motion.p>

          {/* Feature trust badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65, delay: 0.13 }}
            style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '34px' }}>
            {['GST-ready invoicing', 'Multi-warehouse', 'Auto PO approval'].map(tag => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                <CheckCircle2 size={14} color="#34D399" />
                {tag}
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.15 }}
            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '52px' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #10B981 100%)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.4), 0 16px 40px rgba(139,92,246,0.4)',
                letterSpacing: '0.2px',
              }}>
              Enter ERP Dashboard <ArrowRight size={17} strokeWidth={2.5} />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              href="#modules"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '16px 28px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                fontSize: '0.92rem', fontWeight: '600', fontFamily: 'var(--font-body)',
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
              }}>
              <PlayCircle size={18} color="#34D399" /> Watch platform tour
            </motion.a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }}
            style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            {[
              ['99.9%', 'Uptime SLA', '#34D399'],
              ['60%',   'Faster approvals', '#A78BFA'],
              ['500+',  'Businesses live', '#34D399'],
            ].map(([n, l, c]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: c, fontWeight: '800', letterSpacing: '-1px' }}>{n}</div>
                <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px', letterSpacing: '0.3px' }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: 3D tilt dashboard ── */}
        <TiltCard style={{ position: 'relative', height: '600px' }}>
          {/* Main glassmorphism dashboard card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', top: '6%', left: '2%', right: '2%',
              background: 'rgba(15,10,35,0.75)', border: '1px solid rgba(139,92,246,0.28)',
              borderRadius: '24px', overflow: 'hidden',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 50px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>

            {/* Browser chrome */}
            <div style={{
              padding: '12px 18px', borderBottom: '1px solid rgba(139,92,246,0.12)',
              background: 'rgba(139,92,246,0.06)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
                padding: '4px 12px', fontSize: '0.66rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
              }}>app.aminoidai.com/dashboard</div>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap size={13} color="#34D399" />
              </motion.div>
            </div>

            <div style={{ padding: '18px 20px' }}>
              {/* KPI row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Revenue MTD', val: '₹42.8L', delta: '+18%', up: true, col: '#8B5CF6' },
                  { label: 'Open POs',    val: '124',    delta: '3 urgent', up: false, col: '#F59E0B' },
                  { label: 'Stock Value', val: '₹1.2Cr', delta: '+6%', up: true, col: '#34D399' },
                ].map((m,i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    style={{
                      background: `${m.col}0d`, border: `1px solid ${m.col}25`,
                      borderRadius: '11px', padding: '11px 13px',
                    }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', fontWeight: '700' }}>{m.val}</div>
                    <div style={{ fontSize: '0.6rem', color: m.up ? '#34D399' : '#FBBF24', marginTop: '2px', fontWeight: '600' }}>{m.delta}</div>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <div style={{
                background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)',
                borderRadius: '13px', padding: '13px 15px', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.45)', fontWeight: '600', letterSpacing: '0.3px' }}>Revenue · Last 9 Months</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: '#34D399', fontWeight: '700' }}>
                    <TrendingUp size={10} /> +24.3%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '72px' }}>
                  {barHeights.map((h,i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ duration: 0.9, delay: 0.55 + i * 0.05 }}
                      style={{
                        flex: 1, borderRadius: '4px 4px 2px 2px',
                        background: i === 7
                          ? 'linear-gradient(180deg,#34D399,#10B981)'
                          : i === barHeights.length-1
                          ? 'linear-gradient(180deg,#8B5CF6,#6D28D9)'
                          : 'linear-gradient(180deg,rgba(139,92,246,0.65),rgba(139,92,246,0.15))',
                      }} />
                  ))}
                </div>
              </div>

              {/* Bottom two panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.14)', borderRadius: '11px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent POs</div>
                  {[['Tata Steel','₹2.4L','#34D399'],['Reliance','₹5.8L','#FBBF24'],['Infosys','₹1.1L','#34D399']].map(([v,a,c]) => (
                    <div key={v} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>{v}</span>
                      <span style={{ fontSize: '0.6rem', color: c, fontWeight: '700' }}>{a}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.14)', borderRadius: '11px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inventory</div>
                  {[['Optimal',68,'#34D399'],['Low Stock',22,'#FBBF24'],['Critical',10,'#F87171']].map(([l,p,c]) => (
                    <div key={l} style={{ marginBottom: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)' }}>{l}</span>
                        <span style={{ fontSize: '0.58rem', color: c }}>{p}%</span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 1.1, delay: 0.9 }}
                          style={{ height: '100%', background: c, borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating card: Stock */}
          <motion.div
            animate={{ y: [0,-14,0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '0%', right: '-5%', width: '175px',
              background: 'rgba(15,10,35,0.92)', border: '1px solid rgba(52,211,153,0.4)',
              borderRadius: '16px', padding: '14px', backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={13} color="#34D399" />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Stock Health</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#34D399', fontWeight: '800' }}>Optimal</div>
            <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>All 12 warehouses synced</div>
          </motion.div>

          {/* Floating card: Finance */}
          <motion.div
            animate={{ y: [0,16,0] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{
              position: 'absolute', bottom: '2%', left: '-4%', width: '195px',
              background: 'rgba(15,10,35,0.92)', border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '16px', padding: '14px', backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={13} color="#A78BFA" />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Pending Approvals</span>
            </div>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '4px', borderRadius: '3px', background: i<=2 ? '#8B5CF6' : 'rgba(139,92,246,0.2)' }} />)}
            </div>
            <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.3)' }}>2 of 3 approved · ₹8.6L</div>
          </motion.div>

          {/* Auto-approval notification */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: [0,1,1,0], x: [24,0,0,0] }}
            transition={{ duration: 4, delay: 2.5, repeat: Infinity, repeatDelay: 9 }}
            style={{
              position: 'absolute', bottom: '24%', right: '-3%', width: '195px',
              background: 'rgba(15,10,35,0.96)', border: '1px solid rgba(52,211,153,0.45)',
              borderRadius: '12px', padding: '11px 14px', backdropFilter: 'blur(24px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
              <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }} />
              </motion.div>
              <span style={{ fontSize: '0.63rem', color: '#34D399', fontWeight: '700' }}>PO Auto-Approved</span>
            </div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>₹3.2L · Tata Chemicals Ltd</div>
          </motion.div>

          {/* Sparkle accent */}
          <motion.div
            animate={{ rotate: [0,360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', top: '14%', left: '-2%' }}>
            <Sparkles size={22} color="rgba(139,92,246,0.5)" />
          </motion.div>
        </TiltCard>
      </div>

      <style>{`
        @media (max-width: 980px) {
          section > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          section > div > div:last-child { height: 360px !important; }
        }
      `}</style>
    </section>
  );
}