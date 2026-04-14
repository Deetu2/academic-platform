import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ProfileSkeleton } from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    department: '',
    bio: '',
    level: '',
    matricNo: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        department: user.lecturerProfile?.department || user.studentProfile?.department || '',
        bio: user.lecturerProfile?.bio || '',
        level: user.studentProfile?.level || '',
        matricNo: user.studentProfile?.matricNo || '',
      });
      setLoading(false);
    }
  }, [user]);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const getRoleColor = () => {
    switch (user?.role) {
      case 'ADMIN': return 'from-purple-500 to-pink-500';
      case 'LECTURER': return 'from-blue-500 to-indigo-500';
      case 'STUDENT': return 'from-green-500 to-teal-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      setSaving(true);
      await apiClient.patch('/me', form);
      await loadUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setSaving(true);
      await apiClient.patch('/me', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const gradientBg = {
    ADMIN: 'from-purple-600 via-pink-600 to-indigo-600',
    LECTURER: 'from-blue-600 via-indigo-600 to-purple-600',
    STUDENT: 'from-green-600 via-teal-600 to-blue-600',
  }[user?.role] || 'from-gray-500 to-gray-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientBg} text-white`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center space-x-6">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" referrerPolicy="no-referrer" className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg object-cover" />
            ) : (
              <div className={`w-20 h-20 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30 shadow-lg`}>
                {getInitials(user?.name)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-white/80">{user?.email}</p>
              <span className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl shadow-md p-1 mb-6 w-fit">
          {['profile', 'password'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm capitalize transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'profile' ? '👤 Edit Profile' : '🔑 Change Password'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Feedback messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-pulse-once">
              <span className="text-green-600">✅</span>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <span className="text-red-600">❌</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {loading ? <ProfileSkeleton /> : (
            <>
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required
                    />
                  </div>

                  {user?.role === 'LECTURER' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={form.department}
                          onChange={e => setForm({ ...form, department: e.target.value })}
                          placeholder="e.g. Computer Science"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={form.bio}
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                          rows={4}
                          placeholder="Tell students about yourself..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                        />
                      </div>
                    </>
                  )}

                  {user?.role === 'STUDENT' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={form.department}
                          onChange={e => setForm({ ...form, department: e.target.value })}
                          placeholder="e.g. Software Engineering"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                        <select
                          value={form.level}
                          onChange={e => setForm({ ...form, level: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        >
                          <option value="">Select Level</option>
                          {['100', '200', '300', '400', '500'].map(l => (
                            <option key={l} value={l}>{l} Level</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Matric Number</label>
                        <input
                          type="text"
                          value={form.matricNo}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Matric number cannot be changed</p>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate(-1)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                      {saving ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                      ) : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSave} className="space-y-6 max-w-md">
                  {user?.avatarUrl && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700 text-sm">⚠️ Google accounts cannot change passwords here. Use Google account settings.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input type="password" value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type="password" value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium">
                      Clear
                    </button>
                    <button type="submit" disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                      {saving ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                      ) : '🔑 Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
