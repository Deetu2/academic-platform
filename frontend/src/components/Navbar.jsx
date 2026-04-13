import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications?unreadOnly=true');
      // Backend returns { success: true, data: { notifications: [], unreadCount: N } }
      const notifications = response.data.data.notifications || [];
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">
              Academic Platform
            </h1>
            <span className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {user?.role}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
