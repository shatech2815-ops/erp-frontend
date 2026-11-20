import React, { useEffect, useRef, useState } from 'react';
import Navbar from './landing/components/Navbar';
import Hero from './landing/components/Hero';
import About from './landing/components/About';
import Stats from './landing/components/Stats';
import Features from './landing/components/Features';
import Modules from './landing/components/Modules';
import Testimonials from './landing/components/Testimonials';
import CtaSection from './landing/components/CtaSection';
import Footer from './landing/components/Footer';
import AnimatedBackground from './landing/components/AnimatedBackground';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      /* Aminoid Ai brand palette — violet + emerald on deep plum-black */
      --primary: #8B5CF6;
      --primary-light: #A78BFA;
      --primary-dark: #5B21B6;
      --deep: #0B0713;
      --navy: #150F26;
      --slate: #1F1735;
      --slate-light: #2D2350;
      --text-primary: #F4F1FB;
      --text-muted: #A79FC4;
      --accent: #10B981;
      --accent-bright: #34D399;
      --font-display: 'Space Grotesk', sans-serif;
      --font-body: 'Manrope', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--deep);
      color: var(--text-primary);
      font-family: var(--font-body);
      cursor: none;
      overflow-x: hidden;
    }

    /* Ensure all landing sections sit above the fixed background */
    #landing-page {
      position: relative;
      z-index: 1;
    }

    /* Custom cursor */
    .cursor-dot {
      width: 6px; height: 6px;
      background: var(--accent-bright);
      border-radius: 50%;
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: transform 0.05s ease;
    }
    .cursor-ring {
      width: 36px; height: 36px;
      border: 1.5px solid var(--primary-light);
      border-radius: 50%;
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      transition: all 0.12s ease;
      opacity: 0.7;
    }
    .cursor-ring.hovering {
      width: 56px; height: 56px;
      background: rgba(139,92,246,0.10);
      border-color: var(--accent-bright);
      opacity: 1;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--deep); }
    ::-webkit-scrollbar-thumb { background: linear-gradient(var(--primary), var(--accent)); border-radius: 2px; }

    /* Scroll reveal */
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1);
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }

    /* Brand gradient text */
    .grad-text {
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Floating shapes — ambient motion used across sections */
    @keyframes floatSlow {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(18px, -26px) rotate(8deg); }
    }
    @keyframes floatSlower {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(-22px, 20px) rotate(-6deg); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.08); }
    }
    @keyframes aminoidaiSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .float-shape-a { animation: floatSlow 9s ease-in-out infinite; }
    .float-shape-b { animation: floatSlower 11s ease-in-out infinite; }
    .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
    .aminoidai-orbit-dot { transform-origin: 22px 22px; animation: aminoidaiSpin 14s linear infinite; }

    /* Section spacing */
    section { padding: 100px 0; }

    /* ── Let the animated background bleed through every section ── */
    #landing-page section {
      background: transparent !important;
    }

    /* Footer frost */
    #landing-page footer {
      background: rgba(7,4,18,0.6) !important;
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(139,92,246,0.15);
    }

    /* Glowing card hover — apply globally */
    [data-glow]:hover {
      box-shadow: 0 0 0 1px rgba(139,92,246,0.5), 0 20px 60px rgba(139,92,246,0.2) !important;
    }

    /* Ticker scroll */
    @keyframes tickerScroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    /* Animated gradient border utility */
    @keyframes borderRotate {
      from { --angle: 0deg; }
      to   { --angle: 360deg; }
    }
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    .grad-border {
      border: 1px solid;
      border-image: conic-gradient(from var(--angle), #8B5CF6, #34D399, #A78BFA, #8B5CF6) 1;
      animation: borderRotate 4s linear infinite;
    }

    @media (max-width: 768px) {
      section { padding: 60px 0; }
      body { cursor: auto; }
      .cursor-dot, .cursor-ring { display: none; }
    }
  `}</style>
);

export default function HomePage() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
      if (ringRef.current) {
        ringRef.current.style.left = e.clientX + 'px';
        ringRef.current.style.top = e.clientY + 'px';
      }
    };

    const handleHover = () => setIsHovering(true);
    const handleLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', moveCursor);

    const interactables = document.querySelectorAll('a, button, [data-hover]');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleHover);
      el.addEventListener('mouseleave', handleLeave);
    });

    // Scroll reveal
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <>
      <GlobalStyles />

      {/* Cinematic animated industry background — fixed, behind everything */}
      <AnimatedBackground />

      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className={`cursor-ring ${isHovering ? 'hovering' : ''}`} />

      <div id="landing-page">
        {/* ── Announcement ticker ── */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(139,92,246,0.25), rgba(52,211,153,0.15), rgba(139,92,246,0.25))',
          borderBottom: '1px solid rgba(139,92,246,0.25)',
          padding: '9px 0', overflow: 'hidden', position: 'relative', zIndex: 100,
        }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'tickerScroll 28s linear infinite', gap: '80px', alignItems: 'center' }}>
            {[
              '🚀 Real-time inventory sync across all warehouses',
              '✅ GST-ready financial reporting for Indian businesses',
              '⚡ Auto PO approval workflows — 60% faster',
              '🏭 500+ enterprises running on Aminoid Ai',
              '🔒 Role-based access control for every team',
              '📊 Live analytics dashboards updated every 30s',
              '🚀 Real-time inventory sync across all warehouses',
              '✅ GST-ready financial reporting for Indian businesses',
              '⚡ Auto PO approval workflows — 60% faster',
              '🏭 500+ enterprises running on Aminoid Ai',
              '🔒 Role-based access control for every team',
              '📊 Live analytics dashboards updated every 30s',
            ].map((item, i) => (
              <span key={i} style={{
                fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)', letterSpacing: '0.3px', fontWeight: '500',
              }}>{item}</span>
            ))}
          </div>
        </div>
        <Navbar />
        <Hero />
        <About />
        <Stats />
        <Features />
        <Modules />
        <Testimonials />
        <CtaSection />
        <Footer />
      </div>
    </>
  );
}