import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const columns = {
    'Platform': ['Purchase & Procurement', 'Vendor Management', 'Stock Control', 'Accounts & Finance'],
    'Company':  ['Why Aminoid Ai', 'Capabilities', 'Customers', 'ERP Login'],
  };

  return (
    <footer style={{ padding: '0 5% 40px' }}>
      {/* Newsletter row */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto 64px',
        borderTop: '1px solid rgba(139,92,246,0.14)', borderBottom: '1px solid rgba(139,92,246,0.14)',
        padding: '40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '24px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px' }}>Product updates, occasionally.</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No spam — just what's new on the platform.</div>
        </div>
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="email" required placeholder="you@company.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{
              padding: '13px 18px', borderRadius: '999px', border: '1px solid rgba(139,92,246,0.3)',
              background: 'rgba(139,92,246,0.06)', color: 'var(--text-primary)', fontSize: '0.85rem',
              width: '230px', fontFamily: 'var(--font-body)', outline: 'none',
            }}
          />
          <button type="submit" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '13px 22px', borderRadius: '999px', border: 'none',
            background: 'linear-gradient(135deg, #8B5CF6, #34D399)', color: '#0B0713',
            fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>{submitted ? 'Subscribed' : 'Subscribe'} <ArrowRight size={14} /></button>
        </form>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '48px', marginBottom: '48px' }}>
        <div style={{ maxWidth: '300px' }}>
          <Logo height={30} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.8', fontWeight: '300', marginTop: '18px' }}>
            A modern, cloud-ready ERP unifying purchase, vendor, stock, accounts, and client
            management inside one connected platform.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
          {Object.entries(columns).map(([section, items]) => (
            <div key={section}>
              <h4 style={{ fontSize: '0.7rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent-bright)', fontWeight: '600', marginBottom: '18px' }}>{section}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {items.map(item => (
                  <li key={item}>
                    {item === 'ERP Login'
                      ? <button onClick={() => navigate('/login')} style={{
                          color: 'var(--text-muted)', background: 'none', border: 'none',
                          fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0,
                        }}
                        onMouseEnter={e => e.target.style.color = 'var(--accent-bright)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                        >{item}</button>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '300' }}>{item}</span>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>© {year} Aminoid Ai. All rights reserved.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Operations, Orchestrated.</p>
      </div>
    </footer>
  );
}