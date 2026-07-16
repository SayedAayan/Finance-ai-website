import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, CreditCard, ExternalLink, Sparkles, Check, CheckCircle2, Upload, AlertCircle, FileText } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function Settings() {
  const { formatPrice } = useCurrency();
  const [premium, setPremium] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    aiInsights: true,
    priceAlerts: true
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };


  return (
    <div style={{ padding: '2rem 0 4rem 0', background: 'var(--bg-subtle)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
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
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Account Settings</h1>
            <p style={{ color: 'var(--text-3)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Manage your notifications, broker integrations, and subscription status.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Subscription Section */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard className="text-primary-600" size={20} color="var(--violet)" />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Subscription Plan</h3>
              </div>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                padding: '4px 10px', 
                borderRadius: '20px', 
                background: premium ? 'rgba(139, 92, 246, 0.1)' : '#f3f4f6',
                color: premium ? 'var(--violet)' : '#4b5563'
              }}>
                {premium ? 'PRO ACTIVE' : 'FREE PLAN'}
              </span>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--text-1)' }}>
                  {premium ? 'You enjoy StockBuzz Pro benefits!' : 'Upgrade to StockBuzz Pro'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                  Unlock portfolio sync, automated PDF statements scanning, and unlimited AI analysis.
                </p>
              </div>

              {!premium ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0 16px 0', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)' }}>
                      <CheckCircle2 size={14} color="var(--green)" /> Real-time alerts & Demat sync
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)' }}>
                      <CheckCircle2 size={14} color="var(--green)" /> Extended page-context AI queries
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)' }}>
                      <CheckCircle2 size={14} color="var(--green)" /> Premium-only stock and fund screens
                    </div>
                  </div>
                  <button 
                    onClick={() => setPremium(true)}
                    className="btn btn-violet" 
                    style={{ width: '100%', gap: '8px', borderRadius: '10px' }}
                  >
                    <Sparkles size={14} /> Upgrade for {formatPrice(299)} / month
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setPremium(false)}
                  className="btn btn-outline" 
                  style={{ width: '100%', borderRadius: '10px' }}
                >
                  Downgrade Plan
                </button>
              )}
            </div>
          </div>



          {/* Notifications Preferences */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <Bell className="text-primary-600" size={20} color="var(--violet)" />
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Notification Preferences</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-1)' }}>Email Alerts</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Receive instant emails for watchlist price movements.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.emailAlerts}
                  onChange={() => toggleNotification('emailAlerts')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-100)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-1)' }}>Weekly AI Digests</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>A personalized synthesis of your portfolio health sent every Friday.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.weeklyDigest}
                  onChange={() => toggleNotification('weeklyDigest')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-100)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-1)' }}>AI Insights</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Enable notification alerts for deep-dive AI summaries.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.aiInsights}
                  onChange={() => toggleNotification('aiInsights')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
