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
    if (email === 'admin@stockbuzz.in' && password === 'admin123') {
      const superAdminUser = {
        uid: 'superadmin_1',
        email: 'admin@stockbuzz.in',
        displayName: 'Superadmin',
        isSuperadmin: true,
      };
      setCurrentUser(superAdminUser);
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
      setCurrentUser(normalUser);
      return normalUser;
    }
    throw new Error('Invalid email or password');
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Because we might not have a real firebase API key yet, 
      // we can mock a user if needed, but let's keep it standard.
      setCurrentUser(user);
      setLoading(false);
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
