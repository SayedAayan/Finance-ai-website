import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, CreditCard, ExternalLink, Sparkles, Check, CheckCircle2, Upload, AlertCircle, FileText, Mail, TrendingUp } from 'lucide-react';
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
    <div style={{ padding: '1.5rem 0 2rem 0', background: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.06) 0%, var(--bg-subtle) 60%)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--blue), var(--violet))', 
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <SettingsIcon size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: '1.2' }}>Account Settings</h1>
            <p style={{ color: 'var(--text-3)', margin: '2px 0 0 0', fontSize: '0.85rem' }}>Manage your notifications, broker integrations, and subscription status.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Subscription Section */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="var(--violet)" />
                </div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Subscription Plan</h3>
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

            {/* Display Available Plans */}
            {!isPremium && (
              <div style={{ marginBottom: '1rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                You are currently using the {freePlan.name} plan. Upgrade to Pro or Ultra for more features.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              {[freePlan, ...premiumPlans].map(plan => {
                const isActive = activePlanId === plan.id;
                const billingCycleLabel = plan.billingCycle === 'Monthly' ? 'month' : plan.billingCycle === 'Yearly' ? 'year' : plan.billingCycle.toLowerCase();
                return (
                  <div key={plan.id} style={{ 
                    background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))' : 'var(--bg-card)',
                    border: isActive ? '2px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--border)',
                    boxShadow: isActive ? '0 8px 30px -4px rgba(139, 92, 246, 0.15)' : '0 4px 14px -2px rgba(0,0,0,0.03)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}>
                    {isActive && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--violet)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px 14px', borderBottomLeftRadius: '12px', letterSpacing: '0.5px' }}>
                        CURRENT PLAN
                      </div>
                    )}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: '0 0 2px 0', fontWeight: 800, color: isActive ? 'var(--violet)' : 'var(--text-1)', fontSize: '1.1rem' }}>
                        {siteName} {plan.name}
                      </h4>
                      {plan.id === 'plan_free' ? (
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          Free
                        </div>
                      ) : (
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          {formatPrice(Number(plan.price))} 
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>
                            / {billingCycleLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 1.25rem 0', fontSize: '0.85rem', flex: 1 }}>
                      {(plan.features || []).map((feature, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-2)' }}>
                          <CheckCircle2 size={16} color={isActive ? "var(--violet)" : "var(--green)"} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                          <span style={{ lineHeight: '1.4' }}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!isActive ? (
                      <button 
                        onClick={() => setActivePlanId(plan.id)}
                        className="btn btn-violet shadow-sm hover:shadow-md transition-all flex items-center justify-center hover:-translate-y-0.5" 
                        style={{ width: '100%', gap: '6px', borderRadius: '10px', padding: '10px', fontWeight: 700 }}
                      >
                        <Sparkles size={16} /> {plan.id === 'plan_free' ? 'Downgrade to Basic' : plan.buttonLabel || `Upgrade to ${plan.name}`}
                      </button>
                    ) : (
                      plan.id === 'plan_free' ? (
                        <button 
                          className="btn flex items-center justify-center" 
                          disabled
                          style={{ width: '100%', borderRadius: '10px', padding: '10px', background: 'var(--neutral-100)', color: 'var(--text-3)', cursor: 'default', fontWeight: 700 }}
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button 
                          onClick={() => setActivePlanId('plan_free')}
                          className="btn btn-outline flex items-center justify-center transition-all hover:bg-red-50" 
                          style={{ width: '100%', borderRadius: '10px', padding: '10px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--red)', fontWeight: 700 }}
                        >
                          Cancel Subscription
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} color="var(--violet)" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Notification Preferences</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Mail size={18} color="var(--violet)" style={{ marginTop: '2px', opacity: 0.8 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-1)' }}>Email Alerts</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Receive instant emails for watchlist price movements.</div>
                  </div>
                </div>
                <div onClick={() => toggleNotification('emailAlerts')} style={{ width: '40px', height: '22px', borderRadius: '22px', background: notifications.emailAlerts ? 'var(--violet)' : 'var(--neutral-200)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: notifications.emailAlerts ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-100)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <FileText size={18} color="var(--violet)" style={{ marginTop: '2px', opacity: 0.8 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-1)' }}>Weekly AI Digests</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>A personalized synthesis of your portfolio health sent every Friday.</div>
                  </div>
                </div>
                <div onClick={() => toggleNotification('weeklyDigest')} style={{ width: '40px', height: '22px', borderRadius: '22px', background: notifications.weeklyDigest ? 'var(--violet)' : 'var(--neutral-200)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: notifications.weeklyDigest ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-100)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Sparkles size={18} color="var(--violet)" style={{ marginTop: '2px', opacity: 0.8 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-1)' }}>AI Insights</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Enable notification alerts for deep-dive AI summaries.</div>
                  </div>
                </div>
                <div onClick={() => toggleNotification('aiInsights')} style={{ width: '40px', height: '22px', borderRadius: '22px', background: notifications.aiInsights ? 'var(--violet)' : 'var(--neutral-200)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: notifications.aiInsights ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-100)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <TrendingUp size={18} color="var(--violet)" style={{ marginTop: '2px', opacity: 0.8 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-1)' }}>Price Alerts</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Get instantly notified when your watchlist hits target prices.</div>
                  </div>
                </div>
                <div onClick={() => toggleNotification('priceAlerts')} style={{ width: '40px', height: '22px', borderRadius: '22px', background: notifications.priceAlerts ? 'var(--violet)' : 'var(--neutral-200)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: notifications.priceAlerts ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
