import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Users, Activity, ShieldAlert, Cpu, 
    RefreshCw, Database, Search, Filter, CheckCircle, 
    XCircle, Trophy, Radio, Zap, BarChart3, Globe,
    ArrowUpRight, ShieldCheck, UserCheck, Layers, Server
} from 'lucide-react';
import api from '../utils/apiService';

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'visits' | 'database'

    // User filters
    const [userQuery, setUserQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sportFilter, setSportFilter] = useState('all');

    // Visit filter
    const [visitQuery, setVisitQuery] = useState('');

    const fetchAdminData = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const API_BASE = process.env.REACT_APP_API_URL || '/api';
            const token = localStorage.getItem('token');
            const headers = { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } : {})
            };

            let statsData = null;
            let usersData = [];
            let visitsData = [];

            try {
                const sRes = await api.get('/admin/stats');
                statsData = sRes.data;
            } catch (e) {
                const r = await fetch(`${API_BASE}/admin/stats`, { headers }).catch(() => null);
                if (r && r.ok) statsData = await r.json();
            }

            try {
                const uRes = await api.get('/admin/users');
                usersData = Array.isArray(uRes.data) ? uRes.data : [];
            } catch (e) {
                const r = await fetch(`${API_BASE}/admin/users`, { headers }).catch(() => null);
                if (r && r.ok) usersData = await r.json();
            }

            try {
                const vRes = await api.get('/admin/visits');
                visitsData = vRes.data?.recentVisits || [];
            } catch (e) {
                const r = await fetch(`${API_BASE}/admin/visits`, { headers }).catch(() => null);
                if (r && r.ok) {
                    const parsed = await r.json();
                    visitsData = parsed.recentVisits || [];
                }
            }

            setStats(statsData);
            setUsers(usersData);
            setVisits(visitsData);
            setError(null);
        } catch (err) {
            console.error("Admin data fetch error", err);
            setError("Failed to load admin data. Ensure you have administrative privileges.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            const updated = await api.patch(`/admin/users/${userId}`, { isActive: !currentStatus });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: updated.data.isActive } : u));
            setActionMsg(`Updated status for user.`);
            setTimeout(() => setActionMsg(null), 3000);
        } catch (err) {
            console.error("Failed to toggle status", err);
            alert("Failed to update user status.");
        }
    };

    const handleSeedData = async () => {
        if (!window.confirm("Run database feed to populate missing users, visits, and analytics records?")) return;
        setSeeding(true);
        setActionMsg("Feeding admin panel database with details...");
        try {
            const res = await api.post('/admin/seed');
            setActionMsg(res.data?.message || "Data feed complete!");
            await fetchAdminData();
        } catch (err) {
            console.error("Seeding failed", err);
            setActionMsg("Seeding encountered an error, but partial data may have loaded.");
        } finally {
            setSeeding(false);
            setTimeout(() => setActionMsg(null), 4000);
        }
    };

    // Filter logic
    const filteredUsers = users.filter(user => {
        const matchesQuery = !userQuery || 
            (user.name && user.name.toLowerCase().includes(userQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(userQuery.toLowerCase())) ||
            (user.teamName && user.teamName.toLowerCase().includes(userQuery.toLowerCase()));
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesSport = sportFilter === 'all' || user.sport === sportFilter;

        return matchesQuery && matchesRole && matchesSport;
    });

    const filteredVisits = visits.filter(v => {
        if (!visitQuery) return true;
        const q = visitQuery.toLowerCase();
        return (v.path && v.path.toLowerCase().includes(q)) ||
               (v.ip && v.ip.toLowerCase().includes(q)) ||
               (v.userAgent && v.userAgent.toLowerCase().includes(q));
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-950 text-white">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-400 font-medium tracking-wide">Initializing Kinetix Admin Overwatch...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="bg-rose-950/40 border border-rose-800/50 rounded-3xl p-12 max-w-xl mx-auto backdrop-blur-xl">
                    <ShieldAlert size={56} className="mx-auto mb-4 text-rose-500 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
                    <p className="text-slate-400 text-sm mb-6">You need Admin, Analyst, or Manager role to access this area.</p>
                    <button 
                        onClick={fetchAdminData}
                        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all"
                    >
                        Retry Authorization
                    </button>
                </div>
            </div>
        );
    }

    const summary = stats?.summary || {};
    const systemHealth = stats?.systemHealth || {};

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 text-slate-100 font-sans">
            
            {/* Header Banner */}
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Control Hub
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Activity size={14} className="animate-pulse" /> Systems Operational
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-3">
                            <ShieldAlert className="text-blue-500 w-10 h-10" /> KINETIX AI ADMIN PANEL
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-xl">
                            Universal Administration, Telemetry Analytics & System Data Feed Center
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={fetchAdminData}
                            disabled={refreshing}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Updating..." : "Refresh Stats"}
                        </button>

                        <button
                            onClick={handleSeedData}
                            disabled={seeding}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                        >
                            <Zap size={14} className={seeding ? "animate-bounce" : ""} />
                            {seeding ? "Feeding DB..." : "Seed / Feed DB"}
                        </button>
                    </div>
                </div>

                {actionMsg && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
                        <Zap size={14} className="text-blue-400" />
                        {actionMsg}
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 space-x-2 overflow-x-auto pb-1">
                {[
                    { id: 'overview', label: 'System Overwatch', icon: <LayoutDashboard size={16} /> },
                    { id: 'users', label: `User Directory (${users.length})`, icon: <Users size={16} /> },
                    { id: 'visits', label: `Activity Visits (${summary.totalVisits || visits.length})`, icon: <Activity size={16} /> },
                    { id: 'database', label: 'DB Collections Feed', icon: <Database size={16} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 hover:border-blue-500/30 transition-all shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                <Users size={24} />
                            </div>
                            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Registered Users</h4>
                            <div className="text-3xl font-black text-white tracking-tight">
                                {summary.totalUsers || users.length}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <UserCheck size={12} className="text-emerald-400" /> Active across 5 sport domains
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                                <Activity size={24} />
                            </div>
                            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total App Visits</h4>
                            <div className="text-3xl font-black text-white tracking-tight">
                                {(summary.totalVisits || visits.length).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <Globe size={12} className="text-indigo-400" /> {summary.uniqueVisitors || 0} Unique Visitors
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                                <Trophy size={24} />
                            </div>
                            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Database Players</h4>
                            <div className="text-3xl font-black text-white tracking-tight">
                                {summary.totalPlayers || 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <Radio size={12} className="text-rose-400 animate-pulse" /> {summary.activeLiveMatches || 0} Live Matches
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                                <Cpu size={24} />
                            </div>
                            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">System Health</h4>
                            <div className="text-3xl font-black text-emerald-400 tracking-tight">
                                {systemHealth.status || 'Optimal'}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Heap: {systemHealth.heapUsedMB || 0}MB / {systemHealth.heapTotalMB || 0}MB
                            </p>
                        </div>
                    </div>

                    {/* Middle Distributions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* User Role Distribution */}
                        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                                <Users className="text-blue-400" size={20} /> User Role Breakdown
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(stats?.roleDistribution || {}).map(([role, count]) => {
                                    const percentage = summary.totalUsers ? Math.round((count / summary.totalUsers) * 100) : 0;
                                    return (
                                        <div key={role} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="uppercase tracking-wider text-slate-300">{role}</span>
                                                <span className="text-slate-400">{count} users ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                                                <div 
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top App Endpoints */}
                        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                                <BarChart3 className="text-indigo-400" size={20} /> Top Route Activity
                            </h3>
                            <div className="space-y-3">
                                {(stats?.topRoutes || []).map((route, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-white/5">
                                        <span className="font-mono text-xs text-blue-400">{route._id || '/'}</span>
                                        <span className="text-xs font-bold text-white bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                            {route.hits} hits
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Infrastructure Monitor */}
                    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Server size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-base">Node.js Server & Database Engine</h4>
                                <p className="text-slate-400 text-xs">
                                    Runtime: {systemHealth.nodeVersion || 'v24'} • Uptime: {Math.floor((systemHealth.uptimeSeconds || 0) / 60)} minutes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
                                <CheckCircle size={14} /> Database Connected
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 2: USER DIRECTORY */}
            {activeTab === 'users' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Filters Toolbar */}
                    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                        {/* Search Input */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, email, or team..."
                                value={userQuery}
                                onChange={e => setUserQuery(e.target.value)}
                                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Role & Sport Dropdowns */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-slate-800/80 border border-white/10 px-3 py-2 rounded-2xl">
                                <Filter size={14} className="text-slate-400" />
                                <select 
                                    value={roleFilter} 
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-white focus:outline-none uppercase"
                                >
                                    <option value="all" className="bg-slate-900">All Roles</option>
                                    <option value="admin" className="bg-slate-900">Admin</option>
                                    <option value="manager" className="bg-slate-900">Manager</option>
                                    <option value="analyst" className="bg-slate-900">Analyst</option>
                                    <option value="athlete" className="bg-slate-900">Athlete</option>
                                    <option value="player" className="bg-slate-900">Player</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-800/80 border border-white/10 px-3 py-2 rounded-2xl">
                                <select 
                                    value={sportFilter} 
                                    onChange={e => setSportFilter(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-white focus:outline-none uppercase"
                                >
                                    <option value="all" className="bg-slate-900">All Sports</option>
                                    <option value="Cricket" className="bg-slate-900">Cricket</option>
                                    <option value="Football" className="bg-slate-900">Football</option>
                                    <option value="Basketball" className="bg-slate-900">Basketball</option>
                                    <option value="Tennis" className="bg-slate-900">Tennis</option>
                                    <option value="Baseball" className="bg-slate-900">Baseball</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* User Table */}
                    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users className="text-blue-500" size={20} /> Registered User Directory
                            </h3>
                            <span className="text-xs font-semibold text-slate-400">
                                Showing {filteredUsers.length} of {users.length} users
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Sport / Team</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Joined Date</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-300">
                                    {filteredUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-bold text-white flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black flex items-center justify-center text-xs">
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{user.name}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-slate-400">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    user.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                    user.role === 'manager' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    user.role === 'analyst' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-semibold text-white uppercase">{user.sport || 'N/A'}</div>
                                                <div className="text-[11px] text-slate-500">{user.teamName || 'Global'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    user.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                    {user.isActive !== false ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                    {user.isActive !== false ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleToggleUserStatus(user._id, user.isActive !== false)}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all"
                                                >
                                                    {user.isActive !== false ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-slate-500">
                                                No users match the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 3: VISITS ACTIVITY LOG */}
            {activeTab === 'visits' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Search & Filter */}
                    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by route path, IP address, or agent..."
                                value={visitQuery}
                                onChange={e => setVisitQuery(e.target.value)}
                                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="text-xs text-slate-400 font-semibold">
                            Total Tracked Telemetry Visits: <span className="text-white font-bold">{summary.totalVisits || visits.length}</span>
                        </div>
                    </div>

                    {/* Visits Table */}
                    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="p-4">Route Path</th>
                                        <th className="p-4">IP Address</th>
                                        <th className="p-4">User Info</th>
                                        <th className="p-4">User Agent</th>
                                        <th className="p-4 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-300">
                                    {filteredVisits.slice(0, 50).map((v, i) => (
                                        <tr key={v._id || i} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-xs text-blue-400 font-semibold">{v.path}</td>
                                            <td className="p-4 font-mono text-xs text-slate-400">{v.ip}</td>
                                            <td className="p-4 text-xs font-semibold">
                                                {v.userId ? (
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        <UserCheck size={12} /> {v.userId.name || v.userId.email}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">Anonymous</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-xs text-slate-500 truncate max-w-xs">{v.userAgent}</td>
                                            <td className="p-4 text-xs text-slate-500 text-right font-mono">
                                                {new Date(v.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredVisits.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500">
                                                No visit logs found matching query.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 4: DATABASE COLLECTIONS FEED */}
            {activeTab === 'database' && (
                <div className="space-y-6 animate-fade-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Users', count: summary.totalUsers || users.length, desc: 'Registered Admins, Managers, Analysts, Athletes & Players' },
                            { name: 'App Visits', count: summary.totalVisits || visits.length, desc: 'Telemetry activity and visitor navigation logs' },
                            { name: 'Players', count: summary.totalPlayers || 0, desc: 'Sports players database across leagues' },
                            { name: 'Teams', count: summary.totalTeams || 0, desc: 'Franchises and national teams' },
                            { name: 'Leagues', count: summary.totalLeagues || 0, desc: 'Tournament leagues and competitions' },
                            { name: 'Performances', count: summary.totalPerformances || 0, desc: 'Player match metrics and training analytics' },
                            { name: 'Injuries', count: summary.totalInjuries || 0, desc: 'Medical profiles and recovery tracking' },
                            { name: 'Live Matches', count: summary.activeLiveMatches || 0, desc: 'Active and upcoming fixture telemetry' },
                        ].map((col, i) => (
                            <div key={i} className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 space-y-3 shadow-xl">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                        <Layers className="text-blue-400" size={18} /> {col.name}
                                    </h4>
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-black text-xs">
                                        {col.count} docs
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs">{col.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                        <Database size={40} className="mx-auto text-blue-500 animate-pulse" />
                        <h3 className="text-xl font-bold text-white">Need to refresh or seed all collections?</h3>
                        <p className="text-slate-400 text-sm max-w-xl mx-auto">
                            Clicking the button below will trigger the backend database feeder script to generate fresh users, visit telemetry logs, and performance metrics.
                        </p>
                        <button
                            onClick={handleSeedData}
                            disabled={seeding}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {seeding ? "Running Feed Script..." : "Execute Full Data Feed"}
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminPanel;
