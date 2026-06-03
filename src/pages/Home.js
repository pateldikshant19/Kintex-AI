import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Users, Cpu, Activity, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Analysis',
      description: 'Process millions of data points per millisecond to get instant insights during live games.',
      link: '/dashboard',
      accent: 'blue'
    },
    {
      icon: Cpu,
      title: 'AI Prediction Models',
      description: 'Leverage neural networks to forecast player injury risks and match outcomes with high precision.',
      link: '/analytics',
      accent: 'emerald'
    },
    {
      icon: Users,
      title: 'Roster Optimization',
      description: 'Smart algorithms to suggest the perfect lineup based on opponent data and player form.',
      link: '/players',
      accent: 'blue'
    }
  ];

  const accentColors = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' },
  };

  return (
    <div className="text-slate-900 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Ambient glows — very subtle */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[5%] w-[35%] h-[40%] bg-blue-500/5 dark:bg-blue-600/8 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[35%] bg-emerald-500/4 dark:bg-emerald-600/6 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 md:py-32">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 mb-10 rounded-full bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] shadow-sm">
            <div className="live-dot"></div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Pro Bridge Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.05]">
            Where Intelligence<br />
            <span className="text-slate-400 dark:text-slate-500">Meets Mastery</span>
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-xl leading-relaxed">
            Elevate your team's potential with the world's most advanced analytics platform. Transform raw data into winning strategies.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            {user ? (
              <Link
                to={user.role ? `/dashboard/${user.role}` : '/dashboard'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                Go to Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                >
                  Start Free Trial <ArrowRight size={15} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] text-slate-700 dark:text-slate-300 text-sm font-bold uppercase tracking-wider rounded-xl hover:border-slate-300 dark:hover:border-[#2a2a3a] transition-all"
                >
                  Login to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20">
        <div className="absolute top-0 left-0 right-0 k-accent-line"></div>
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Platform Capabilities</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Engineered for Excellence
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description, link, accent }) => {
              const c = accentColors[accent];
              return (
                <Link
                  key={title}
                  to={link}
                  className="group bg-white dark:bg-[#13131a] border border-slate-200 dark:border-[#1e1e2a] rounded-2xl p-6 hover:border-slate-300 dark:hover:border-[#2a2a3a] transition-all duration-200 hover:-translate-y-1 hover:shadow-sm relative overflow-hidden"
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-5`}>
                    <Icon className={c.text} size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                    {description}
                  </p>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${c.text} uppercase tracking-widest`}>
                    Explore <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  {/* Bottom accent bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${c.bar} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative py-16">
        <div className="absolute top-0 left-0 right-0 k-accent-line"></div>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 text-center">
            Trusted by Elite Organizations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60 dark:opacity-40 hover:opacity-80 dark:hover:opacity-60 transition-opacity duration-300">
            <img src="/teams/LIGASPORT.png" alt="Ligasport" className="h-10 md:h-12 w-auto object-contain hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0 duration-300" />
            <img src="/teams/TECHRUN.png" alt="Techrun" className="h-10 md:h-12 w-auto object-contain hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0 duration-300" />
            <img src="/teams/DATA-FC.png" alt="Data FC" className="h-10 md:h-12 w-auto object-contain hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0 duration-300" />
            <img src="/teams/OLYMPICA.png" alt="Olympica" className="h-10 md:h-12 w-auto object-contain hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0 duration-300" />
            <img src="/teams/ROYAL-CHALLENGERS.png" alt="Royal Challengers" className="h-10 md:h-12 w-auto object-contain hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0 duration-300" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;