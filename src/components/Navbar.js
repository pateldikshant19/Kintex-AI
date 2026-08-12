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
               <Link to="/players" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/player') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
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
            
            <div className="w-px h-5 bg-slate-200 dark:bg-[#1e1e2a] mx-1"></div>
            
            <ThemeToggle />
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-[#1a1a24]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>

            {user ? (
              <div className="ml-1">
                <ProfileDropdown 
                  user={user} 
                  logout={logout} 
                  onOpenSettings={() => setIsSettingsOpen(true)} 
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0a0a0c] border-b border-slate-200 dark:border-[#1e1e2a] px-6 py-4 space-y-3 z-30 shadow-lg">
          <Link
            to="/home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-blue-500 py-1.5"
          >
            Home
          </Link>
          <Link
            to="/players"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-blue-500 py-1.5"
          >
            Players
          </Link>
          <Link
            to="/teams"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-blue-500 py-1.5"
          >
            Teams
          </Link>
          <Link
            to="/analytics"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-blue-500 py-1.5"
          >
            Public Reports
          </Link>
        </div>
      )}

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PublicSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Navbar;