// Firebase Initialization Module
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import configuration
const firebaseConfig = {
  apiKey: "AIzaSyCimbhjhdMHXZKbbVclwUFWF2O1eyW6c0U",
  authDomain: "fscrm-2b076.firebaseapp.com",
  projectId: "fscrm-2b076",
  storageBucket: "fscrm-2b076.firebasestorage.app",
  messagingSenderId: "40976570212",
  appId: "1:40976570212:web:ab25edb9c4b7ac42b84c71",
  measurementId: "G-BCREVZ0PNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { app, auth, db, storage };

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { app, auth, db, storage };
}
