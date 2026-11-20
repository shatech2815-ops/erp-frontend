import React from 'react';
import logoImg from '../../../assets/aminoid_logo.png';

export default function Logo({ height = 40, showWordmark = true, light = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img src={logoImg} alt="Aminoid Ai" style={{ height: height, objectFit: 'contain' }} />
    </div>
  );
}