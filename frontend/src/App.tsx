import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CheckMedicinePage } from './pages/CheckMedicinePage';
import { MedicineComparisonPage } from './pages/MedicineComparisonPage';
import { PrescriptionScannerPage } from './pages/PrescriptionScannerPage';
import { SafetyAlertsPage } from './pages/SafetyAlertsPage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertDetailModal } from './components/modals/AlertDetailModal';
import { SafetyAlert, AnalysisHistoryItem, UserProfile, ClinicalRole } from './types/lasa';
import { lasaService } from './services/lasaService';
import { authService, PRESET_ACCOUNTS } from './services/authService';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { RoleProvider, useRole } from './context/RoleContext';

const AppContent: React.FC = () => {
  const { currentRole, setRole } = useRole();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(() => {
    return !sessionStorage.getItem('lasa_landing_seen');
  });

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Shared Context / Pre-selected Medicine States
  const [contextMedicine, setContextMedicine] = useState<string>('');
  const [comparisonPair, setComparisonPair] = useState<{ medA: string; medB: string }>({
    medA: 'Hydroxyzine',
    medB: 'Hydralazine'
  });

  // Modal State
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);

  // Live Data State
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setCurrentUser(user);
      if (user && user.role) {
        setRole(user.role);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setRole]);

  // Keep user role in sync when role switcher is used
  useEffect(() => {
    if (currentUser && currentUser.role !== currentRole) {
      setCurrentUser({
        ...currentUser,
        role: currentRole
      });
    }
  }, [currentRole, currentUser]);

  // Load alerts & history
  useEffect(() => {
    if (!currentUser) return;
    async function loadData() {
      const a = await lasaService.getAlerts();
      const h = await lasaService.getHistory();
      setAlerts(a);
      setHistory(h);
    }
    loadData();
  }, [currentTab, currentUser]);

  // Handle cross-page navigation with optional context
  const handleNavigate = (tab: string, contextMed?: string) => {
    if (contextMed) {
      setContextMedicine(contextMed);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to comparison with two specific drugs
  const handleNavigateToComparison = (medA: string, medB: string) => {
    setComparisonPair({ medA, medB });
    setCurrentTab('medicine-comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve alert
  const handleResolveAlert = async (alertId: string) => {
    const updated = await lasaService.resolveAlert(alertId);
    setAlerts(updated);
  };

  // Logout handler
  const handleLogout = async () => {
    await authService.signOut();
  };

  // Show animated Landing Page first
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => {
          sessionStorage.setItem('lasa_landing_seen', 'true');
          setShowLanding(false);
        }}
      />
    );
  }

  // Loading Screen while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-health-600 flex items-center justify-center text-white shadow-md animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">LASA-GUARD</h1>
            <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Initializing Clinical Safety Workspace...</p>
          </div>
          <Loader2 className="w-5 h-5 text-health-600 animate-spin mt-1" />
        </div>
      </div>
    );
  }

  // If not logged in, show multi-role login screen
  if (!currentUser) {
    return (
      <LoginPage 
        onBypass={(selectedRole?: ClinicalRole) => {
          const roleKey = selectedRole || 'Doctor';
          const preset = PRESET_ACCOUNTS[roleKey] || PRESET_ACCOUNTS.Doctor;
          setRole(roleKey);
          setCurrentUser(preset.profile);
        }} 
      />
    );
  }

  const activeAlertsCount = alerts.filter(a => a.status !== 'Resolved').length;

  return (
    <MainLayout
      currentTab={currentTab}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      alertCount={activeAlertsCount}
      currentUser={currentUser}
    >
      {/* Tab Pages */}
      {currentTab === 'dashboard' && (
        <DashboardPage
          alerts={alerts}
          onNavigate={handleNavigate}
          onSelectAlert={(a) => setSelectedAlert(a)}
          currentUser={currentUser}
        />
      )}

      {currentTab === 'check-medicine' && (
        <CheckMedicinePage
          initialMedicine={contextMedicine}
          onNavigateToComparison={handleNavigateToComparison}
          onNavigateToScanner={() => setCurrentTab('scan-prescription')}
        />
      )}

      {currentTab === 'scan-prescription' && (
        <PrescriptionScannerPage
          onOpenAlertDetail={(a, b) => {
            const match = alerts.find(alt => 
              (alt.pair[0].toLowerCase() === a.toLowerCase() && alt.pair[1].toLowerCase() === b.toLowerCase()) ||
              (alt.pair[1].toLowerCase() === a.toLowerCase() && alt.pair[0].toLowerCase() === b.toLowerCase())
            );
            if (match) setSelectedAlert(match);
          }}
          onNavigateToComparison={handleNavigateToComparison}
          onNavigateToCheck={(med) => handleNavigate('check-medicine', med)}
        />
      )}

      {currentTab === 'medicine-comparison' && (
        <MedicineComparisonPage
          initialMedA={comparisonPair.medA}
          initialMedB={comparisonPair.medB}
        />
      )}

      {currentTab === 'safety-alerts' && (
        <SafetyAlertsPage
          alerts={alerts}
          onSelectAlert={(a) => setSelectedAlert(a)}
          onNavigateToComparison={handleNavigateToComparison}
        />
      )}

      {currentTab === 'analysis-history' && (
        <AnalysisHistoryPage
          history={history}
          onNavigateToCheck={(med) => handleNavigate('check-medicine', med)}
          onNavigateToComparison={handleNavigateToComparison}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsPage />
      )}

      {currentTab === 'settings' && (
        <SettingsPage 
          currentUser={currentUser}
          onUpdateProfile={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={handleResolveAlert}
        onOpenComparison={handleNavigateToComparison}
      />
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </ThemeProvider>
  );
};

export default App;
