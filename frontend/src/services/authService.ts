import { UserProfile, ClinicalRole } from '../types/lasa';
import { apiFetch } from './apiClient';

const AUTH_TOKEN_KEY = 'lasaguard_auth_token';
const USER_PROFILE_KEY = 'lasaguard_user_profile';

// Preset verified clinical accounts for rapid role testing & demonstration
export const PRESET_ACCOUNTS: Record<ClinicalRole, { email: string; pass: string; profile: UserProfile }> = {
  Doctor: {
    email: 'doctor@lasaguard.health',
    pass: 'ClinicalPassword2026!',
    profile: {
      uid: 'usr_doc_01',
      email: 'doctor@lasaguard.health',
      displayName: 'Dr. Sarah Mitchell, MD',
      role: 'Doctor',
      title: 'Attending Physician & Prescriber',
      hospital: 'Metropolitan General Hospital',
      licenseId: 'MD-LIC-2026-9481'
    }
  },
  Pharmacist: {
    email: 'pharmacist@lasaguard.health',
    pass: 'Pharmacist2026!',
    profile: {
      uid: 'usr_pharm_01',
      email: 'pharmacist@lasaguard.health',
      displayName: 'James Wilson, PharmD, RPh',
      role: 'Pharmacist',
      title: 'Lead Clinical Pharmacist',
      hospital: 'Department of Pharmacy & Dispensing',
      licenseId: 'RPH-LIC-2026-3810'
    }
  },
  Assistant: {
    email: 'assistant@lasaguard.health',
    pass: 'Assistant2026!',
    profile: {
      uid: 'usr_asst_01',
      email: 'assistant@lasaguard.health',
      displayName: 'Emily Chen, CPhT',
      role: 'Assistant',
      title: 'Pharmacy Assistant / Technician',
      hospital: 'Outpatient Pharmacy Dispensary',
      licenseId: 'CPHT-2026-7194'
    }
  },
  Admin: {
    email: 'safety.director@lasaguard.health',
    pass: 'SafetyDirector2026!',
    profile: {
      uid: 'usr_admin_01',
      email: 'safety.director@lasaguard.health',
      displayName: 'Dr. Alex Vance, Chief Pharmacy Officer',
      role: 'Admin',
      title: 'Patient Safety & Pharmacovigilance Director',
      hospital: 'Clinical Safety & Surveillance Directorate',
      licenseId: 'CPO-DIR-2026-0012'
    }
  }
};

type AuthListener = (user: UserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

const notifyListeners = (user: UserProfile | null) => {
  listeners.forEach(fn => fn(user));
};

export const authService = {
  // Get current cached user
  getCurrentUser: (): UserProfile | null => {
    try {
      const raw = localStorage.getItem(USER_PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Sign In using backend API with offline fallback
  signIn: async (email: string, pass: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Try real backend API
    try {
      const res = await apiFetch<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: pass })
      });

      if (res && res.token && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          uid: u.user_id || `usr_${Date.now()}`,
          email: u.email || cleanEmail,
          displayName: u.full_name || u.username || cleanEmail.split('@')[0],
          role: (u.role as ClinicalRole) || 'Doctor',
          title: u.title || u.role
        };

        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem('lasaguard_active_role', profile.role);
        notifyListeners(profile);
        return profile;
      }
    } catch (err: any) {
      // If error is 401 or bad credentials, throw that
      if (err.message && err.message.includes('Invalid email or password')) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      // If server is unreachable, check local preset accounts
      console.warn('Backend auth unreachable, checking local credentials...', err);
    }

    // 2. Offline fallback verification against presets
    for (const preset of Object.values(PRESET_ACCOUNTS)) {
      if (preset.email.toLowerCase() === cleanEmail && preset.pass === pass) {
        localStorage.setItem(AUTH_TOKEN_KEY, `local_token_${preset.profile.uid}`);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(preset.profile));
        localStorage.setItem('lasaguard_active_role', preset.profile.role);
        notifyListeners(preset.profile);
        return preset.profile;
      }
    }

    throw new Error('Invalid email or password. Please check your credentials or register a new account.');
  },

  // Sign Up / Register
  signUp: async (email: string, pass: string, fullName: string, role: ClinicalRole = 'Doctor'): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try backend API
    try {
      const res = await apiFetch<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          password: pass,
          username: cleanEmail.split('@')[0],
          full_name: fullName,
          role: role
        })
      });

      if (res && res.token && res.user) {
        const u = res.user;
        const profile: UserProfile = {
          uid: u.user_id || `usr_${Date.now()}`,
          email: u.email || cleanEmail,
          displayName: u.full_name || fullName,
          role: (u.role as ClinicalRole) || role,
          title: u.title || role
        };

        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem('lasaguard_active_role', profile.role);
        notifyListeners(profile);
        return profile;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      console.warn('Backend registration failed, creating local offline profile...', err);
    }

    // 2. Local fallback registration
    const profile: UserProfile = {
      uid: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: fullName || cleanEmail.split('@')[0],
      role: role,
      title: `${role} - Clinical User`
    };

    localStorage.setItem(AUTH_TOKEN_KEY, `local_token_${profile.uid}`);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem('lasaguard_active_role', role);
    notifyListeners(profile);
    return profile;
  },

  // Instant 1-Click Role Login
  loginAsRole: async (role: ClinicalRole): Promise<UserProfile> => {
    const preset = PRESET_ACCOUNTS[role] || PRESET_ACCOUNTS.Doctor;
    try {
      return await authService.signIn(preset.email, preset.pass);
    } catch {
      localStorage.setItem(AUTH_TOKEN_KEY, `local_token_${preset.profile.uid}`);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(preset.profile));
      localStorage.setItem('lasaguard_active_role', preset.profile.role);
      notifyListeners(preset.profile);
      return preset.profile;
    }
  },

  // Update current user profile in storage and notify listeners
  updateCurrentUser: (updated: Partial<UserProfile>): UserProfile | null => {
    const current = authService.getCurrentUser();
    if (!current) return null;
    const merged: UserProfile = { ...current, ...updated };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(merged));
    if (merged.role) {
      localStorage.setItem('lasaguard_active_role', merged.role);
    }
    notifyListeners(merged);
    return merged;
  },

  // Sign out
  signOut: async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    notifyListeners(null);
  },

  // Listen to auth changes
  onAuthChange: (callback: AuthListener) => {
    listeners.add(callback);
    callback(authService.getCurrentUser());
    return () => {
      listeners.delete(callback);
    };
  }
};
