import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center px-6 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl transition-all duration-300 relative">
      {/* Subtle accent bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-0 w-full">
        <div className="flex justify-between items-center">
          {/* Brand */}
          <Link
            to={user ? `/dashboard/${user.role}` : '/home'}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] flex items-center justify-center overflow-hidden p-1 shadow-sm">
              <img src="/logo.png" alt="Kinetix AI" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
              KINETIX<span className="text-blue-500 font-light ml-1 tracking-widest text-xs">AI</span>
            </span>
          </Link>
 
          {/* Center Navigation Links (When Logged In) */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to={`/dashboard/${user.role}`} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/dashboard') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Dashboard
              </Link>
              <Link to="/players" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/player') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Roster
              </Link>
              <Link to="/analytics" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/analytics') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Analytics
              </Link>
              <Link to="/cricket-lab" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname.includes('/cricket-lab') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Cricket Lab
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">{user.name}</span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">{user.teamName || user.role}</span>
                </div>
                {user.teamName && (
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] p-1">
                    <img
                      src={`/teams/${user.teamName.replace(' ', '-').toUpperCase()}.png`}
                      className="w-full h-full object-contain"
                      alt="Team"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1e1e2a] rounded-lg hover:bg-slate-50 dark:hover:bg-[#13131a] hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e1e2a] rounded-lg hover:bg-slate-50 dark:hover:bg-[#13131a] transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
            <div className="w-px h-5 bg-slate-200 dark:bg-[#1e1e2a]"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;