import React, { useState, useEffect } from 'react';

const BG_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=90', label: 'Industrial Control Room' },
  { src: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1920&q=90', label: 'Global Shipping Port' },
  { src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=90', label: 'Smart Manufacturing Plant' },
  { src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=90', label: 'Digital Transformation' },
  { src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=90', label: 'Data Center Operations' },
  { src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=90', label: 'Enterprise City Network' },
];

const KB_TRANSFORMS = [
  { from: 'scale(1.22) translate(-4%, -3%)', to: 'scale(1.0) translate(4%, 3%)' },
  { from: 'scale(1.0)  translate(4%,  3%)',  to: 'scale(1.2) translate(-5%, 0%)' },
  { from: 'scale(1.18) translate(0%, -5%)',  to: 'scale(1.0) translate(0%, 5%)' },
  { from: 'scale(1.0)  translate(-5%, 0%)',  to: 'scale(1.2) translate(5%, -3%)' },
  { from: 'scale(1.2)  translate(3%,  4%)',  to: 'scale(1.0) translate(-3%, -4%)' },
  { from: 'scale(1.0)  translate(-3%, -4%)', to: 'scale(1.18) translate(3%, 4%)' },
];

const SLIDE_DURATION = 8000;
const FADE_DURATION  = 2000;

export default function AnimatedBackground() {
  const [current, setCurrent] = useState(0);
  const [next,    setNext]    = useState(1);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % BG_IMAGES.length);
        setNext(c    => (c + 2) % BG_IMAGES.length);
        setFading(false);
      }, FADE_DURATION);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const kb = idx => KB_TRANSFORMS[idx % KB_TRANSFORMS.length];

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

        {/* ── Image layers ── */}
        <div key={`cur-${current}`} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BG_IMAGES[current].src})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          animation: `kbZoom ${SLIDE_DURATION + FADE_DURATION}ms ease-in-out forwards`,
          '--kb-from': kb(current).from, '--kb-to': kb(current).to,
        }} />
        <div key={`nxt-${next}`} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BG_IMAGES[next].src})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: fading ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          animation: `kbZoom ${SLIDE_DURATION + FADE_DURATION}ms ease-in-out forwards`,
          '--kb-from': kb(next).from, '--kb-to': kb(next).to,
        }} />

        {/* ── Layered overlays ── */}

        {/* 1. Primary dark tint */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,4,18,0.78)' }} />

        {/* 2. Aurora gradient — animated */}
        <div className="aurora-layer" style={{ position: 'absolute', inset: 0 }} />

        {/* 3. Brand mesh */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 65% 55% at 8%  -5%,  rgba(139,92,246,0.30), transparent 60%),
            radial-gradient(ellipse 55% 50% at 95% 105%, rgba(16,185,129,0.22),  transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(79,70,229,0.08),   transparent 60%)
          `,
        }} />

        {/* 4. Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 120% 90% at 50% 50%, transparent 35%, rgba(7,4,18,0.65) 100%)',
        }} />

        {/* 5. Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 30%, black 20%, transparent 100%)',
        }} />

        {/* 6. Noise grain */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        {/* 7. Scanlines */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
        }} />

        {/* 8. Floating orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* 9. Sweeping light beam */}
        <div className="light-beam" />

        {/* 10. Slide indicator */}
        <div style={{
          position: 'absolute', bottom: '22px', left: '28px',
          display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.4,
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {BG_IMAGES.map((_, i) => (
              <div key={i} style={{
                width: i === current ? '22px' : '5px', height: '3px', borderRadius: '3px',
                background: i === current ? '#34D399' : 'rgba(255,255,255,0.3)',
                transition: 'width 0.5s ease, background 0.5s ease',
              }} />
            ))}
          </div>
          <span style={{ fontSize: '0.55rem', color: '#fff', fontFamily: 'monospace', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            {BG_IMAGES[current].label}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes kbZoom {
          from { transform: var(--kb-from, scale(1)); }
          to   { transform: var(--kb-to,   scale(1.1)); }
        }

        /* Aurora animation */
        @keyframes aurora {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .aurora-layer {
          background: linear-gradient(
            130deg,
            rgba(139,92,246,0.0) 0%,
            rgba(139,92,246,0.18) 20%,
            rgba(52,211,153,0.12) 40%,
            rgba(79,70,229,0.16) 60%,
            rgba(16,185,129,0.1) 80%,
            rgba(139,92,246,0.0) 100%
          );
          background-size: 400% 400%;
          animation: aurora 18s ease infinite;
          mix-blend-mode: screen;
        }

        /* Orbs */
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(50px,-70px) scale(1.12); }
          66%      { transform: translate(-35px,35px) scale(0.92); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-60px,50px) scale(1.1); }
          70%      { transform: translate(40px,-25px) scale(0.9); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-55px) scale(1.06); }
        }
        .bg-orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
        .bg-orb-1 {
          width: 580px; height: 580px; top: -130px; left: -100px;
          background: radial-gradient(circle, rgba(139,92,246,0.24), transparent 70%);
          animation: orbFloat1 20s ease-in-out infinite;
        }
        .bg-orb-2 {
          width: 480px; height: 480px; bottom: -100px; right: -70px;
          background: radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%);
          animation: orbFloat2 24s ease-in-out infinite;
        }
        .bg-orb-3 {
          width: 360px; height: 360px; top: 45%; left: 55%;
          background: radial-gradient(circle, rgba(167,139,250,0.14), transparent 70%);
          animation: orbFloat3 16s ease-in-out infinite;
        }

        /* Sweeping light beam */
        @keyframes beamSweep {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          5%   { opacity: 1; }
          45%  { opacity: 0.6; }
          50%  { transform: translateX(200%) skewX(-15deg); opacity: 0; }
          100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
        }
        .light-beam {
          position: absolute;
          top: 0; bottom: 0;
          width: 120px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.08), rgba(255,255,255,0.04), rgba(139,92,246,0.08), transparent);
          animation: beamSweep 12s ease-in-out infinite;
          animation-delay: 3s;
        }
      `}</style>
    </>
  );
}
