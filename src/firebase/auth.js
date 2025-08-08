import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();
    
    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || '',
        email,
        photoURL: photoURL || '',
        createdAt,
        role: 'user',
        isVerified: false,
        totalSales: 0,
        totalPurchases: 0,
        rating: 0,
        reviewCount: 0,
        bio: '',
        website: '',
        socialLinks: {
          twitter: '',
          instagram: '',
          linkedin: ''
        },
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  return userRef;
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (email, password, displayName) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    await createUserProfile(user, { displayName });
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Try popup first, fallback to redirect if COOP issues
    try {
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfile(user);
      return user;
    } catch (popupError) {
      // If popup fails due to COOP or other issues, use redirect
      if (popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.message.includes('Cross-Origin-Opener-Policy')) {
        console.log('Popup blocked, using redirect method');
        await signInWithRedirect(auth, provider);
        return null; // Redirect will handle the rest
      }
      throw popupError;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Handle redirect result (call this on app initialization)
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await createUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
