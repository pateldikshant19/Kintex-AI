import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Analytics from './pages/Analytics';
import DashboardPlayer from './pages/DashboardPlayer';
import DashboardAnalyst from './pages/DashboardAnalyst';
import DashboardManager from './pages/DashboardManager';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/App.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Developers from './pages/Developers';
import AIChat from './components/AIChat';
import AdminAnalytics from './pages/AdminAnalytics';
import AnalyticsTracker from './components/AnalyticsTracker';
import PlayerBio from './pages/PlayerBio';
import PublicHubApp from './public-hub/PublicHubApp'; // Import the new Public Hub module
import Gateway from './pages/Gateway'; // Import the Gateway page
import CricketLab from './pages/CricketLab'; // Import Cricket Intelligence and CV page

function App() {
  // Clear login details on initial load as per user request "remove all the login person details till now"
  React.useEffect(() => {
    // localStorage.removeItem('activeUser'); // Disabling this to allow persistent login for testing
  }, []);

  return (
    <AuthProvider>
      <SessionProvider>
        <ThemeProvider>
          <Router>
            <AnalyticsTracker />
            <Routes>
              <Route path="/" element={<Gateway />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/system-admin" element={<AdminAnalytics />} />
              <Route path="/hub/*" element={<PublicHubApp />} />
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen premium-bg text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8 relative">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/developers" element={<Developers />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/player/:id" element={<PlayerBio />} />
            <Route path="/cricket-lab" element={<CricketLab />} />
          </Route>


          <Route element={<ProtectedRoute allowedRoles={['player']} />}>
            <Route path="/dashboard/player" element={<DashboardPlayer />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['analyst']} />}>
            <Route path="/dashboard/analyst" element={<DashboardAnalyst />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
            <Route path="/dashboard/manager" element={<DashboardManager />} />
          </Route>

        </Routes>
        {/* Persistent AI Chat Assistant */}
        <AIChat />
      </main>
    </div>
  );
}

export default App;