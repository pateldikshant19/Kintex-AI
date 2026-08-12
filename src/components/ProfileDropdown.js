import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, Heart, Settings, LogOut, ChevronDown, ShieldAlert, LayoutDashboard, Shield, BarChart3, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ user, logout, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsOpen(false);
    onOpenSettings();
  };

  const role = (user?.role || '').toLowerCase();
  let dashboardPath = '/dashboard/player';
  let dashboardTitle = 'Athlete Portal';
  let DashboardIcon = Activity;

  if (role === 'manager') {
    dashboardPath = '/dashboard/manager';
    dashboardTitle = 'Manager Command Center';
    DashboardIcon = Shield;
  } else if (role === 'analyst') {
    dashboardPath = '/dashboard/analyst';
    dashboardTitle = 'Analyst Command Center';
    DashboardIcon = BarChart3;
  } else if (role === 'admin') {
    dashboardPath = '/admin';
    dashboardTitle = 'Admin Control Panel';
    DashboardIcon = ShieldAlert;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#1a1a24] p-1.5 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none mr-1">
          <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">{user?.name || 'User'}</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{role || 'User'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#13131a] rounded-xl shadow-xl border border-slate-200 dark:border-[#1e1e2a] overflow-hidden z-50">
          <div className="p-3 bg-slate-50 dark:bg-[#0a0a0c] border-b border-slate-100 dark:border-[#1e1e2a]">
            <p className="text-sm font-black text-slate-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            <span className="inline-block px-2 py-0.5 mt-1 bg-blue-500/10 text-blue-500 rounded text-[9px] font-black uppercase tracking-widest">
              Role: {role}
            </span>
          </div>
          
          <div className="p-1.5">
            {/* DIRECT ROLE DASHBOARD LINK */}
            <Link 
              to={dashboardPath} 
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-black text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 rounded-lg transition-colors mb-1"
              onClick={() => setIsOpen(false)}
            >
              <DashboardIcon className="w-4 h-4" /> {dashboardTitle}
            </Link>

            {(role === 'admin' || role === 'manager') && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a24] rounded-lg transition-colors font-bold"
                onClick={() => setIsOpen(false)}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Admin Control Panel
              </Link>
            )}

            <Link 
              to="/profile" 
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" /> Profile Details
            </Link>
            <Link 
              to="/saved" 
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Bookmark className="w-4 h-4" /> Saved Items
            </Link>
            <Link 
              to="/favorites" 
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4 h-4" /> Favorites
            </Link>
          </div>
          
          <div className="p-1.5 border-t border-slate-100 dark:border-[#1e1e2a]">
            <button 
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors font-bold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
