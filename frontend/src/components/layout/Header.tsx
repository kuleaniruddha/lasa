import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Medicine } from '../../types/lasa';
import { lasaService } from '../../services/lasaService';
import { RiskBadge } from '../common/RiskBadge';
import { ThemeToggle } from '../common/ThemeToggle';
import { RoleSwitcher } from '../common/RoleSwitcher';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, contextMedicine?: string) => void;
  onOpenMobileMenu: () => void;
  isSidebarOpen?: boolean;
  alertCount: number;
  currentUser?: { displayName?: string; email?: string; role?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenMobileMenu,
  isSidebarOpen = true,
  alertCount,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Map tab IDs to human-readable titles
  const tabTitles: { [key: string]: { title: string; subtitle: string } } = {
    dashboard: { title: 'Dashboard', subtitle: 'Medication Safety Overview & Key Indicators' },
    'check-medicine': { title: 'Check Medicine', subtitle: 'AI-Powered Look-Alike & Sound-Alike Analysis' },
    'scan-prescription': { title: 'Scan Prescription', subtitle: 'Prescription OCR & Multi-Drug LASA Screening' },
    'medicine-comparison': { title: 'Medicine Comparison', subtitle: 'Side-by-Side Pharmacological & Phonetic Comparison' },
    'safety-alerts': { title: 'Safety Alerts', subtitle: 'Active LASA Conflict Monitoring & Triage' },
    'analysis-history': { title: 'Analysis History', subtitle: 'Complete Audit Log of Past Screenings' },
    analytics: { title: 'Analytics & Model Evaluation', subtitle: 'AIML Validation, Performance Metrics & POCA Statistics' },
    settings: { title: 'Settings', subtitle: 'Clinical Profile & AI Sensitivity Preferences' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'LASA-SAFE', subtitle: 'Clinical Decision Support' };

  // Handle global search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await lasaService.searchMedicines(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close popups
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMedicine = (med: Medicine) => {
    setSearchQuery('');
    setShowResults(false);
    onNavigate('check-medicine', med.name);
  };

  const displayName = currentUser?.displayName 
    ? currentUser.displayName.replace(/,.*$/, '') 
    : (currentUser?.email ? currentUser.email.split('@')[0] : 'Clinical User');
  const roleTitle = currentUser?.role || 'Clinician';
  const avatarInitials = displayName
    .split(' ')
    .map(w => w[0])
    .filter(c => c && /[A-Za-z]/.test(c))
    .slice(-2)
    .join('')
    .toUpperCase() || 'CU';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Sidebar toggle & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
          aria-label="Toggle sidebar"
          className="p-2 -ml-2 rounded-lg text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors flex items-center justify-center cursor-pointer"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 hidden lg:block text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white" />
          ) : (
            <PanelLeftOpen className="w-5 h-5 hidden lg:block text-health-600 hover:text-health-700" />
          )}
          <Menu className="w-5 h-5 lg:hidden" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400 font-medium">
            <span>LASA-GUARD</span>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="text-health-700 dark:text-health-400 font-semibold">{currentInfo.title}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100 leading-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Medicine Search */}
        <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Global medicine search (e.g. Hydroxyzine, Olvance)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true);
              }}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-hidden focus:ring-2 focus:ring-health-500/20 focus:border-health-600 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-lg border border-surface-200 py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                Database Matches ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-3 text-xs text-surface-500 text-center">
                  {isSearching ? 'Searching database...' : 'No matching medicines found.'}
                </div>
              ) : (
                searchResults.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className="w-full px-3 py-2 text-left hover:bg-health-50/70 transition-colors flex items-center justify-between border-b border-surface-100 last:border-b-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-surface-900">{med.name}</span>
                        {med.isLasaRisk && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                            LASA Flag
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-surface-500 truncate max-w-xs">
                        {med.category} • {med.dosageForm}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-surface-400" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors relative"
            title="Safety Notifications"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-surface-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-surface-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clinical Safety Alerts ({alertCount})</span>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('safety-alerts');
                  }}
                  className="text-[11px] font-semibold text-health-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="py-2 space-y-2">
                <div 
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('safety-alerts');
                  }}
                  className="p-2 rounded-xl bg-red-50/70 border border-red-100 cursor-pointer hover:bg-red-50 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-900">Hydroxyzine ↔ Hydralazine</span>
                    <RiskBadge level="High" score={89} size="sm" showIcon={false} />
                  </div>
                  <p className="text-[11px] text-red-700">89% LASA similarity. Antihistamine vs Vasodilator.</p>
                </div>

                <div 
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('safety-alerts');
                  }}
                  className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 cursor-pointer hover:bg-amber-50 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-900">Olvance ↔ Oleanz</span>
                    <RiskBadge level="High" score={85} size="sm" showIcon={false} />
                  </div>
                  <p className="text-[11px] text-amber-800">Lancet 2024 alert: Olmesartan vs Olanzapine.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Perspective Switcher */}
        <RoleSwitcher />

        {/* Dark / Light Mode Toggle Button */}
        <ThemeToggle />

        {/* Settings Shortcut */}
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Role Avatar Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-surface-200 dark:border-surface-700">
          <div className="w-8 h-8 rounded-full bg-health-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
            {avatarInitials}
          </div>
          <div className="text-left leading-tight">
            <span className="block text-xs font-semibold text-surface-900 dark:text-surface-100">
              {displayName}
            </span>
            <span className="text-[10px] text-health-600 dark:text-health-400 font-medium flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> {roleTitle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
