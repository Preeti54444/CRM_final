// Firebase Authentication Module
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth } from './firebase-init.js';
import { createUserWithRole, getUserRole } from './firebase-roles.js';

// Register new user with role
export const registerUser = async (email, password, displayName, role = 'sales_executive') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Create user document with role in Firestore
    await createUserWithRole(userCredential.user.uid, {
      email,
      displayName,
      role
    });
    
    return { success: true, user: userCredential.user, role };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Admin function to create user accounts
export const adminCreateUser = async (email, password, displayName, role = 'sales_executive') => {
  try {
    // Check if current user is admin
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No authenticated user' };
    }
    
    const roleResult = await getUserRole(currentUser.uid);
    if (!roleResult.success || roleResult.role !== 'admin') {
      return { success: false, error: 'Access denied: Admin only' };
    }
    
    // Create the user account
    const result = await registerUser(email, password, displayName, role);
    
    if (result.success) {
      return { 
        success: true, 
        user: result.user, 
        role: result.role,
        message: `User ${displayName} created successfully with role ${role}`
      };
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user role from Firestore
    const roleResult = await getUserRole(userCredential.user.uid);
    
    return { 
      success: true, 
      user: userCredential.user,
      role: roleResult.success ? roleResult.role : 'sales_executive',
      permissions: roleResult.success ? roleResult.permissions : []
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    getCurrentUser,
    onAuthStateChange,
    signInWithGoogle,
    signInWithFacebook
  };
}
