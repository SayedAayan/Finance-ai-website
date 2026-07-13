import React from 'react';
import { PiggyBank, Sparkles } from 'lucide-react';

export default function WealthBucket() {
  return (
    <div style={{ padding: '2rem 0 4rem 0', background: 'var(--bg-subtle)', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--blue), var(--violet))',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <PiggyBank size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Wealth Bucket</h1>
            <p style={{ color: 'var(--text-3)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Goal-based investing baskets, curated for your financial milestones.</p>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Sparkles size={28} style={{ color: 'var(--violet)' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Coming Soon</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', maxWidth: '480px', lineHeight: '1.6' }}>
            We're building curated, goal-based investment buckets — retirement, home down payment, education, and more. Check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
