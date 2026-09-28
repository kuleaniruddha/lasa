import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  currentTab: string;
  onNavigate: (tab: string, contextMedicine?: string) => void;
  onLogout: () => void;
  alertCount: number;
  currentUser?: { displayName?: string; email?: string; role?: string } | null;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onNavigate,
  onLogout,
  alertCount,
  currentUser,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keyboard shortcut: Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setMobileMenuOpen(prev => !prev);
        } else {
          setSidebarOpen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Persistent / Toggleable Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onNavigate}
        onLogout={onLogout}
        alertCount={alertCount}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isOpenDesktop={sidebarOpen}
        onToggleDesktop={() => setSidebarOpen(prev => !prev)}
        currentUser={currentUser}
      />

      {/* Main Content Area: dynamically offsets by sidebar width on desktop */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          sidebarOpen ? 'lg:pl-68' : 'lg:pl-0'
        }`}
      >
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNavigate={onNavigate}
          onOpenMobileMenu={handleToggleSidebar}
          isSidebarOpen={sidebarOpen}
          alertCount={alertCount}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

