import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  Firestore
} from 'firebase/firestore';

// Environment variable configuration for user's own Firebase project
const env = (import.meta as any).env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAj76el5tnqDG7RKicLpqkO2ighA7Q7ULo",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "lasa-project-724d6.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "lasa-project-724d6",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "lasa-project-724d6.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "370426236819",
  appId: env.VITE_FIREBASE_APP_ID || "1:370426236819:web:b4247e00da4c58333b2266",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-RXMNGFT89Z"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes("placeholder")
);

// Fallback Mock User Store for offline/self-hosted operation
const MOCK_STORAGE_KEY = 'lasaguard_mock_users';
const getMockUsers = (): Record<string, { pass: string; profile: UserProfile }> => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {
      'clinician@lasaguard.health': {
        pass: 'ClinicalPassword2026!',
        profile: {
          uid: 'usr_mock_01',
          email: 'clinician@lasaguard.health',
          displayName: 'Dr. Sarah Mitchell, MD',
          role: 'Attending Clinician',
          hospital: 'Metropolitan Healthcare System',
          createdAt: new Date().toISOString()
        }
      },
      'safety.director@lasaguard.health': {
        pass: 'SafetyDirector2026!',
        profile: {
          uid: 'usr_mock_02',
          email: 'safety.director@lasaguard.health',
          displayName: 'Dr. Alex Vance, PharmD',
          role: 'Chief Pharmacy Officer',
          hospital: 'Department of Pharmacy & Clinical Safety',
          createdAt: new Date().toISOString()
        }
      }
    };
  } catch {
    return {};
  }
};

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

if (isFirebaseConfigured) {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
} else {
  // Graceful dummy app instance to prevent runtime crashes when offline
  const fallbackConfig = {
    apiKey: "AIzaSyDummyKeyForOfflineDemonstrationOnly00",
    authDomain: "lasa-guard-app.firebaseapp.com",
    projectId: "lasa-guard-app",
    storageBucket: "lasa-guard-app.firebasestorage.app",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
  };
  appInstance = getApps().length === 0 ? initializeApp(fallbackConfig) : getApp();
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  hospital?: string;
  createdAt: string;
}

// Global Auth State Listeners for Mock Mode
type AuthCallback = (user: any) => void;
const mockAuthListeners: Set<AuthCallback> = new Set();
let mockCurrentUser: any = null;

// Check if a mock user was already logged in
try {
  const savedMock = localStorage.getItem('lasaguard_active_session');
  if (savedMock) {
    mockCurrentUser = JSON.parse(savedMock);
  }
} catch {}

const notifyMockListeners = (user: any) => {
  mockCurrentUser = user;
  if (user) {
    localStorage.setItem('lasaguard_active_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('lasaguard_active_session');
  }
  mockAuthListeners.forEach(cb => cb(user));
};

// Authentication Helpers
export const firebaseAuthService = {
  // Sign in with existing credentials
  signIn: async (email: string, pass: string): Promise<any> => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        return userCredential.user;
      } catch (err) {
        throw err;
      }
    }

    // Offline / Mock Account validation
    const mockUsers = getMockUsers();
    const existing = mockUsers[cleanEmail];
    if (!existing || existing.pass !== pass) {
      const err: any = new Error('Invalid email or password.');
      err.code = 'auth/invalid-credential';
      throw err;
    }

    const mockUser = {
      uid: existing.profile.uid,
      email: cleanEmail,
      displayName: existing.profile.displayName
    };
    notifyMockListeners(mockUser);
    return mockUser;
  },

  // Register a new clinician account
  signUp: async (email: string, pass: string, fullName: string, role: string = 'Doctor'): Promise<any> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });

      try {
        const userRef = doc(db, 'users', user.uid);
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || cleanEmail,
          displayName: fullName,
          role: role,
          hospital: 'LASA-GUARD Clinical Network',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, profile);
      } catch (err) {
        console.warn('Could not write user profile to Firestore:', err);
      }
      return user;
    }

    // Offline mock registration
    const mockUsers = getMockUsers();
    if (mockUsers[cleanEmail]) {
      const err: any = new Error('This email is already registered.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const uid = `usr_${Date.now()}`;
    const newProfile: UserProfile = {
      uid,
      email: cleanEmail,
      displayName: fullName,
      role: role,
      hospital: 'LASA-GUARD Clinical Network',
      createdAt: new Date().toISOString()
    };

    mockUsers[cleanEmail] = { pass, profile: newProfile };
    try {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUsers));
    } catch {}

    const mockUser = { uid, email: cleanEmail, displayName: fullName };
    notifyMockListeners(mockUser);
    return mockUser;
  },

  // Sign Out
  signOut: async (): Promise<void> => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    notifyMockListeners(null);
  },

  // Listen to Auth State
  onAuthChange: (callback: (user: any) => void) => {
    if (isFirebaseConfigured) {
      return onAuthStateChanged(auth, callback);
    }
    mockAuthListeners.add(callback);
    // Fire initially
    callback(mockCurrentUser);
    return () => {
      mockAuthListeners.delete(callback);
    };
  },

  // Get user profile document
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    if (isFirebaseConfigured) {
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          return snap.data() as UserProfile;
        }
      } catch (e) {
        console.warn('Error fetching user profile:', e);
      }
    }

    // Fallback search in mock store
    const mockUsers = getMockUsers();
    for (const u of Object.values(mockUsers)) {
      if (u.profile.uid === uid) return u.profile;
    }
    return null;
  }
};
