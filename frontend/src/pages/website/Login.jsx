import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  PieChart,
  Newspaper,
  Eye,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { setupRecaptcha, resetRecaptcha } from '../../firebase';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

const COUNTRY_CODE = '+91';

export default function Login() {
  const { loginWithGoogle, loginWithPhone, loginWithLocalPhone, loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  // Master Auth State
  const [authIntent, setAuthIntent] = useState('login'); // 'login' | 'signup'
  const [method, setMethod] = useState('google'); // 'google' | 'mobile' | 'email'
  const [rememberMe, setRememberMe] = useState(true);
  const [formStep, setFormStep] = useState('auth'); // 'auth' | 'set-name'

  // Input states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState('enter-phone');

  // Intermediate states for set-name step
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLocalOtp, setIsLocalOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map Firebase errors to friendly messages
  const friendlyError = (err) => {
    const code = err?.code || '';
    if (code === 'auth/user-not-found') return 'No account found with this email. Please create an account.';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Incorrect password. Please try again.';
    if (code === 'auth/email-already-in-use') return 'An account already exists with this email. Switch to Login.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
    return err.message || 'Authentication failed. Please try again.';
  };

  // Helper to initiate display name step or redirect
  const handleAuthSuccess = (user) => {
    setAuthenticatedUser(user);
    if (authIntent === 'signup') {
      setFormStep('set-name');
    } else {
      if (user) {
        sessionStorage.setItem('mockUser', JSON.stringify(user));
      }
      if (user?.isSuperadmin) {
        navigate('/superadmin', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (authIntent === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      let user;
      if (authIntent === 'signup') {
        user = await signUpWithEmail(email, password, '');
      } else {
        user = await loginWithEmail(email, password);
      }
      handleAuthSuccess(user);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      handleAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    // Always use local mock OTP in localhost to prevent Recaptcha / API Key block issues
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const res = await fetch('http://127.0.0.1:3001/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setIsLocalOtp(true);
        setPhoneStep('enter-otp');
        return;
      } catch (localErr) {
        setError(localErr.message || 'Failed to send local OTP.');
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await loginWithPhone(`${COUNTRY_CODE}${phoneNumber}`, verifier);
      setConfirmationResult(result);
      setIsLocalOtp(false);
      setPhoneStep('enter-otp');
    } catch (err) {
      resetRecaptcha();
      if (err?.code === 'auth/billing-not-enabled') {
        try {
          const res = await fetch('http://127.0.0.1:3001/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneNumber })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setIsLocalOtp(true);
          setPhoneStep('enter-otp');
          return;
        } catch (localErr) {
          setError(localErr.message || 'Failed to send local OTP.');
        }
      } else {
        setError(err.message || 'Could not send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code sent to your phone.');
      return;
    }
    setLoading(true);
    try {
      let user;
      if (isLocalOtp) {
        user = await loginWithLocalPhone(phoneNumber, otp);
      } else {
        const credential = await confirmationResult.confirm(otp);
        user = credential.user;
      }
      handleAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Incorrect code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNameSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please choose a display name.');
      return;
    }
    setLoading(true);
    try {
      if (authenticatedUser) {
        authenticatedUser.displayName = fullName;
        sessionStorage.setItem('mockUser', JSON.stringify(authenticatedUser));
      }
      if (authenticatedUser?.isSuperadmin) {
        navigate('/superadmin', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile name.');
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setPhoneStep('enter-phone');
    setOtp('');
    setConfirmationResult(null);
    setError(null);
    resetRecaptcha();
  };

  return (
    <div className="stockbuzz-ai-root">
      {/* Google Fonts - Loaded Hanken Grotesk & Inter (Optimal modern neo-grotesque sans-serif pack) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Layered Background Engine */}
      <div className="sb-bg-mesh" />
      <div className="sb-bg-dots" />
      <div className="sb-radial-glow glow-1" />
      <div className="sb-radial-glow glow-2" />

      {/* Top Header Navigation */}
      <header className="sb-top-nav">
        <div className="sb-nav-left">
          <Link to="/" className="sb-back-btn">
            <ArrowLeft size={14} />
            <span>Back to Website</span>
          </Link>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="sb-main-canvas">
        <div className="sb-viewport-grid">

          {/* LEFT HERO SIDE */}
          <motion.div
            className="sb-hero-side"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Stockbuzz Brand Logo Lockup */}
            <div className="sb-brand-lockup">
              <img src="/favicon.png" alt="Stockbuzz" className="sb-brand-logo-img" />
              <span className="sb-brand-logo-text">STOCKBUZZ</span>
            </div>

            <h1 className="sb-hero-heading">
              Financial Intelligence, <br />
              <span className="sb-title-blue">Powered by Stockbuzz AI.</span>
            </h1>

            <p className="sb-hero-subtext">
              Real-time capital flow synthesis, automated market reasoning, and predictive portfolio intelligence in one seamless terminal.
            </p>

            {/* AI VISUALIZATION HUB */}
            <div className="sb-ai-visual-hub">

              {/* Subdued Connector Lines */}
              <svg className="sb-connector-svg" viewBox="0 0 560 360">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <line x1="280" y1="180" x2="90" y2="55" stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 4" />
                <line x1="280" y1="180" x2="470" y2="55" stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 4" />
                <line x1="280" y1="180" x2="50" y2="180" stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 4" />
                <line x1="280" y1="180" x2="510" y2="180" stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 4" />
                <line x1="280" y1="180" x2="105" y2="305" stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 4" />
                <line x1="280" y1="180" x2="455" y2="305" stroke="url(#lineGrad)" strokeWidth="1.2" strokeDasharray="4 4" />
              </svg>

              {/* CENTRAL GLASS ORB HUB */}
              <div className="sb-ai-core-hub">
                <div className="sb-ai-core-glass">
                  <img src="/favicon.png" alt="Stockbuzz Favicon" className="sb-core-favicon" />
                  <span className="sb-core-label">Stockbuzz AI</span>
                </div>
              </div>

              {/* 6 FLOATING WORKSPACE CARDS */}
              <div className="sb-floating-card pos-c1 anim-float-y1">
                <div className="sb-card-icon blue"><PieChart size={17} /></div>
                <div>
                  <div className="sb-card-title">Portfolio Intelligence</div>
                  <div className="sb-card-sub">+18.4% Auto Yield</div>
                </div>
              </div>

              <div className="sb-floating-card pos-c2 anim-float-y2">
                <div className="sb-card-icon cyan"><Sparkles size={17} /></div>
                <div>
                  <div className="sb-card-title">Today's Opportunity</div>
                  <div className="sb-card-sub">96 AI Score • Bullish</div>
                </div>
              </div>

              <div className="sb-floating-card pos-c3 anim-float-x1">
                <div className="sb-card-icon indigo"><Eye size={17} /></div>
                <div>
                  <div className="sb-card-title">Watchlist Radar</div>
                  <div className="sb-card-sub">12 Live Targets</div>
                </div>
              </div>

              <div className="sb-floating-card pos-c4 anim-float-x2">
                <div className="sb-card-icon violet"><Newspaper size={17} /></div>
                <div>
                  <div className="sb-card-title">Market News</div>
                  <div className="sb-card-sub">NLP Sentiment Sync</div>
                </div>
              </div>

              <div className="sb-floating-card pos-c5 anim-float-y2">
                <div className="sb-card-icon emerald"><Globe size={17} /></div>
                <div>
                  <div className="sb-card-title">Global Markets</div>
                  <div className="sb-card-sub">NSE • BSE • US Realtime</div>
                </div>
              </div>

              <div className="sb-floating-card pos-c6 anim-float-y1">
                <div className="sb-card-icon amber"><Activity size={17} /></div>
                <div>
                  <div className="sb-card-title">Risk Analysis</div>
                  <div className="sb-card-sub">Optimal Volatility</div>
                </div>
              </div>

            </div>

            {/* BOTTOM FEATURE BADGES */}
            <div className="sb-bottom-features-wrapper">
              <div className="sb-bottom-features">
                <span className="sb-feat-item"><Zap size={13} className="sb-feat-icon" /> Sub-ms Processing</span>
                <span className="sb-feat-item"><ShieldCheck size={13} className="sb-feat-icon" /> Bank-Grade Encryption</span>
                <span className="sb-feat-item"><Globe size={13} className="sb-feat-icon" /> Global Data Security</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            className="sb-card-side"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="sb-auth-panel">

              <AnimatePresence mode="wait">
                {formStep === 'auth' ? (
                  <motion.div
                    key="step-auth"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="sb-panel-inner"
                  >
                    {/* CARD HEADER WITH BRAND LOGO LOCKUP */}
                    <div className="sb-card-header">
                      <div className="sb-card-brand-pill">
                        <img src="/favicon.png" alt="Stockbuzz" className="sb-header-logo-img" />
                        <span className="sb-card-brand-name">Stockbuzz</span>
                      </div>
                      <h2 className="sb-card-heading">
                        {authIntent === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                      </h2>
                      <p className="sb-card-subheading">
                        {authIntent === 'signup' ? 'Start your AI-powered investment journey' : 'Access your AI Investment Terminal'}
                      </p>
                    </div>

                    {/* SEGMENTED CONTROL */}
                    <div className="sb-seg-wrapper">
                      <div className="sb-seg-bar primary-switch">
                        <button
                          type="button"
                          onClick={() => { setAuthIntent('login'); setError(null); }}
                          className={`sb-seg-btn ${authIntent === 'login' ? 'active' : ''}`}
                        >
                          {authIntent === 'login' && (
                            <motion.div layoutId="intentPill" className="sb-pill-active" transition={{ type: 'spring', stiffness: 450, damping: 35 }} />
                          )}
                          <span className="sb-seg-text">Login</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setAuthIntent('signup'); setError(null); }}
                          className={`sb-seg-btn ${authIntent === 'signup' ? 'active' : ''}`}
                        >
                          {authIntent === 'signup' && (
                            <motion.div layoutId="intentPill" className="sb-pill-active" transition={{ type: 'spring', stiffness: 450, damping: 35 }} />
                          )}
                          <span className="sb-seg-text">Create Account</span>
                        </button>
                      </div>
                    </div>

                    {/* AUTH METHOD SWITCHER */}
                    <div className="sb-seg-wrapper">
                      <div className="sb-seg-bar method-switch">
                        {[
                          { id: 'google', label: 'Google' },
                          { id: 'mobile', label: 'Mobile' },
                          { id: 'email', label: 'Email' }
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => { setMethod(m.id); setError(null); }}
                            className={`sb-seg-btn ${method === m.id ? 'active' : ''}`}
                          >
                            {method === m.id && (
                              <motion.div layoutId="methodPill" className="sb-pill-active sub" transition={{ type: 'spring', stiffness: 450, damping: 35 }} />
                            )}
                            <span className="sb-seg-text">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Alert Box */}
                    {error && (
                      <div className="sb-error-box">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* FORM BODY */}
                    <div className="sb-form-body">
                      {/* METHOD 1: Google Flow */}
                      {method === 'google' && (
                        <div className="google-flow-wrapper">
                          <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="sb-google-btn"
                          >
                            {loading ? (
                              <Loader2 size={16} className="sb-spin" />
                            ) : (
                              <>
                                <GoogleIcon />
                                <span>Continue with Google</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* METHOD 2: Email Flow */}
                      {method === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="sb-form-stack">
                          <div className="sb-input-group">
                            <label className="sb-label">Email Address</label>
                            <div className="sb-input-box">
                              <Mail size={14} className="sb-input-icon" />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="sb-input-control"
                                required
                              />
                            </div>
                          </div>

                          <div className="sb-input-group">
                            <div className="label-flex-row">
                              <label className="sb-label">Password</label>
                              {authIntent === 'login' && (
                                <a href="#" onClick={(e) => { e.preventDefault(); setError('Password reset instructions sent to your email.'); }} className="sb-forgot-link">
                                  Forgot Password?
                                </a>
                              )}
                            </div>
                            <div className="sb-input-box">
                              <Lock size={14} className="sb-input-icon" />
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={authIntent === 'signup' ? 'Min. 6 characters' : '••••••••'}
                                className="sb-input-control"
                                required
                              />
                            </div>
                          </div>

                          {authIntent === 'signup' && (
                            <div className="sb-input-group">
                              <label className="sb-label">Confirm Password</label>
                              <div className="sb-input-box">
                                <Lock size={14} className="sb-input-icon" />
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Confirm password"
                                  className="sb-input-control"
                                  required
                                />
                              </div>
                            </div>
                          )}

                          {authIntent === 'login' && (
                            <div className="sb-remember-row">
                              <label className="sb-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                                  className="sb-checkbox-control"
                                />
                                <span>Remember me on this device</span>
                              </label>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={loading}
                            className="sb-primary-btn"
                          >
                            {loading ? (
                              <Loader2 size={16} className="sb-spin" />
                            ) : (
                              <>
                                <span>Continue</span>
                                <ArrowRight size={15} />
                              </>
                            )}
                          </button>
                        </form>
                      )}

                      {/* METHOD 3: Mobile OTP Flow */}
                      {method === 'mobile' && (
                        <div>
                          {phoneStep === 'enter-phone' && (
                            <form onSubmit={handleSendOtp} className="sb-form-stack">
                              <div className="sb-input-group">
                                <label className="sb-label">Mobile Number</label>
                                <div className="sb-phone-box">
                                  <span className="sb-prefix-tag">{COUNTRY_CODE}</span>
                                  <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="98765 43210"
                                    className="sb-input-control phone-ctrl"
                                    required
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={loading}
                                className="sb-primary-btn"
                              >
                                {loading ? (
                                  <Loader2 size={16} className="sb-spin" />
                                ) : (
                                  <>
                                    <Phone size={14} />
                                    <span>Send OTP</span>
                                  </>
                                )}
                              </button>
                            </form>
                          )}

                          {phoneStep === 'enter-otp' && (
                            <form onSubmit={handleVerifyOtp} className="sb-form-stack">
                              <button
                                type="button"
                                onClick={resetPhoneFlow}
                                className="sb-change-phone"
                              >
                                <ArrowLeft size={12} />
                                <span>Change number ({COUNTRY_CODE} {phoneNumber})</span>
                              </button>

                              <div className="sb-input-group">
                                <label className="sb-label">Enter 6-Digit Code</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="123456"
                                  autoFocus
                                  className="sb-otp-control"
                                  required
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={loading}
                                className="sb-primary-btn"
                              >
                                {loading ? (
                                  <Loader2 size={16} className="sb-spin" />
                                ) : (
                                  <>
                                    <span>Verify & Continue</span>
                                    <ArrowRight size={15} />
                                  </>
                                )}
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  // STEP 2: Unified Name Setup Flow
                  <motion.div
                    key="step-set-name"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="sb-panel-inner"
                  >
                    <div className="sb-card-header">
                      <div className="sb-card-brand-pill">
                        <img src="/favicon.png" alt="Stockbuzz" className="sb-header-logo-img" />
                        <span className="sb-card-brand-name">Stockbuzz AI</span>
                      </div>
                      <h2 className="sb-card-heading">Set Your Profile Name</h2>
                      <p className="sb-card-subheading">
                        Choose any display name or alias you wish for your investment terminal.
                      </p>
                    </div>

                    {error && (
                      <div className="sb-error-box">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSetNameSubmit} className="sb-form-stack">
                      <div className="sb-input-group">
                        <label className="sb-label">Choose Display Name</label>
                        <div className="sb-input-box">
                          <User size={14} className="sb-input-icon" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Alex Morgan"
                            className="sb-input-control"
                            autoFocus
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="sb-primary-btn"
                      >
                        {loading ? (
                          <Loader2 size={16} className="sb-spin" />
                        ) : (
                          <>
                            <span>Complete Setup</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms Footer */}
              <p className="sb-terms-text">
                By continuing, you agree to Stockbuzz's{' '}
                <a href="#" className="sb-terms-link">Terms of Service</a> and{' '}
                <a href="#" className="sb-terms-link">Privacy Policy</a>.
              </p>

            </div>
          </motion.div>

        </div>
      </main>

      {/* Styled Responsive CSS Engine */}
      <style>{`
        .stockbuzz-ai-root {
          height: 100vh;
          width: 100vw;
          background: #F5F7FC;
          background: radial-gradient(120% 120% at 50% 0%, #FAFCFF 0%, #F5F7FC 60%, #EBF1FB 100%);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          color: #0F172A;
          font-family: 'Hanken Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .sb-bg-mesh {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 25%, rgba(37, 99, 235, 0.05) 0%, transparent 40%),
                      radial-gradient(circle at 80% 75%, rgba(56, 189, 248, 0.06) 0%, transparent 45%);
          pointer-events: none;
        }

        .sb-bg-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#94a3b8 0.75px, transparent 0.75px);
          background-size: 24px 24px;
          opacity: 0.08;
          pointer-events: none;
        }

        .sb-radial-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .glow-1 {
          top: -120px;
          left: -100px;
          width: 500px;
          height: 500px;
          background: rgba(37, 99, 235, 0.06);
        }

        .glow-2 {
          bottom: -120px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: rgba(56, 189, 248, 0.06);
        }

        /* Top Navigation Header */
        .sb-top-nav {
          padding: clamp(10px, 1.6vh, 18px) clamp(20px, 3vw, 40px) 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          height: clamp(42px, 5.2vh, 52px);
          flex-shrink: 0;
        }

        .sb-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          color: #475569;
          font-size: clamp(0.76rem, 0.9vw, 0.82rem);
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          transition: all 0.2s ease;
        }

        .sb-back-btn:hover {
          color: #2563EB;
          background: #FFFFFF;
          border-color: rgba(37, 99, 235, 0.3);
          transform: translateY(-1px);
        }

        /* Main Viewport Container */
        .sb-main-canvas {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 clamp(20px, 3vw, 40px) clamp(8px, 1.2vh, 14px);
          z-index: 10;
          min-height: 0;
        }

        .sb-viewport-grid {
          width: 100%;
          max-width: 1240px;
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: clamp(24px, 4vw, 56px);
          align-items: center;
        }

        /* LEFT HERO SIDE */
        .sb-hero-side {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }

        .sb-brand-lockup {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: clamp(10px, 1.8vh, 20px);
        }

        .sb-brand-logo-img {
          width: clamp(26px, 2.8vw, 32px);
          height: clamp(26px, 2.8vw, 32px);
          object-fit: contain;
        }

        .sb-brand-logo-text {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .sb-hero-heading {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: clamp(1.8rem, 3.2vw, 2.55rem);
          line-height: 1.12;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.025em; /* Optimized neo-grotesque tight heading tracking */
          margin-bottom: 6px;
        }

        .sb-title-blue {
          background: linear-gradient(135deg, #2563EB 0%, #38BDF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sb-hero-subtext {
          font-size: clamp(0.82rem, 1.05vw, 0.92rem);
          line-height: 1.48;
          color: #64748B;
          max-width: 480px;
          letter-spacing: -0.01em; /* Subdued tracking for modern readability */
        }

        /* AI VISUALIZATION HUB */
        .sb-ai-visual-hub {
          position: relative;
          width: 100%;
          max-width: 560px;
          height: clamp(280px, 38vh, 380px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 32px;
          margin-bottom: 16px;
        }

        .sb-connector-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* CENTRAL CORE (Glass Orb Design) */
        .sb-ai-core-hub {
          width: clamp(108px, 14.8vw, 144px);
          height: clamp(108px, 14.8vw, 144px);
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #FFFFFF 0%, #EFF6FF 50%, #DBEAFE 100%);
          border: 1.5px solid rgba(37, 99, 235, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 5;
          box-shadow: 0 20px 48px rgba(37, 99, 235, 0.16), 0 0 0 1px rgba(37, 99, 235, 0.05);
        }

        .sb-ai-core-glass {
          width: 82%;
          height: 82%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .sb-core-favicon {
          width: clamp(26px, 3.2vw, 34px);
          height: clamp(26px, 3.2vw, 34px);
          object-fit: contain;
        }

        .sb-core-label {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          color: #2563EB;
          letter-spacing: 0.02em;
        }

        /* 6 FLOATING WORKSPACE CARDS */
        .sb-floating-card {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: clamp(8px, 1.2vh, 11px) clamp(14px, 1.5vw, 18px);
          border-radius: 12px;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
          z-index: 6;
        }

        .sb-card-icon {
          width: clamp(26px, 2.8vw, 30px);
          height: clamp(26px, 2.8vw, 30px);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sb-card-icon.blue    { background: rgba(37, 99, 235, 0.1); color: #2563EB; }
        .sb-card-icon.cyan    { background: rgba(6, 182, 212, 0.1); color: #06B6D4; }
        .sb-card-icon.indigo  { background: rgba(99, 102, 241, 0.1); color: #6366F1; }
        .sb-card-icon.violet  { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }
        .sb-card-icon.emerald { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .sb-card-icon.amber   { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }

        .sb-card-title {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: clamp(0.78rem, 0.9vw, 0.84rem);
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .sb-card-sub {
          font-size: clamp(0.66rem, 0.8vw, 0.72rem);
          font-weight: 600;
          color: #64748B;
        }

        .pos-c1 { top: 4%; left: 0%; }
        .pos-c2 { top: 4%; right: 0%; }
        .pos-c3 { top: 44%; left: -4%; }
        .pos-c4 { top: 44%; right: -4%; }
        .pos-c5 { bottom: 4%; left: 2%; }
        .pos-c6 { bottom: 4%; right: 2%; }

        /* Butter-Smooth Razor Sharp Keyframes */
        @keyframes floatY1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes floatY2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }

        @keyframes floatX1 {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-7px); }
        }

        @keyframes floatX2 {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(7px); }
        }

        .anim-float-y1 { animation: floatY1 4.8s ease-in-out infinite; }
        .anim-float-y2 { animation: floatY2 5.2s ease-in-out infinite; }
        .anim-float-x1 { animation: floatX1 4.6s ease-in-out infinite; }
        .anim-float-x2 { animation: floatX2 5.0s ease-in-out infinite; }

        /* CENTER ALIGNED BOTTOM FEATURES WRAPPER */
        .sb-bottom-features-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 560px;
          margin-top: 12px;
        }

        .sb-bottom-features {
          display: flex;
          align-items: center;
          gap: clamp(10px, 1.8vw, 18px);
          font-size: clamp(0.72rem, 0.9vw, 0.78rem);
          font-weight: 600;
          color: #64748B;
        }

        .sb-feat-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sb-feat-icon { color: #2563EB; }

        /* RIGHT AUTHENTICATION PANEL */
        .sb-card-side {
          width: 100%;
          display: flex;
          justify-content: center;
          align-self: center;
        }

        .sb-auth-panel {
          width: 100%;
          max-width: 440px;
          height: auto;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          padding: clamp(24px, 3.2vh, 32px) clamp(20px, 2.8vw, 26px);
          box-shadow: 0 20px 48px -12px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.2vh, 22px);
        }

        .sb-panel-inner {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.2vh, 22px);
        }

        .sb-card-header {
          text-align: center;
        }

        .sb-card-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          background: #EEF2F6;
          margin-bottom: 8px;
        }

        .sb-header-logo-img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }

        .sb-card-brand-name {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 0.76rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .sb-card-heading {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: clamp(1.25rem, 1.8vw, 1.45rem);
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 3px;
        }

        .sb-card-subheading {
          font-size: clamp(0.76rem, 0.95vw, 0.82rem);
          color: #64748B;
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .sb-seg-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .sb-seg-bar {
          position: relative;
          display: flex;
          background: #EEF2F6;
          padding: 3px;
          border-radius: 9px;
        }

        .sb-seg-bar.primary-switch {
          width: 82%;
        }

        .sb-seg-bar.method-switch {
          width: 88%;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }

        .sb-seg-btn {
          position: relative;
          flex: 1;
          padding: clamp(5px, 0.7vh, 6px);
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: clamp(0.74rem, 0.88vw, 0.8rem);
          font-weight: 700;
          color: #64748B;
          transition: color 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-seg-btn.active {
          color: #0F172A;
        }

        .sb-pill-active {
          position: absolute;
          inset: 0;
          background: #FFFFFF;
          border-radius: 7px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.05);
          z-index: 0;
        }

        .sb-pill-active.sub {
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .sb-seg-text {
          position: relative;
          z-index: 1;
        }

        .sb-error-box {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 8px;
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          color: #DC2626;
          font-size: 0.74rem;
          font-weight: 600;
        }

        /* NATURAL FORM BODY */
        .sb-form-body {
          width: 100%;
        }

        .google-flow-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 12px 0;
        }

        .sb-google-btn {
          width: 100%;
          height: clamp(38px, 4.4vh, 42px);
          border-radius: 9px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #0F172A;
          font-size: clamp(0.82rem, 0.9vw, 0.88rem);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
          transition: all 0.2s ease;
        }

        .sb-google-btn:hover:not(:disabled) {
          border-color: #CBD5E1;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
          transform: translateY(-1px);
        }

        .sb-form-stack {
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 1.2vh, 12px);
        }

        .sb-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label-flex-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sb-label {
          font-size: clamp(0.7rem, 0.82vw, 0.74rem);
          font-weight: 700;
          color: #475569;
        }

        .sb-forgot-link {
          font-size: clamp(0.68rem, 0.8vw, 0.72rem);
          color: #2563EB;
          text-decoration: none;
          font-weight: 600;
        }

        .sb-forgot-link:hover { text-decoration: underline; }

        .sb-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sb-input-icon {
          position: absolute;
          left: 12px;
          color: #94A3B8;
          pointer-events: none;
        }

        .sb-input-control {
          width: 100%;
          height: clamp(38px, 4.4vh, 42px);
          padding: 0 12px 0 36px;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #0F172A;
          font-size: clamp(0.82rem, 0.95vw, 0.88rem);
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .sb-input-control:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 2.5px rgba(37, 99, 235, 0.12);
        }

        .sb-remember-row {
          display: flex;
          align-items: center;
        }

        .sb-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: clamp(0.7rem, 0.82vw, 0.74rem);
          color: #64748B;
          cursor: pointer;
        }

        .sb-checkbox-control {
          width: 13px;
          height: 13px;
          accent-color: #2563EB;
          cursor: pointer;
        }

        .sb-phone-box {
          display: flex;
          align-items: center;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          overflow: hidden;
          background: #FFFFFF;
          height: clamp(38px, 4.4vh, 42px);
        }

        .sb-phone-box:focus-within {
          border-color: #2563EB;
          box-shadow: 0 0 0 2.5px rgba(37, 99, 235, 0.12);
        }

        .sb-prefix-tag {
          padding: 0 12px;
          height: 100%;
          display: flex;
          align-items: center;
          background: #F8FAFC;
          border-right: 1px solid #CBD5E1;
          color: #475569;
          font-weight: 700;
          font-size: 0.82rem;
        }

        .phone-ctrl {
          padding: 0 12px !important;
          border: none !important;
          box-shadow: none !important;
          height: 100% !important;
        }

        .sb-otp-control {
          width: 100%;
          height: clamp(38px, 4.4vh, 42px);
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #0F172A;
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.3em;
          text-align: center;
          outline: none;
        }

        .sb-otp-control:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 2.5px rgba(37, 99, 235, 0.12);
        }

        .sb-change-phone {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #64748B;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .sb-change-phone:hover { color: #2563EB; }

        .sb-primary-btn {
          width: 100%;
          height: clamp(38px, 4.4vh, 42px);
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
          color: #FFFFFF;
          font-size: clamp(0.84rem, 0.9vw, 0.9rem);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(37, 99, 235, 0.2);
          transition: all 0.2s ease;
          margin-top: 2px;
        }

        .sb-primary-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.28);
          transform: translateY(-1px);
        }

        .sb-primary-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .sb-terms-text {
          text-align: center;
          font-size: clamp(0.68rem, 0.8vw, 0.72rem);
          color: #94A3B8;
          line-height: 1.3;
          padding-top: 8px;
        }

        .sb-terms-link {
          color: #64748B;
          font-weight: 600;
          text-decoration: underline;
        }

        .sb-terms-link:hover { color: #2563EB; }

        .sb-spin { animation: spin 1s linear infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .stockbuzz-ai-root {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }

          .sb-viewport-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .sb-hero-side {
            align-items: center;
            text-align: center;
          }

          .sb-ai-visual-hub {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
