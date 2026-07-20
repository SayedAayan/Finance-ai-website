import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithPhoneNumber
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google Login
  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  // Phone OTP Login
  const loginWithPhone = (phoneNumber, appVerifier) => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  // Email/Password Login (with hidden Superadmin logic)
  const loginWithEmail = async (email, password) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();
    
    console.log("Login attempt:", normalizedEmail, normalizedPassword);

    if ((normalizedEmail === 'admin@stockbuzz.in' || normalizedEmail === 'admin@stockbuzz.com') && normalizedPassword === 'admin123') {
      const superAdminUser = {
        uid: 'superadmin_1',
        email: 'admin@stockbuzz.in',
        displayName: 'Superadmin',
        isSuperadmin: true,
      };
      sessionStorage.setItem('mockUser', JSON.stringify(superAdminUser));
      setCurrentUser(superAdminUser);
      console.log("Logged in as Superadmin");
      return superAdminUser;
    }
    
    // For normal users, if Firebase Email auth is enabled, you'd use signInWithEmailAndPassword.
    // Since we don't have it explicitly enabled in standard setup, we mock normal login here too.
    if (email && password.length >= 6) {
      const normalUser = {
        uid: `user_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
      };
      sessionStorage.setItem('mockUser', JSON.stringify(normalUser));
      setCurrentUser(normalUser);
      return normalUser;
    }
    throw new Error('Invalid email or password');
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem('mockUser');
    setCurrentUser(null);
    return signOut(auth);
  };

  useEffect(() => {
    // Check for mocked session first
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Because we might not have a real firebase API key yet, 
      // we can mock a user if needed, but let's keep it standard.
      if (!sessionStorage.getItem('mockUser')) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    loginWithPhone,
    loginWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
