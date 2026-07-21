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

  // Phone OTP Login
  const loginWithPhone = (phoneNumber, appVerifier) => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  // Email/Password Login
  const loginWithEmail = async (email, password) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();

    // Hidden superadmin shortcut (local only, no Firebase)
    if (
      (normalizedEmail === 'admin@stockbuzz.in' || normalizedEmail === 'admin@stockbuzz.com') &&
      normalizedPassword === 'admin123'
    ) {
      const superAdminUser = {
        uid: 'superadmin_1',
        email: 'admin@stockbuzz.in',
        displayName: 'Superadmin',
        isSuperadmin: true,
      };
      sessionStorage.setItem('mockUser', JSON.stringify(superAdminUser));
      setCurrentUser(superAdminUser);
      return superAdminUser;
    }

    // Real Firebase email/password sign-in
    const result = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    sessionStorage.removeItem('mockUser');
    return result.user;
  };

  // Email/Password Sign Up (create new account)
  const signUpWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    // Set the display name on the Firebase profile
    if (displayName) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    sessionStorage.removeItem('mockUser');
    return result.user;
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem('mockUser');
    setCurrentUser(null);
    return signOut(auth);
  };

  useEffect(() => {
    const syncUserToBackend = async (user) => {
      if (!user || user.isSuperadmin) return;
      try {
        const res = await fetch('/api/users');
        const users = await res.json();
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

    // Check for mocked superadmin session first
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setLoading(false);
    }

    // Listen to real Firebase auth state (Google / Phone / Email)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!sessionStorage.getItem('mockUser')) {
        setCurrentUser(user);
        setLoading(false);
        if (user) {
          syncUserToBackend(user);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    loginWithPhone,
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
