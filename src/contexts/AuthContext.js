import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import {
  signUpWithEmailAndPassword,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  updateUserProfile,
  changePassword,
  handleGoogleRedirectResult
} from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Handle Google redirect result on app initialization
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await handleGoogleRedirectResult();
      } catch (error) {
        console.error('Error handling Google redirect:', error);
      }
    };

    handleRedirect();
  }, []);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !userProfile) {
        setProfileLoading(true);
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserProfile({ id: userSnap.id, ...userSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      } else if (!user) {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user, userProfile]);

  // Sign up function
  const signUp = async (email, password, displayName) => {
    try {
      const user = await signUpWithEmailAndPassword(email, password, displayName);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const user = await signInWithEmail(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Google sign in function
  const signInWithGoogleProvider = async () => {
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await signOutUser();
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  // Reset password function
  const sendPasswordReset = async (email) => {
    try {
      await resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      if (user) {
        await updateUserProfile(user.uid, updates);
        // Refresh user profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile({ id: userSnap.id, ...userSnap.data() });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Change password function
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  // Check if user is seller
  const isSeller = () => {
    return userProfile?.role === 'seller' || userProfile?.role === 'admin';
  };

  const value = {
    // User data
    user,
    userProfile,
    loading: loading || profileLoading,
    error,
    
    // Auth functions
    signUp,
    signIn,
    signInWithGoogleProvider,
    signOut,
    sendPasswordReset,
    updateProfile,
    updatePassword,
    
    // Utility functions
    isAdmin,
    isSeller,
    
    // User status
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
