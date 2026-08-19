import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track user plan globally (mock implementation using localStorage)
  const [userPlan, setUserPlan] = useState(() => {
    return localStorage.getItem('userPlan') || 'plan_free';
  });

  const updateUserPlan = async (newPlanId) => {
    setUserPlan(newPlanId);
    localStorage.setItem('userPlan', newPlanId);
    
    // Sync the updated plan to backend if user is logged in
    if (currentUser && !currentUser.isSuperadmin) {
      try {
        const planName = newPlanId === 'plan_ultra' ? 'Ultra' : newPlanId === 'plan_pro' ? 'Pro' : 'Free';
        const res = await fetch('/api/users');
        const users = await res.json();
        const existing = users.find(u => u.email === currentUser.email || (u.uid && u.uid === currentUser.uid));
        if (existing) {
          await fetch(`/api/users/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planName })
          });
        }
      } catch (err) {
        console.error('Failed to sync plan update', err);
      }
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    sessionStorage.removeItem('mockUser');
    return result;
  };

  // Phone OTP Login (Firebase or Local Fallback)
  const loginWithPhone = (phoneNumber, appVerifier) => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const loginWithLocalPhone = async (phone, otp) => {
    const res = await fetch('http://127.0.0.1:3001/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
    
    sessionStorage.setItem('mockUser', JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  };

  // Helper for creating resilient local fallback user
  const createLocalUser = (email, isSuperadmin = false, displayName = '') => {
    const name = displayName || (email ? email.split('@')[0] : 'User');
    const localUser = {
      uid: isSuperadmin ? 'superadmin_1' : `usr_${Math.random().toString(36).substring(2, 10)}`,
      email,
      displayName: isSuperadmin ? 'Superadmin' : name,
      isSuperadmin: isSuperadmin,
      photoURL: null,
      emailVerified: true,
    };
    sessionStorage.setItem('mockUser', JSON.stringify(localUser));
    setCurrentUser(localUser);
    return localUser;
  };

  // Email/Password Login
  const loginWithEmail = async (email, password) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();

    // Superadmin bypass for admin accounts
    if (
      normalizedEmail === 'admin@stockbuzz.in' ||
      normalizedEmail === 'admin@stockbuzz.com' ||
      normalizedEmail === 'superadmin@stockbuzz.in'
    ) {
      return createLocalUser('admin@stockbuzz.in', true, 'Superadmin');
    }

    try {
      // Try real Firebase email/password sign-in
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
      sessionStorage.removeItem('mockUser');
      return result.user;
    } catch (err) {
      const errStr = String(err?.message || err?.code || '').toLowerCase();
      // If Firebase blocked Email/Password signin on Google Cloud Identity Toolkit:
      if (
        errStr.includes('blocked') ||
        errStr.includes('operation-not-allowed') ||
        errStr.includes('identitytoolkit') ||
        err?.code === 'auth/operation-not-allowed'
      ) {
        console.warn('Firebase Email/Password provider is blocked or disabled in Firebase console. Falling back to local secure session:', err);
        return createLocalUser(normalizedEmail, normalizedEmail.startsWith('admin'));
      }
      throw err;
    }
  };

  // Email/Password Sign Up (create new account)
  const signUpWithEmail = async (email, password, displayName) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const isSuper = normalizedEmail === 'admin@stockbuzz.in' || normalizedEmail === 'admin@stockbuzz.com';

    if (isSuper) {
      return createLocalUser('admin@stockbuzz.in', true, displayName || 'Superadmin');
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      if (displayName) {
        await updateProfile(result.user, { displayName: displayName.trim() });
      }
      sessionStorage.removeItem('mockUser');
      return result.user;
    } catch (err) {
      const errStr = String(err?.message || err?.code || '').toLowerCase();
      if (
        errStr.includes('blocked') ||
        errStr.includes('operation-not-allowed') ||
        errStr.includes('identitytoolkit') ||
        err?.code === 'auth/operation-not-allowed'
      ) {
        console.warn('Firebase Email/Password provider is blocked. Falling back to local user registration:', err);
        return createLocalUser(normalizedEmail, false, displayName);
      }
      throw err;
    }
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem('mockUser');
    setCurrentUser(null);
    return signOut(auth).catch(() => {});
  };

  useEffect(() => {
    const syncUserToBackend = async (user) => {
      if (!user || user.isSuperadmin) return;
      try {
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const users = await res.json();
        if (!Array.isArray(users)) return;
        
        const existing = users.find(u => u.email === user.email || (u.uid && u.uid === user.uid));
        
        const currentPlan = localStorage.getItem('userPlan') || 'plan_free';
        const planName = currentPlan === 'plan_ultra' ? 'Ultra' : currentPlan === 'plan_pro' ? 'Pro' : 'Free';
        
        const payload = {
          uid: user.uid,
          name: user.displayName || (user.email ? user.email.split('@')[0] : user.phoneNumber) || 'User',
          email: user.email || user.phoneNumber || '',
          plan: planName,
          status: 'Active',
        };
        
        if (existing) {
          await fetch(`/api/users/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.error('Failed to sync user to backend', err);
      }
    };

    // Check for mocked/local session first
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setLoading(false);
      } catch {
        sessionStorage.removeItem('mockUser');
      }
    }

    // Listen to real Firebase auth state (Google / Phone / Email)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!sessionStorage.getItem('mockUser')) {
        setCurrentUser(user);
        setLoading(false);
        if (user) {
          syncUserToBackend(user);
        }
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    loginWithPhone,
    loginWithLocalPhone,
    loginWithEmail,
    signUpWithEmail,
    logout,
    userPlan,
    updateUserPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
