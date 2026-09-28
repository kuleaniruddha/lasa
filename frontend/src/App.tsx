import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
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
import { SafetyAlert, AnalysisHistoryItem } from './types/lasa';
import { lasaService } from './services/lasaService';
import { firebaseAuthService } from './services/firebase';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  // Real Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; displayName: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Live Data State (Synced with Firestore)
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthChange(async (user) => {
      if (user) {
        const profile = await firebaseAuthService.getUserProfile(user.uid);
        setCurrentUser({
          uid: user.uid,
          email: user.email || '',
          displayName: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Dr. Clinician',
          role: profile?.role || 'Doctor'
        });
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Firestore alerts & history
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
    await firebaseAuthService.signOut();
  };

  // Loading Screen while Firebase checks user session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-health-600 flex items-center justify-center text-white shadow-md animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 tracking-tight">LASA-SAFE</h1>
            <p className="text-xs text-surface-500 font-medium">Verifying Firebase Cloud Security...</p>
          </div>
          <Loader2 className="w-5 h-5 text-health-600 animate-spin mt-1" />
        </div>
      </div>
    );
  }

  // If not logged in with Firebase, show real Login / Register page
  if (!currentUser) {
    return <LoginPage />;
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
        <SettingsPage />
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

export default App;
