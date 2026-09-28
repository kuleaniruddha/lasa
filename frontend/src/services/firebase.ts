import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDNWyL7RXnOp62z5Kq4lYyD2psHDICBZhQ",
  authDomain: "lasa-8b8a8.firebaseapp.com",
  projectId: "lasa-8b8a8",
  storageBucket: "lasa-8b8a8.firebasestorage.app",
  messagingSenderId: "806365943389",
  appId: "1:806365943389:web:120eaed27ea1f9e2199fb4"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  hospital?: string;
  createdAt: string;
}

// Authentication Helpers
export const firebaseAuthService = {
  // Sign in with existing credentials
  signIn: async (email: string, pass: string): Promise<FirebaseUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return userCredential.user;
  },

  // Register a new clinician account
  signUp: async (email: string, pass: string, fullName: string, role: string = 'Doctor'): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = userCredential.user;

    // Update Auth Profile
    await updateProfile(user, { displayName: fullName });

    // Store profile in Firestore 'users' collection
    try {
      const userRef = doc(db, 'users', user.uid);
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: fullName,
        role: role,
        hospital: 'LASA-SAFE Clinical Network',
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, profile);
    } catch (err) {
      console.warn('Could not write user profile to Firestore:', err);
    }

    return user;
  },

  // Sign Out
  signOut: async (): Promise<void> => {
    await signOut(auth);
  },

  // Listen to Auth State
  onAuthChange: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Get user profile document from Firestore
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Error fetching user profile:', e);
    }
    return null;
  }
};
