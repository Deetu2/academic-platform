import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications?unreadOnly=true');
      const notifications = response.data.data.notifications || [];
      setUnreadCount(notifications.length);
    } catch (error) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const getRoleColor = () => {
    switch (user?.role) {
      case 'ADMIN': return 'from-purple-500 to-pink-500';
      case 'LECTURER': return 'from-blue-500 to-indigo-500';
      case 'STUDENT': return 'from-green-500 to-teal-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700',
    LECTURER: 'bg-blue-100 text-blue-700',
    STUDENT: 'bg-green-100 text-green-700',
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-purple-600 cursor-pointer" onClick={() => navigate('/')}>
              Academic Platform
            </h1>
            <span className={`ml-3 px-3 py-1 ${roleColors[user?.role] || 'bg-gray-100 text-gray-700'} rounded-full text-sm font-medium`}>
              {user?.role}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
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

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{user?.email}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>👤</span> Edit Profile
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>⚙️</span> Settings
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
