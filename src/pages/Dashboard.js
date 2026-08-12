import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardManager from './DashboardManager';
import DashboardAnalyst from './DashboardAnalyst';
import DashboardPlayer from './DashboardPlayer';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();

  if (role === 'manager') {
    return <DashboardManager />;
  }

  if (role === 'analyst') {
    return <DashboardAnalyst />;
  }

  if (role === 'player' || role === 'athlete') {
    return <DashboardPlayer />;
  }

  if (role === 'admin') {
    return <AdminPanel />;
  }

  // Default fallback to Manager Command Center
  return <DashboardManager />;
};

export default Dashboard;