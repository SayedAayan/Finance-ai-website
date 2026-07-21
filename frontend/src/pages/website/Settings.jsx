import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, CreditCard, ExternalLink, Sparkles, Check, CheckCircle2, Upload, AlertCircle, FileText, Mail, TrendingUp, X, Lock } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useCms } from '../../context/CmsContext';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { formatPrice } = useCurrency();
  const { cmsConfig } = useCms();
  const { currentUser, userPlan, updateUserPlan } = useAuth();
  
  // Use global userPlan instead of local state
  const activePlanId = userPlan || 'plan_free';
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState(null);

  const handleUpgradeClick = (plan) => {
    setSelectedPlanToUpgrade(plan);
    setShowPaymentModal(true);
  };
  
  const handlePaymentSuccess = () => {
    updateUserPlan(selectedPlanToUpgrade.id);
    setShowPaymentModal(false);
    setSelectedPlanToUpgrade(null);
    alert('Payment successful! Your plan has been upgraded.');
  };
  
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
                      plan.id !== 'plan_free' ? (
                        <button 
                          onClick={() => handleUpgradeClick(plan)}
                          className="btn btn-violet shadow-sm hover:shadow-md transition-all flex items-center justify-center hover:-translate-y-0.5" 
                          style={{ width: '100%', gap: '6px', borderRadius: '10px', padding: '10px', fontWeight: 700 }}
                        >
                          <Sparkles size={16} /> {plan.buttonLabel || `Upgrade to ${plan.name}`}
                        </button>
                      ) : (
                        <button 
                          className="btn flex items-center justify-center" 
                          disabled
                          style={{ width: '100%', borderRadius: '10px', padding: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'default', fontWeight: 600 }}
                        >
                          Included in your plan
                        </button>
                      )
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
                          onClick={() => setShowBillingModal(true)}
                          className="btn flex items-center justify-center transition-all" 
                          style={{ width: '100%', borderRadius: '10px', padding: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-1)', fontWeight: 700 }}
                        >
                          Manage Subscription
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanToUpgrade && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '420px', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => setShowPaymentModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '4px' }}
            >
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '12px' }}>
                <Lock size={20} color="var(--violet)" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Secure Checkout</h2>
            </div>
            
            <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Upgrade to <strong style={{ color: 'var(--text-1)' }}>{siteName} {selectedPlanToUpgrade.name}</strong> for {formatPrice(Number(selectedPlanToUpgrade.price))} / {selectedPlanToUpgrade.billingCycle === 'Monthly' ? 'month' : 'year'}.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-3)' }}>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-1)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-3)' }}>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-1)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-3)' }}>CVC / CVV</label>
                  <input type="password" placeholder="***" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-1)', outline: 'none' }} />
                </div>
              </div>
              <button 
                onClick={handlePaymentSuccess}
                className="btn btn-violet"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800, marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
              >
                Pay {formatPrice(Number(selectedPlanToUpgrade.price))}
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Shield size={12} /> Payments are secure and encrypted.
            </div>
          </div>
        </div>
      )}

      {/* Billing Portal Modal */}
      {showBillingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '420px', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => setShowBillingModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '4px' }}
            >
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '12px' }}>
                <CreditCard size={20} color="var(--violet)" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Billing Portal</h2>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)' }}>Current Plan: {activePlan.name}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>Your next billing date is {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => alert("Simulating redirect to Stripe to update payment method...")}
                className="btn btn-outline flex items-center justify-between" 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-1)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={18} /> Update Payment Method</div>
                <ExternalLink size={16} color="var(--text-3)" />
              </button>
              
              <button 
                onClick={() => alert("Simulating downloading last invoice...")}
                className="btn btn-outline flex items-center justify-between" 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-1)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Download Last Invoice</div>
                <ExternalLink size={16} color="var(--text-3)" />
              </button>
              
              <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
              
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.")) {
                    updateUserPlan('plan_free');
                    setShowBillingModal(false);
                  }
                }}
                className="btn flex items-center justify-center transition-all hover:bg-red-50" 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'transparent', color: 'var(--red)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
