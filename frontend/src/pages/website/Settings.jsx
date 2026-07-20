import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, CreditCard, ExternalLink, Sparkles, Check, CheckCircle2, Upload, AlertCircle, FileText } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useCms } from '../../context/CmsContext';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { formatPrice } = useCurrency();
  const { cmsConfig } = useCms();
  const { currentUser } = useAuth();
  
  // Simulated state for demonstration purposes. In reality, this would be tied to a billing portal/backend.
  const [activePlanId, setActivePlanId] = useState(currentUser?.isPro ? 'plan_pro' : 'plan_free');
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    aiInsights: true,
    priceAlerts: true
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Extract pricing info from CMS
  const plans = cmsConfig?.pricing?.plans || [];
  const freePlan = plans.find(p => p.id === 'plan_free') || { name: 'Basic', features: [] };
  const premiumPlans = plans.filter(p => p.id !== 'plan_free');
  
  const activePlan = plans.find(p => p.id === activePlanId) || freePlan;
  const isPremium = activePlanId !== 'plan_free';

  const siteName = cmsConfig?.global?.siteName || 'StockBuzz';

  return (
    <div style={{ padding: '1.5rem 0 2rem 0', background: 'var(--bg-subtle)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Account Settings</h1>
            <p style={{ color: 'var(--text-3)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage your notifications, broker integrations, and subscription status.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Subscription Section */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard className="text-primary-600" size={20} color="var(--violet)" />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Subscription Plan</h3>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '4px 10px', 
                borderRadius: '20px', 
                background: isPremium ? 'rgba(139, 92, 246, 0.1)' : '#f3f4f6',
                color: isPremium ? 'var(--violet)' : '#4b5563',
                textTransform: 'uppercase'
              }}>
                {activePlan.name} PLAN
              </span>
            </div>

            {/* Display Available Premium Plans */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {premiumPlans.map(plan => {
                const isActive = activePlanId === plan.id;
                const billingCycleLabel = plan.billingCycle === 'Monthly' ? 'month' : plan.billingCycle === 'Yearly' ? 'year' : plan.billingCycle.toLowerCase();
                return (
                  <div key={plan.id} style={{ 
                    background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))' : 'var(--bg-card)',
                    border: isActive ? '2px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {isActive && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--violet)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px 14px', borderBottomLeftRadius: '12px', letterSpacing: '0.5px' }}>
                        CURRENT PLAN
                      </div>
                    )}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontWeight: 800, color: isActive ? 'var(--violet)' : 'var(--text-1)', fontSize: '1.15rem' }}>
                        {siteName} {plan.name}
                      </h4>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        {formatPrice(Number(plan.price))} 
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>
                          / {billingCycleLabel}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 0 1rem 0', fontSize: '0.85rem', flex: 1 }}>
                      {(plan.features || []).map((feature, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-2)' }}>
                          <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: '1px' }} /> 
                          <span style={{ lineHeight: '1.3' }}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!isActive ? (
                      <button 
                        onClick={() => setActivePlanId(plan.id)}
                        className="btn btn-violet" 
                        style={{ width: '100%', gap: '8px', borderRadius: '12px', padding: '10px' }}
                      >
                        <Sparkles size={16} /> {plan.buttonLabel || `Upgrade to ${plan.name}`}
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActivePlanId('plan_free')}
                        className="btn btn-outline" 
                        style={{ width: '100%', borderRadius: '12px', padding: '10px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--red)' }}
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                );
              })}
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
