import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileScan, 
  GitCompare, 
  BellRing, 
  History, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  Server,
  Database,
  User,
  LogOut,
  ChevronRight,
  X,
  PanelLeftClose
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  alertCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isOpenDesktop?: boolean;
  onToggleDesktop?: () => void;
  currentUser?: { displayName?: string; email?: string; role?: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  alertCount,
  isMobileOpen = false,
  onCloseMobile,
  isOpenDesktop = true,
  onToggleDesktop,
  currentUser
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'check-medicine', label: 'Check Medicine', icon: Search, badge: 'AI Core' },
    { id: 'scan-prescription', label: 'Scan Prescription', icon: FileScan, badge: 'OCR' },
    { id: 'medicine-comparison', label: 'Medicine Comparison', icon: GitCompare },
    { id: 'safety-alerts', label: 'Safety Alerts', icon: BellRing, count: alertCount },
    { id: 'analysis-history', label: 'Analysis History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'AIML' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-68 bg-white border-r border-surface-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isOpenDesktop ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        }`}
      >
        {/* Top Branding & Close Button */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="h-16 px-4 border-b border-surface-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-health-600 flex items-center justify-center text-white shadow-sm ring-2 ring-health-600/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-surface-900">LASA-SAFE</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-health-100 text-health-800 shrink-0">
                    AIML
                  </span>
                </div>
                <p className="text-[11px] text-surface-500 font-medium truncate">Medication Error Prevention</p>
              </div>
            </div>

            <div className="flex items-center shrink-0 ml-1">
              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={onCloseMobile}
                title="Close sidebar"
                aria-label="Close sidebar"
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 lg:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Collapse Button */}
              {onToggleDesktop && (
                <button
                  type="button"
                  onClick={onToggleDesktop}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                  className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Clinical Workflows
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-health-50 text-health-700 font-semibold shadow-2xs'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-health-600' : 'text-surface-400 group-hover:text-surface-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        isActive ? 'bg-health-100 text-health-800' : 'bg-surface-100 text-surface-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.count}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-health-600" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: System Status & User Profile */}
        <div className="p-3 border-t border-surface-200 bg-surface-50/50 space-y-3 shrink-0">
          {/* Status Indicators */}
          <div className="bg-white p-2.5 rounded-xl border border-surface-200/80 shadow-2xs space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-surface-600 font-medium">
                <Server className="w-3.5 h-3.5 text-surface-400" />
                <span>AI Engine:</span>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-surface-600 font-medium">
                <Database className="w-3.5 h-3.5 text-surface-400" />
                <span>Database:</span>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
          </div>

          {/* Logged in User Profile */}
          {(() => {
            const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Dr. Aniruddha Kule';
            const role = currentUser?.role || 'Doctor';
            const initials = name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'DR';
            return (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-surface-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-health-100 border border-health-200 flex items-center justify-center text-health-700 font-bold text-xs uppercase">
                    {initials}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs font-semibold text-surface-900 truncate" title={name}>{name}</p>
                    <p className="text-[11px] text-surface-500 font-medium flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-health-600 shrink-0" />
                      <span className="truncate">{role}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign Out of Firebase"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
        </div>
      </aside>
    </>
  );
};
