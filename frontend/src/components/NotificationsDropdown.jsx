import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      const allNotifications = response.data.data || [];
      
      // Sort by date (newest first)
      allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setNotifications(allNotifications.slice(0, 10)); // Show last 10
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Don't throw - just set empty state
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await apiClient.patch('/notifications/read-all');
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      GRADE_POSTED: '📊',
      ASSIGNMENT_CREATED: '📝',
      ASSIGNMENT_DUE_SOON: '⏰',
      MATERIAL_UPLOADED: '📄',
      MESSAGE_RECEIVED: '💬',
      ENROLLMENT_APPROVED: '✅',
      COURSE_UPDATED: '📚',
      ANNOUNCEMENT: '📢',
      DEFAULT: '🔔'
    };
    return icons[type] || icons.DEFAULT;
  };

  const getNotificationColor = (type) => {
    const colors = {
      GRADE_POSTED: 'bg-green-100 text-green-700',
      ASSIGNMENT_CREATED: 'bg-blue-100 text-blue-700',
      ASSIGNMENT_DUE_SOON: 'bg-red-100 text-red-700',
      MATERIAL_UPLOADED: 'bg-purple-100 text-purple-700',
      MESSAGE_RECEIVED: 'bg-indigo-100 text-indigo-700',
      ENROLLMENT_APPROVED: 'bg-teal-100 text-teal-700',
      COURSE_UPDATED: 'bg-yellow-100 text-yellow-700',
      ANNOUNCEMENT: 'bg-orange-100 text-orange-700',
      DEFAULT: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.DEFAULT;
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-white hover:text-blue-100 font-medium disabled:opacity-50"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="text-5xl mb-3">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getNotificationColor(notification.type)} flex items-center justify-center text-xl mr-3`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 text-center border-t">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
