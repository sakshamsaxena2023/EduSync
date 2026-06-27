import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import GroupHub from './pages/GroupHub';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import { Terminal, LogOut, Code, Users, Trophy, Settings } from 'lucide-react';

const AppContent = () => {
  const { user, loading, isAuthenticated, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div class="min-h-screen bg-darkBg flex items-center justify-center">
        <span class="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent"></span>
      </div>
    );
  }

  // Not logged in -> Show Auth Page (Login/Register)
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Logged in but profile incomplete -> Force Onboarding Quiz
  if (!user.profileCompleted) {
    return <Onboarding />;
  }

  // Logged in & Profile completed -> Main Dashboard Shell
  return (
    <div class="min-h-screen bg-darkBg text-gray-100 pb-12">
      
      {/* Navigation Header */}
      <header class="border-b border-darkBorder/60 bg-darkCard/50 backdrop-blur sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <Terminal class="w-4 h-4 text-white" />
            </div>
            <span class="font-extrabold text-white text-lg tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              EduSync
            </span>
          </div>

          {/* Navigation Links */}
          <nav class="flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Code },
              { id: 'grouphub', label: 'Study Group', icon: Users },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'admin', label: 'Admin Panel', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow shadow-violet-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-darkBorder/40'
                }`}
              >
                <tab.icon class="w-3.5 h-3.5" />
                <span class="hidden md:inline">{tab.label}</span>
              </button>
            ))}

            <button
              onClick={logout}
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-all font-semibold ml-2"
              title="Sign Out"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span class="hidden md:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main class="max-w-7xl mx-auto px-4 pt-8">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'grouphub' && <GroupHub />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
};

// Main App wrapper to hook Auth Context Provider
function App() {
  return (
    <React.StrictMode>
      <div class="selection:bg-violet-500/30 selection:text-violet-200">
        <AppContent />
      </div>
    </React.StrictMode>
  );
}

export default App;
