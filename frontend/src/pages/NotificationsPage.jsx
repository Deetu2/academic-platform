import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../api/client';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications');
      // Backend returns { success: true, data: { notifications: [], unreadCount: 0 } }
      const allNotifications = response.data.data.notifications || [];
      
      // Ensure it's an array before sorting
      if (Array.isArray(allNotifications)) {
        allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(allNotifications);
      } else {
        console.error('Notifications response is not an array:', allNotifications);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    const icons = {
      NEW_ASSIGNMENT: '📝',
      ASSIGNMENT_CREATED: '📝',
      MATERIAL_UPLOADED: '📄',
      DEADLINE_APPROACHING: '⏰',
      GRADE_RELEASED: '📊',
      NEW_MESSAGE: '💬',
      NEW_SUBMISSION: '✅',
    };
    return icons[type] || '🔔';
  };

  const getNotificationLabel = (type) => {
    const labels = {
      NEW_ASSIGNMENT: 'Assignment',
      ASSIGNMENT_CREATED: 'Assignment',
      MATERIAL_UPLOADED: 'Material',
      DEADLINE_APPROACHING: 'Deadline',
      GRADE_RELEASED: 'Grade',
      NEW_MESSAGE: 'Message',
      NEW_SUBMISSION: 'Submission',
    };
    return labels[type] || 'Notification';
  };

  const getNotificationColor = (type) => {
    const colors = {
      NEW_ASSIGNMENT: 'from-blue-500 to-cyan-500',
      ASSIGNMENT_CREATED: 'from-blue-500 to-cyan-500',
      MATERIAL_UPLOADED: 'from-purple-500 to-violet-500',
      DEADLINE_APPROACHING: 'from-red-500 to-pink-500',
      GRADE_RELEASED: 'from-green-500 to-emerald-500',
      NEW_MESSAGE: 'from-indigo-500 to-blue-500',
      NEW_SUBMISSION: 'from-teal-500 to-green-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your academic activities</p>
        </div>

        {/* Stats & Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md inline-flex mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'read'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">
              {filter === 'unread' ? '✅' : filter === 'read' ? '📭' : '🔔'}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'All caught up!' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 mb-1">
              {filter === 'unread' ? "You've read all your notifications" : filter === 'read' ? 'Read notifications will appear here' : "You'll be notified about important updates"}
            </p>
            <p className="text-xs text-gray-400 mt-2">Notifications system requires backend API</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getNotificationColor(notification.type)} flex items-center justify-center text-2xl mr-4 shadow-md`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Type Label */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {getNotificationLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            New
                          </span>
                        )}
                      </div>
                      
                      {/* Title */}
                      <p className={`text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {notification.title}
                      </p>
                      
                      {/* Body */}
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.body}
                      </p>
                      
                      {/* Time */}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center space-x-4 mt-3">
                        {notification.link && (
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Details →
                          </button>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
