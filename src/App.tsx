import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Menu, X } from "lucide-react";
import { AppInitializer } from "./utils/appInitialization";
import { ThemeManager } from "./utils/themeManager";
import { APP_SECTIONS, AppSection, getDefaultSection } from "./constants/app";
import { AuthenticationPortal } from "./components/AuthenticationPortal";
import { LoadingScreen } from "./components/LoadingScreen";
import { AppHeader } from "./components/AppHeader";
import { AppFooter } from "./components/AppFooter";
import { DatabaseError } from "./components/DatabaseError";
import { StatusIndicator } from "./components/StatusIndicator";
import { ContentRouter } from "./components/ContentRouter";
import { Sidebar } from "./components/Sidebar";
import type { UserUI as User } from "./utils/database";

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>(APP_SECTIONS.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize theme
      const cleanupTheme = ThemeManager.initializeTheme();
      
      // Initialize database
      const result = await AppInitializer.initializeDatabase();
      
      if (result.success) {
        setIsDbInitialized(true);
        setDbError(null);
      } else {
        setDbError(result.error || 'Database initialization failed');
        setIsDbInitialized(false);
        
        // Continue with limited functionality after 3 seconds
        setTimeout(() => {
          setIsDbInitialized(true);
          console.log('🔄 Continuing with limited database functionality...');
        }, 3000);
      }
      
      // Return cleanup function
      return cleanupTheme;
    };

    const cleanup = initializeApp();
    
    // Cleanup on unmount
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const handleLogin = (user: User) => {
    // Defensive: ensure user exists and has a role
    if (!user || typeof user !== 'object') {
      console.warn('handleLogin called with invalid user:', user);
      return;
    }

    setCurrentUser(user);
    setShowAuth(false);
    try {
      setActiveSection(getDefaultSection(user));
    } catch (err) {
      console.warn('Failed to determine default section for user:', err);
      setActiveSection(APP_SECTIONS.DASHBOARD);
    }
    console.log('✅ User logged in:', user.username || 'unknown', '- Role:', user.role || 'unknown');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuth(true);
    setActiveSection(APP_SECTIONS.DASHBOARD);
    setSidebarOpen(false);
    console.log('📤 User logged out');
  };

  const handleNavigate = (section: AppSection | string) => {
    setActiveSection(section as AppSection);
    setSidebarOpen(false);
  };

  // Show authentication portal if not logged in
  if (showAuth || !currentUser) {
    return <AuthenticationPortal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex bg-white">
        {/* Mobile menu button */}
        <Button
          className="md:hidden fixed top-4 left-4 z-50 bubble-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Sidebar */}
        <Sidebar 
          activeSection={activeSection}
          onNavigate={handleNavigate}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          userRole={currentUser.role}
        />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 md:ml-0 min-h-screen bg-white">
          <main className="p-4 md:p-6 lg:p-8 pt-16 md:pt-6 lg:pt-8 bg-white">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <AppHeader 
                currentUser={currentUser}
                activeSection={activeSection}
                onLogout={handleLogout}
              />

              {/* Database error display */}
              {dbError && <DatabaseError error={dbError} />}

              {/* Main content area */}
              <div className="space-y-6 bg-white">
                {!isDbInitialized ? (
                  <LoadingScreen />
                ) : (
                  <ContentRouter 
                    activeSection={activeSection}
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                    studentId={currentUser.studentId}
                  />
                )}
              </div>

              {/* Footer */}
              <AppFooter />
            </div>
          </main>
        </div>
      </div>

      {/* Status indicator */}
      <StatusIndicator 
        isDbInitialized={isDbInitialized}
        dbError={dbError}
      />
    </div>
  );
}