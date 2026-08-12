import React, { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertCircle, Clock } from 'lucide-react';
import apiService from '../utils/apiService';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Upcoming Cricket Match', message: 'India vs Australia T20 starts in 2 hours.', type: 'alert', time: '10 min ago', read: false },
  { id: '2', title: 'Cricket Tournament Event', message: 'IPL 2026 Mega Auction date announced.', type: 'info', time: '2 hours ago', read: false },
  { id: '3', title: 'New Cricket Article', message: 'Deep dive into Virat Kohli\'s batting analytics.', type: 'info', time: '1 day ago', read: true },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate real-time live match notifications
  useEffect(() => {
    let interval;
    
    const fetchAndSimulateLive = async () => {
      try {
        const res = await apiService.getLiveMatches();
        const realMatches = res.data || [];
        
        if (realMatches.length > 0) {
          // Send a one-time notification for the upcoming matches
          const upcomingMatches = realMatches.filter(m => m.status && (m.status.toLowerCase().includes('upcoming') || m.status.toLowerCase().includes('preview')));
          if (upcomingMatches.length > 0) {
            const newNotifications = upcomingMatches.slice(0, 3).map((uMatch, i) => {
              const tNames = uMatch.name ? uMatch.name.split(',')[0] : 'Match';
              return {
                id: `upc-${Date.now()}-${i}`, 
                title: `Upcoming Match Alert`, 
                message: `${tNames} is scheduled today.`, 
                type: 'info', 
                time: 'Just now', 
                read: false 
              };
            });
            setNotifications(prev => [...newNotifications, ...prev]);
          }

          let eventIndex = 0;
          
          interval = setInterval(() => {
            const liveMatches = realMatches.filter(m => !m.status || !m.status.toLowerCase().includes('upcoming'));
            if (liveMatches.length === 0) return;
            const randomMatch = liveMatches[Math.floor(Math.random() * liveMatches.length)];
            const teamNames = randomMatch.name ? randomMatch.name.split(',')[0] : 'Unknown Match';
            
            const dynamicEvents = [
              { id: `live-${Date.now()}-1`, title: `Live Update: ${teamNames}`, message: `WICKET! Key batsman dismissed. ${randomMatch.status || 'Match is live'}`, type: 'alert', time: 'Just now', read: false },
              { id: `live-${Date.now()}-2`, title: `Live Update: ${teamNames}`, message: `SIX! Massive hit into the stands.`, type: 'info', time: 'Just now', read: false },
              { id: `live-${Date.now()}-3`, title: `Milestone Alert: ${teamNames}`, message: `Half-century reached!`, type: 'info', time: 'Just now', read: false }
            ];

            const newEvent = dynamicEvents[eventIndex % dynamicEvents.length];
            setNotifications(prev => [newEvent, ...prev]);
            eventIndex++;
          }, 15000); // Trigger a live event every 15 seconds
        }
      } catch (err) {
        console.error("Failed to fetch matches for notifications", err);
      }
    };
    
    fetchAndSimulateLive();

    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-[#1a1a24]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0a0c]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#13131a] rounded-xl shadow-xl border border-slate-200 dark:border-[#1e1e2a] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e1e2a]">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600 opacity-50" />
                <p className="text-sm">You have no notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#1e1e2a]">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-[#1a1a24] transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">{notification.time}</span>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
