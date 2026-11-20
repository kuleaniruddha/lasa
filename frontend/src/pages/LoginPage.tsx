import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
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
  Sparkles,
  Pill,
  FileCheck,
  Building2
} from 'lucide-react';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { authService, PRESET_ACCOUNTS } from '../services/authService';
import { ClinicalRole } from '../types/lasa';
import { ThemeToggle } from '../components/common/ThemeToggle';

interface LoginPageProps {
  onLogin?: () => void;
  onBypass?: (role?: ClinicalRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBypass }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<ClinicalRole>('Doctor');
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
        await authService.signIn(email, password);
        setSuccessMessage('Authenticated successfully! Opening clinical workspace...');
        if (onLogin) onLogin();
      } else {
        await authService.signUp(email, password, fullName || email.split('@')[0], role);
        setSuccessMessage('Account registered successfully! Opening clinical workspace...');
        if (onLogin) onLogin();
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setErrorMessage(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click login for any clinical role
  const handleRoleQuickLogin = async (selectedRole: ClinicalRole) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await authService.loginAsRole(selectedRole);
      setSuccessMessage(`Logged in as ${selectedRole}!`);
      if (onLogin) onLogin();
      if (onBypass) onBypass(selectedRole);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not authenticate demo user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-5xl w-full bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Branding & Trust Indicators (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-health-900 via-health-800 to-health-700 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-health-600/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-health-400/20 blur-xl pointer-events-none" />

          {/* Header Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-7 h-7 text-health-300" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">LASA-GUARD</h1>
                <p className="text-xs text-health-200 font-medium">Detect. Compare. Alert. Prevent.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3 leading-snug">
              Clinical Decision Support Platform
            </h2>
            <p className="text-sm text-health-100/90 leading-relaxed font-normal">
              An enterprise AI surveillance system tailored for <strong>Doctors</strong>, <strong>Pharmacists</strong>, and <strong>Pharmacy Assistants</strong> to intercept Look-Alike Sound-Alike medication errors.
            </p>
          </div>

          {/* Role Perspectives Overview */}
          <div className="relative z-10 py-6 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-health-200">
              Role-Adapted Clinical Perspectives
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2.5">
                <Stethoscope className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Doctor / Prescriber</strong>
                  <span className="text-health-100/80 text-[11px]">Prescription formulation & dual-drug alternative checks.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2.5">
                <Pill className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Clinical Pharmacist</strong>
                  <span className="text-health-100/80 text-[11px]">Dispensing verification, Tall Man lettering & override audits.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Pharmacy Assistant / Tech (Naive Mode)</strong>
                  <span className="text-health-100/80 text-[11px]">Intuitive Green/Yellow/Red traffic-light alerts & 1-click pharmacist sign-off.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-health-200/90 flex items-center justify-between">
            <span>FDA POCA & ISMP Compliant</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Surveillance
            </span>
          </div>
        </div>

        {/* Right Authentication Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-surface-900 transition-colors">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                  {mode === 'signin' ? 'Sign In to Clinical Terminal' : 'Create Clinical Account'}
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                  Access role-tailored medication safety intelligence.
                </p>
              </div>
              <ThemeToggle />
            </div>

            {/* Quick 1-Click Role Access */}
            <div className="mb-6 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-surface-600 dark:text-surface-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-health-600" />
                  <span>1-Click Clinical Role Access</span>
                </span>
                <span className="text-[10px] text-surface-400">Click to enter as:</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('Doctor')}
                  className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-health-400 hover:bg-health-50/50 dark:hover:bg-health-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                      🩺
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-surface-900 dark:text-surface-100 group-hover:text-health-700 dark:group-hover:text-health-400 truncate">
                        Doctor
                      </div>
                      <div className="text-[10px] text-surface-400 truncate">Dr. Sarah Mitchell</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('Pharmacist')}
                  className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-health-400 hover:bg-health-50/50 dark:hover:bg-health-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center justify-center text-xs font-bold shrink-0">
                      💊
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-surface-900 dark:text-surface-100 group-hover:text-health-700 dark:group-hover:text-health-400 truncate">
                        Pharmacist
                      </div>
                      <div className="text-[10px] text-surface-400 truncate">James Wilson, RPh</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('Assistant')}
                  className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                      📋
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-surface-900 dark:text-surface-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate">
                        Assistant
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">Naive Guided Mode</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('Admin')}
                  className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                      🛡️
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-surface-900 dark:text-surface-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 truncate">
                        Safety Director
                      </div>
                      <div className="text-[10px] text-surface-400 truncate">Dr. Alex Vance</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mode Switcher Tab */}
            <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-xs'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-xs'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Sign In / Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                      Full Name & Title
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Dr. Jane Doe / James Smith, RPh"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                      Clinical Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as ClinicalRole)}
                      className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                    >
                      <option value="Doctor">Doctor / Prescriber</option>
                      <option value="Pharmacist">Clinical Pharmacist</option>
                      <option value="Assistant">Pharmacy Assistant / Tech (Naive Mode)</option>
                      <option value="Admin">Patient Safety Director / Admin</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Professional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="clinician@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                    Password
                  </label>
                  <span className="text-[11px] text-surface-400">Minimum 6 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl pl-9 pr-10 py-2 text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}
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
