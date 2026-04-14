import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState({
    newAssignment: true,
    gradeReleased: true,
    newSubmission: true,
    newMessage: true,
    deadlineReminder: true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    // Simulate save — extend with real API when ready
    setTimeout(() => {
      setSaving(false);
      setSuccess('Notification preferences saved!');
      setTimeout(() => setSuccess(''), 3000);
    }, 800);
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('This will log you out from all devices. Continue?')) return;
    await logout();
    navigate('/');
  };

  const notificationItems = [
    { key: 'newAssignment', label: 'New Assignment Posted', desc: 'When a lecturer posts a new assignment', icon: '📝' },
    { key: 'gradeReleased', label: 'Grade Released', desc: 'When your submission is graded', icon: '🏆' },
    { key: 'newSubmission', label: 'New Submission', desc: 'When a student submits an assignment', icon: '📤' },
    { key: 'newMessage', label: 'New Message', desc: 'When you receive a new message', icon: '💬' },
    { key: 'deadlineReminder', label: 'Deadline Reminders', desc: 'Reminders before assignment deadlines', icon: '⏰' },
  ];

  const gradientBg = {
    ADMIN: 'from-purple-600 via-pink-600 to-indigo-600',
    LECTURER: 'from-blue-600 via-indigo-600 to-purple-600',
    STUDENT: 'from-green-600 via-teal-600 to-blue-600',
  }[user?.role] || 'from-gray-500 to-gray-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      <div className={`bg-gradient-to-r ${gradientBg} text-white`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-white/80">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <span className="text-green-600">✅</span>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            👤 Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-1">Full Name</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-1">Email Address</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-1">Role</p>
              <p className="font-semibold text-gray-900">{user?.role}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-1">Account Status</p>
              <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </span>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium shadow-md">
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔔 Notification Preferences
          </h2>
          <div className="space-y-4">
            {notificationItems.map(item => (
              // Only show relevant notifications per role
              (item.key === 'newSubmission' && user?.role === 'STUDENT') ? null : (
                (item.key === 'gradeReleased' && user?.role === 'LECTURER') ? null : (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        notifications[item.key] ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                        notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                )
              )
            ))}
          </div>
          <div className="mt-4">
            <button onClick={handleSaveNotifications} disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium shadow-md disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 Save Preferences'}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔒 Security
          </h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔑</span>
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={handleLogoutAllDevices}
              className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="text-xl">📵</span>
                <div>
                  <p className="font-medium text-orange-700">Logout All Devices</p>
                  <p className="text-sm text-orange-600">Sign out from all active sessions</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            ℹ️ About
          </h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><span className="font-medium">App:</span> AcademiQ Platform</p>
            <p><span className="font-medium">Version:</span> 1.0.0</p>
            <p><span className="font-medium">Stack:</span> React + Node.js + PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
