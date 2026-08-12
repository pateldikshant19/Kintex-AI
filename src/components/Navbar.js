import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import PublicSettingsModal from './PublicSettingsModal';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 h-14 flex items-center px-6 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl transition-all duration-300 relative border-b border-slate-200/50 dark:border-[#1e1e2a]/50">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-0 w-full flex justify-between items-center">
          {/* Brand - Always links to home for public portal */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link
              to="/home"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] flex items-center justify-center overflow-hidden p-1 shadow-sm group-hover:border-blue-500/30 transition-colors">
                <img src="/logo.png" alt="Kinetix AI" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                KINETIX<span className="text-blue-500 font-light ml-1 tracking-widest text-xs">AI</span>
              </span>
            </Link>
          </div>

          {/* Center Navigation Links (Hidden on Admin Panel) */}
          {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/system-admin') && (
            <div className="hidden md:flex items-center gap-6">
               <Link to="/home" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/home' || location.pathname === '/' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                 Home
               </Link>
               {user && (
                 <Link to="/dashboard" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/dashboard') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   Dashboard
                 </Link>
               )}
               <Link to="/players" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/player') && !location.pathname.includes('/dashboard') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                 Players
               </Link>
               <Link to="/teams" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/team') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                 Teams
               </Link>
               <Link to="/analytics" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/analytics') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                 Public Reports
               </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100/50 hover:bg-slate-100 dark:bg-[#13131a] dark:hover:bg-[#1a1a24] border border-slate-200 dark:border-[#1e1e2a] rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">Ctrl K</kbd>
            </button>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <NotificationDropdown />
            
            <ThemeToggle />

            {user ? (
              <ProfileDropdown user={user} logout={logout} onOpenSettings={() => setIsSettingsOpen(true)} />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors uppercase tracking-wider"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Public Settings Modal */}
      <PublicSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Navbar;