import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, Heart, Settings, LogOut, ChevronDown, ShieldAlert } from 'lucide-react';
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#1a1a24] p-1.5 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/50">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none mr-1">
          <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">{user?.name || 'User'}</span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Public Profile</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#13131a] rounded-xl shadow-xl border border-slate-200 dark:border-[#1e1e2a] overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 dark:border-[#1e1e2a]">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
          </div>
          
          <div className="p-1.5">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors font-bold"
                onClick={() => setIsOpen(false)}
              >
                <ShieldAlert className="w-4 h-4" /> Admin Panel
              </Link>
            )}
            <Link 
              to="/profile" 
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link 
              to="/saved" 
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Bookmark className="w-4 h-4" /> Saved Items
            </Link>
            <Link 
              to="/favorites" 
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4 h-4" /> Favorites
            </Link>
          </div>
          
          <div className="p-1.5 border-t border-slate-100 dark:border-[#1e1e2a]">
            <button 
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a24] rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
