import React, { useState } from 'react';
import { Terminal, Database, Shield, Zap, Code, ChevronRight, BarChart, Server } from 'lucide-react';

const Developers = () => {
  const [activeTab, setActiveTab] = useState('api');

  const apiEndpoints = [
    { method: 'GET', path: '/api/auth/profile', description: 'Get authenticated user data', risk: 'Low' },
    { method: 'POST', path: '/api/analytics/matches', description: 'Request real-time match data', risk: 'Medium' },
    { method: 'GET', path: '/api/performance/metrics', description: 'Fetch aggregated player stats', risk: 'Low' },
    { method: 'POST', path: '/api/admin/predict', description: 'Trigger AI prediction engine', risk: 'High' },
  ];

  const technologies = [
    { name: 'React 18', icon: <Code />, color: 'text-blue-400' },
    { name: 'Node.js', icon: <Server />, color: 'text-emerald-400' },
    { name: 'MongoDB', icon: <Database />, color: 'text-green-500' },
    { name: 'Python AI', icon: <Zap />, color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter flex items-center gap-4">
          <Terminal size={40} className="text-indigo-500" /> API & DEVELOPER PORTAL
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl">
          Build on top of the Kinetix ecosystem. Access powerful insights via our robust RESTful interface.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tech Stack Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">CORE ARCHITECTURE</h3>
            <div className="space-y-4">
              {technologies.map(tech => (
                <div key={tech.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className={`${tech.color} group-hover:scale-110 transition-transform`}>{tech.icon}</div>
                  <span className="font-bold text-white text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <Shield className="text-blue-400 mb-4" size={32} />
              <h4 className="text-white font-bold mb-2">Secure Sandbox</h4>
              <p className="text-xs text-blue-200/60 mb-4 leading-relaxed">
                Test your integrations in a secure environment before deploying to production.
              </p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 transition-colors">
                REQUEST ACCESS
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 text-blue-500/10 group-hover:scale-125 transition-transform duration-700">
               <Shield size={120} />
            </div>
          </div>
        </div>

        {/* API reference main content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl min-h-[500px]">
            <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-white/5 pb-4">
              <button 
                onClick={() => setActiveTab('api')}
                className={`text-sm font-black uppercase tracking-widest pb-4 transition-all relative ${activeTab === 'api' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-white'}`}
              >
                API ENDPOINTS
              </button>
              <button 
                onClick={() => setActiveTab('docs')}
                className={`text-sm font-black uppercase tracking-widest pb-4 transition-all relative ${activeTab === 'docs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-white'}`}
              >
                DOCUMENTATION
              </button>
              <button 
                onClick={() => setActiveTab('sdk')}
                className={`text-sm font-black uppercase tracking-widest pb-4 transition-all relative ${activeTab === 'sdk' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-white'}`}
              >
                SDK DOWNLOADS
              </button>
            </div>

            {activeTab === 'api' && (
              <div className="space-y-4">
                {apiEndpoints.map((ep, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${
                        ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ep.method}
                      </span>
                      <code className="text-white font-mono text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{ep.path}</code>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xs text-slate-500 font-medium italic">{ep.description}</p>
                      <ChevronRight className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" size={18} />
                    </div>
                  </div>
                ))}
                
                <div className="mt-12 p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 text-center">
                    <BarChart className="text-indigo-400 mx-auto mb-4" size={40} />
                    <h3 className="text-xl font-bold text-white mb-2">Performance Metrics API coming soon!</h3>
                    <p className="text-slate-400 text-sm">Join the mailing list for early access to the next generation of sports data.</p>
                </div>
              </div>
            )}
            
            {activeTab !== 'api' && (
              <div className="py-20 text-center">
                <div className="inline-block p-4 rounded-full bg-slate-800 text-slate-400 mb-4">
                    <Terminal size={32} />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Content Loading...</h3>
                <p className="text-slate-500">We are currently migrating our offline documentation to the cloud.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developers;
