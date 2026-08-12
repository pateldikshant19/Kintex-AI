import React, { useState } from 'react';
import { X, Moon, Sun, Globe, BellRing, Info, Monitor } from 'lucide-react';

const PublicSettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  // Simple local state for demo purposes (ThemeToggle usually handles global theme)
  const [themePref, setThemePref] = useState('system'); 
  const [emailNotifs, setEmailNotifs] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#13131a] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1e1e2a] flex flex-col sm:flex-row overflow-hidden max-h-[85vh]">
        
        {/* Sidebar */}
        <div className="w-full sm:w-64 bg-slate-50 dark:bg-[#0a0a0c] border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-[#1e1e2a] p-4 flex flex-col shrink-0">
          <div className="flex items-center justify-between sm:mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
            <button onClick={onClose} className="sm:hidden p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-[#1e1e2a] rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1a1a24]'}`}
            >
              <Monitor className="w-4 h-4" /> Appearance
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1a1a24]'}`}
            >
              <BellRing className="w-4 h-4" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'language' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1a1a24]'}`}
            >
              <Globe className="w-4 h-4" /> Language
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'about' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1a1a24]'}`}
            >
              <Info className="w-4 h-4" /> About Kinetix
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <div className="hidden sm:flex justify-end mb-6">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e1e2a] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Theme Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Note: This is purely visual for the public settings modal. The actual theme toggle is in ThemeToggle.js */}
                  <button 
                    onClick={() => setThemePref('light')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${themePref === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-[#1e1e2a] hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <Sun className={`w-8 h-8 mb-2 ${themePref === 'light' ? 'text-blue-500' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${themePref === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Light</span>
                  </button>
                  <button 
                    onClick={() => setThemePref('dark')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${themePref === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-[#1e1e2a] hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <Moon className={`w-8 h-8 mb-2 ${themePref === 'dark' ? 'text-blue-500' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${themePref === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Dark</span>
                  </button>
                  <button 
                    onClick={() => setThemePref('system')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${themePref === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-[#1e1e2a] hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <Monitor className={`w-8 h-8 mb-2 ${themePref === 'system' ? 'text-blue-500' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${themePref === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>System</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#1e1e2a]">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Receive updates about major tournaments and reports.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#1a1a24] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#1e1e2a]">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Get real-time alerts in your browser.</p>
                  </div>
                  <button className="text-sm font-semibold text-blue-500 hover:text-blue-600">Enable</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Language & Region</h3>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1e1e2a]">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Language</label>
                  <select className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-[#2a2a35] text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-[#2a2a35] flex items-center justify-center mb-4 p-2 shadow-sm">
                  <img src="/logo.png" alt="Kinetix AI" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-1">
                  KINETIX<span className="text-blue-500 font-light ml-1">AI</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Version 1.0.0 (Public Release)</p>
                
                <div className="flex gap-4 text-sm font-medium text-blue-500">
                  <a href="/terms" className="hover:underline">Terms of Service</a>
                  <a href="/privacy" className="hover:underline">Privacy Policy</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSettingsModal;
