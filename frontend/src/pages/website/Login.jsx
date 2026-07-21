import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Phone, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
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
  const { loginWithGoogle, loginWithPhone, loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [tab, setTab] = useState('google'); // 'google' | 'phone' | 'email'
  const [emailMode, setEmailMode] = useState('signin'); // 'signin' | 'signup'
  const [step, setStep] = useState('enter-phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map Firebase error codes to friendly messages
  const friendlyError = (err) => {
    const code = err?.code || '';
    if (code === 'auth/user-not-found') return 'No account found with this email. Please sign up first.';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Incorrect password. Please try again.';
    if (code === 'auth/email-already-in-use') return 'An account already exists with this email. Please sign in.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
    return err.message || 'Something went wrong. Please try again.';
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    if (emailMode === 'signup' && !fullName.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true);
    try {
      let user;
      if (emailMode === 'signup') {
        user = await signUpWithEmail(email, password, fullName);
      } else {
        user = await loginWithEmail(email, password);
      }
      if (user?.isSuperadmin) {
        navigate('/superadmin', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
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
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
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
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await loginWithPhone(`${COUNTRY_CODE}${phoneNumber}`, verifier);
      setConfirmationResult(result);
      setStep('enter-otp');
    } catch (err) {
      // Clear reCAPTCHA so the user can try again
      resetRecaptcha();
      setError(err.message || 'Could not send OTP. Please try again.');
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
      await confirmationResult.confirm(otp);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setStep('enter-phone');
    setOtp('');
    setConfirmationResult(null);
    setError(null);
    resetRecaptcha(); // clear so it can be recreated fresh
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px', textDecoration: 'none' }}>
          <img src="/favicon.png" alt="Stockbuzz" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Stockbuzz</span>
        </Link>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '6px', textAlign: 'center' }}>Welcome back</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-3)', textAlign: 'center', marginBottom: '24px' }}>Sign in to save your watchlist and chat history</p>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '10px', marginBottom: '22px' }}>
            <button
              onClick={() => { setTab('google'); setError(null); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.84rem', transition: 'all .15s',
                background: tab === 'google' ? 'var(--bg-card)' : 'transparent',
                color: tab === 'google' ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: tab === 'google' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Google
            </button>
            <button
              onClick={() => { setTab('phone'); setError(null); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.84rem', transition: 'all .15s',
                background: tab === 'phone' ? 'var(--bg-card)' : 'transparent',
                color: tab === 'phone' ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: tab === 'phone' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Mobile
            </button>
            <button
              onClick={() => { setTab('email'); setError(null); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.84rem', transition: 'all .15s',
                background: tab === 'email' ? 'var(--bg-card)' : 'transparent',
                color: tab === 'email' ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: tab === 'email' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Email
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'var(--red-light)', color: 'var(--red)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '18px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          {tab === 'google' && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)',
                color: 'var(--text-1)', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <GoogleIcon />}
              Continue with Google
            </button>
          )}

          {tab === 'email' && (
            <form onSubmit={handleEmailLogin}>
              {/* Sign In / Sign Up toggle */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '8px', marginBottom: '18px' }}>
                {['signin', 'signup'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setEmailMode(mode); setError(null); }}
                    style={{
                      flex: 1, padding: '7px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.82rem', transition: 'all .15s',
                      background: emailMode === mode ? 'var(--bg-card)' : 'transparent',
                      color: emailMode === mode ? 'var(--text-1)' : 'var(--text-3)',
                      boxShadow: emailMode === mode ? 'var(--shadow-xs)' : 'none',
                    }}
                  >
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Full name — only shown for sign up */}
              {emailMode === 'signup' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    autoFocus
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={emailMode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--violet)',
                  color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {loading
                  ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  : (emailMode === 'signup' ? 'Create Account' : 'Sign In')}
              </button>
            </form>
          )}

          {tab === 'phone' && step === 'enter-phone' && (
            <form onSubmit={handleSendOtp}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '8px', display: 'block' }}>Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                <span style={{ padding: '12px 12px', background: 'var(--bg-subtle)', color: 'var(--text-2)', fontWeight: 700, fontSize: '0.9rem', borderRight: '1px solid var(--border)' }}>
                  {COUNTRY_CODE}
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '0.95rem', background: 'var(--bg-card)', color: 'var(--text-1)' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--blue)',
                  color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Phone size={16} />}
                Send OTP
              </button>
            </form>
          )}

          {tab === 'phone' && step === 'enter-otp' && (
            <form onSubmit={handleVerifyOtp}>
              <button type="button" onClick={resetPhoneFlow} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
                <ArrowLeft size={13} /> Change number
              </button>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '8px', display: 'block' }}>
                Enter the 6-digit code sent to {COUNTRY_CODE} {phoneNumber}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: '10px',
                  outline: 'none', fontSize: '1.1rem', letterSpacing: '0.3em', textAlign: 'center',
                  background: 'var(--bg-card)', color: 'var(--text-1)', marginBottom: '16px'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--blue)',
                  color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
                Verify & Continue
              </button>
            </form>
          )}

          {/* Invisible reCAPTCHA anchor required by Firebase phone auth */}
          <div id="recaptcha-container" />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '20px' }}>
          By continuing, you agree to Stockbuzz's Terms of Service and Privacy Policy.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
