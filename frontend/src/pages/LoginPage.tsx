import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  Database, 
  Activity, 
  ArrowRight,
  Stethoscope,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { firebaseAuthService } from '../services/firebase';

interface LoginPageProps {
  onLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('Dr. Aniruddha Kule');
  const [role, setRole] = useState('Doctor');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your clinical email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await firebaseAuthService.signIn(email, password);
        setSuccessMessage('Authenticated successfully! Loading clinical portal...');
        if (onLogin) onLogin();
      } else {
        await firebaseAuthService.signUp(email, password, fullName, role);
        setSuccessMessage('Account registered in Firebase! Opening clinical portal...');
        if (onLogin) onLogin();
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password. If you do not have an account yet, switch to "Create Account" above.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered in Firebase. Please select "Sign In" instead.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('The password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Please provide a valid clinical email address.');
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please verify your Firebase connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for convenience
  const handleQuickDemo = async () => {
    const demoEmail = 'dr.aniruddha@lasasafe.hospital.org';
    const demoPass = 'Doctor1234!';
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Try sign in first
      await firebaseAuthService.signIn(demoEmail, demoPass);
      if (onLogin) onLogin();
    } catch (signInErr: any) {
      // If user does not exist in Firebase yet, auto-create it!
      if (signInErr?.code === 'auth/user-not-found' || signInErr?.code === 'auth/invalid-credential') {
        try {
          await firebaseAuthService.signUp(demoEmail, demoPass, 'Dr. Aniruddha Kule', 'Doctor');
          if (onLogin) onLogin();
        } catch (signUpErr: any) {
          setErrorMessage('Could not sign in with demo credentials: ' + (signUpErr.message || 'Error'));
        }
      } else {
        setErrorMessage(signInErr.message || 'Could not authenticate demo user.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-surface-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Branding & Trust Indicators (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-health-900 via-health-800 to-health-700 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Background decorative shapes */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-health-600/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-health-400/20 blur-xl pointer-events-none" />

          {/* Header Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-7 h-7 text-health-300" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">LASA-SAFE</h1>
                <p className="text-xs text-health-200 font-medium">Detect. Compare. Alert. Prevent.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3 leading-snug">
              AI-Powered Medication Safety Intelligence
            </h2>
            <p className="text-sm text-health-100/90 leading-relaxed font-normal">
              A clinical decision-support platform designed to assist doctors, pharmacists, and medical teams in detecting Look-Alike and Sound-Alike (LASA) medicines before prescriptions are finalized.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="relative z-10 py-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-health-200">
              Live Cloud Security & AIML
            </div>

            <div className="flex items-center gap-3 text-xs bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
              <Database className="w-4 h-4 text-health-300 shrink-0" />
              <span className="text-white font-medium">Google Firebase Authenticated & Firestore Cloud Synced</span>
            </div>

            <div className="flex items-center gap-3 text-xs bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
              <BrainCircuit className="w-4 h-4 text-health-300 shrink-0" />
              <span className="text-white font-medium">Hybrid AI: Levenshtein, Phonetic & BioBERT</span>
            </div>

            <div className="flex items-center gap-3 text-xs bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
              <Activity className="w-4 h-4 text-health-300 shrink-0" />
              <span className="text-white font-medium">Real-Time POCA Orthographic Risk Scoring</span>
            </div>
          </div>

          {/* Academic Footer Tag */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-health-200">
            <span>Honours AIML Project</span>
            <span>AY 2026-27</span>
          </div>
        </div>

        {/* Right Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div className="max-w-md mx-auto w-full">
            {/* Header / Mode Switcher */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-50 border border-health-200 text-health-700 text-xs font-medium mb-3">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor & Clinician Portal</span>
              </div>
              <h3 className="text-xl font-bold text-surface-900">
                {mode === 'signin' ? 'Sign in to your clinical account' : 'Create a clinician account'}
              </h3>
              <p className="text-xs text-surface-500 mt-1">
                {mode === 'signin' 
                  ? 'Access the LASA medication safety engine and real-time alert center.' 
                  : 'Register your clinical credentials to access medication safety intelligence.'}
              </p>

              {/* Mode Toggle Buttons */}
              <div className="flex bg-surface-100 p-1 rounded-xl mt-4 border border-surface-200">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-white text-health-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-health-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Quick Demo Helper Box */}
            <div className="mb-4 p-3 rounded-xl bg-health-50/80 border border-health-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-health-600" />
                  <p className="text-xs font-semibold text-health-900">1-Click Doctor Access</p>
                </div>
                <p className="text-[11px] text-health-700">Dr. Aniruddha Kule (Doctor / Medical Officer)</p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-health-600 text-white text-xs font-semibold hover:bg-health-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>Auto Sign In</span>
              </button>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Extra fields on Register Mode */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">
                      Full Name & Title
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Dr. Aniruddha Kule"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">
                      Clinical Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-600 transition-all"
                    >
                      <option value="Doctor">Doctor / Physician</option>
                      <option value="Clinical Pharmacist">Clinical Pharmacist</option>
                      <option value="Nurse Practitioner">Nurse Practitioner</option>
                      <option value="Medical Officer">Resident / Medical Officer</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Professional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="doctor@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-600 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-surface-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-surface-400">
                      Minimum 6 characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-10 py-2 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-surface-400 hover:text-surface-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-surface-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-surface-300 text-health-600 focus:ring-health-500"
                  />
                  <span>Remember this clinical terminal</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' ? 'Sign In with Firebase' : 'Create Firebase Clinician Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 max-w-md mx-auto w-full">
            <ClinicalDisclaimer compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
