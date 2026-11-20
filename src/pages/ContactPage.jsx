import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(22,32,50,0.6)',
    border: `1px solid ${errors[field] ? '#ef4444' : 'rgba(201,168,76,0.2)'}`,
    borderRadius: '8px',
    color: '#F0EBE1',
    fontSize: '0.95rem',
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.72rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#F5B93A',
    fontWeight: '600',
    marginBottom: '8px',
    fontFamily: 'Outfit, sans-serif',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0D1117 0%, #0F1923 100%)',
      fontFamily: 'Outfit, sans-serif',
      paddingTop: '80px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        body { background: #0D1117; cursor: auto; }
        input::placeholder, textarea::placeholder { color: rgba(155,168,181,0.5); }
        input:focus, textarea:focus, select:focus { border-color: rgba(201,168,76,0.6) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 5%',
        background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #F5B93A, #8B6914)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: '18px', color: '#0D1117',
          }}>S</div>
          <span style={{
            fontFamily: 'Cormorant Garamond', fontSize: '1.4rem', fontWeight: '600', letterSpacing: '2px',
            background: 'linear-gradient(135deg, #E8C97A, #F5B93A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Aminoid Ai</span>
        </a>
        <a href="/" style={{
          padding: '10px 28px',
          background: 'transparent', color: '#F5B93A',
          textDecoration: 'none', border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600',
          letterSpacing: '2px', textTransform: 'uppercase',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(201,168,76,0.1)'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        >← Back to Home</a>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 5% 100px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#F5B93A', fontWeight: '600' }}>
              GET IN TOUCH
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
            fontWeight: '600', lineHeight: '1.1',
            color: '#F0EBE1', marginBottom: '20px',
          }}>
            Let's Build Something<br />
            <span style={{
              background: 'linear-gradient(135deg, #E8C97A, #F5B93A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontStyle: 'italic', fontWeight: '300',
            }}>Extraordinary Together.</span>
          </h1>
          <p style={{ color: '#A8A3C7', fontSize: '1.05rem', lineHeight: '1.8', maxWidth: '560px', margin: '0 auto' }}>
            Ready to transform your operations? Reach out and our enterprise team will respond within 24 hours.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '48px', alignItems: 'start' }}>
          {/* Left: Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '📍', title: 'Our Office', lines: ['Aminoid Ai', 'No.167/A/10, Manickampillai Street, Mannurpet, Chennai – 600 050'] },
              { icon: '📞', title: 'Phone', lines: ['+91 99999 99999', 'Mon–Sat, 9AM – 6PM IST'] },
              { icon: '✉️', title: 'Email', lines: ['xyz14@gmail.com', 'admin@xyz.co.in'] },
              { icon: '⏱️', title: 'Response Time', lines: ['Within 24 hours', 'Priority support for demos'] },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'rgba(22,32,50,0.5)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'}
              >
                <div style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#F5B93A', fontWeight: '700', marginBottom: '6px' }}>{item.title}</div>
                  {item.lines.map((line, li) => (
                    <div key={li} style={{ fontSize: '0.9rem', color: li === 0 ? '#F0EBE1' : '#A8A3C7', lineHeight: '1.6' }}>{line}</div>
                  ))}
                </div>
              </div>
            ))}

            {/* Social */}
            <div style={{
              padding: '24px',
              background: 'rgba(22,32,50,0.5)',
              border: '1px solid rgba(201,168,76,0.12)',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#F5B93A', fontWeight: '700', marginBottom: '16px' }}>Follow Us</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['LinkedIn', 'Twitter', 'YouTube'].map(s => (
                  <a key={s} href="#" style={{
                    padding: '8px 16px', borderRadius: '6px',
                    background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)',
                    color: '#A8A3C7', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '500',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { e.target.style.color = '#F5B93A'; e.target.style.borderColor = 'rgba(201,168,76,0.4)'; }}
                  onMouseLeave={e => { e.target.style.color = '#A8A3C7'; e.target.style.borderColor = 'rgba(201,168,76,0.18)'; }}
                  >{s}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div style={{
            padding: '44px',
            background: 'rgba(15,25,35,0.8)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Gold corner accent */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '120px', height: '120px',
              background: 'radial-gradient(circle at top right, rgba(201,168,76,0.08), transparent)',
            }} />

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', color: '#F0EBE1', marginBottom: '16px' }}>
                  Message Received!
                </h3>
                <p style={{ color: '#A8A3C7', lineHeight: '1.7', marginBottom: '32px' }}>
                  Thank you for reaching out. Our enterprise team will get back to you within 24 hours.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', phone: '', subject: '', message: '' }); }} style={{
                  padding: '12px 36px',
                  background: 'linear-gradient(135deg, #F5B93A, #8B6914)',
                  color: '#0D1117', border: 'none', borderRadius: '6px',
                  fontSize: '0.82rem', fontWeight: '700', letterSpacing: '2px',
                  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond', fontSize: '1.8rem',
                  color: '#F0EBE1', fontWeight: '600', marginBottom: '32px',
                }}>Send us a Message</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text" placeholder="John Smith"
                      value={form.name}
                      onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                      style={inputStyle('name')}
                    />
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email" placeholder="john@company.com"
                      value={form.email}
                      onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                      style={inputStyle('email')}
                    />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email}</p>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input
                      type="text" placeholder="Your Company"
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      style={inputStyle('company')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      type="tel" placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={inputStyle('phone')}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ ...inputStyle('subject'), appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Select a topic...</option>
                    <option>Schedule a Product Demo</option>
                    <option>Enterprise Pricing</option>
                    <option>Technical Support</option>
                    <option>Partnership Inquiry</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    placeholder="Tell us about your business needs and how we can help..."
                    rows={5}
                    value={form.message}
                    onChange={e => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: '' }); }}
                    style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '130px' }}
                  />
                  {errors.message && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.message}</p>}
                </div>

                <button type="submit" style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #F5B93A, #8B6914)',
                  color: '#0D1117', border: 'none', borderRadius: '8px',
                  fontSize: '0.88rem', fontWeight: '700', letterSpacing: '2.5px',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: '0 8px 30px rgba(201,168,76,0.3)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(201,168,76,0.5)'; }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 30px rgba(201,168,76,0.3)'; }}
                >
                  Send Message →
                </button>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.78rem', color: '#A8A3C7' }}>
                  We respond within 24 hours · No spam, ever
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
