import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    pendingGrades: 0,
    studentCount: 0,
    lecturerCount: 0
  });
  const [users, setUsers] = useState([]);
  const [charts, setCharts] = useState({
    userBreakdown: [],
    submissionsOverTime: [],
    completionRates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, chartsResponse] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/charts')
      ]);

      const data = statsResponse.data.data;
      setStats({
        totalUsers: data.totalUsers,
        activeCourses: data.totalCourses,
        totalAssignments: data.totalAssignments,
        totalSubmissions: data.totalSubmissions,
        pendingGrades: data.pendingSubmissions,
        studentCount: data.studentCount,
        lecturerCount: data.lecturerCount
      });
      setUsers(data.recentUsers);
      setCharts(chartsResponse.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'LECTURER': return 'bg-blue-100 text-blue-700';
      case 'STUDENT': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">System Overview</h1>
              <p className="text-purple-100">Monitor platform usage and user status</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
              <div className="text-sm text-purple-100">Admin Panel</div>
              <div className="text-2xl font-bold">Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.studentCount} Students • {stats.lecturerCount} Lecturers</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCourses}</p>
                <p className="text-xs text-gray-500 mt-1">Across all lecturers</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
                <p className="text-xs text-gray-500 mt-1">System-wide</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Submissions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                <p className="text-xs text-yellow-600 mt-1">Pending: {stats.pendingGrades}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1: User Breakdown + Submissions Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* User Breakdown Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">User Breakdown</h2>
            <p className="text-sm text-gray-500 mb-4">Distribution across all roles</p>
            <div className="flex items-center justify-around mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.studentCount}</div>
                <div className="text-xs text-gray-500">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.lecturerCount}</div>
                <div className="text-xs text-gray-500">Lecturers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalUsers - stats.studentCount - stats.lecturerCount}
                </div>
                <div className="text-xs text-gray-500">Admins</div>
              </div>
            </div>
            {charts.userBreakdown.length > 0 && charts.userBreakdown.some(u => u.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.userBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.userBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No user data yet</div>
            )}
          </div>

          {/* Submissions Over Time Line Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Submissions This Week</h2>
            <p className="text-sm text-gray-500 mb-4">Daily submission activity (last 7 days)</p>
            {charts.submissionsOverTime.some(d => d.submissions > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={charts.submissionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No submissions in the last 7 days</div>
            )}
          </div>
        </div>

        {/* Charts Row 2: Assignment Completion */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Assignment Completion by Course</h2>
          <p className="text-sm text-gray-500 mb-4">Submitted vs graded (% of possible submissions)</p>
          {charts.completionRates.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.completionRates} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="course" tick={{ fontSize: 12 }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="graded" name="Graded" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No course data yet</div>
          )}
        </div>

        {/* Recent Users + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
              >
                🔄 Refresh Data
              </button>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full" />
                            ) : (
                              <div className={`w-10 h-10 bg-gradient-to-br ${
                                user.role === 'ADMIN' ? 'from-purple-400 to-pink-400' :
                                user.role === 'LECTURER' ? 'from-blue-400 to-indigo-400' :
                                'from-green-400 to-teal-400'
                              } rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                {getInitials(user.name)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 ${getRoleColor(user.role)} rounded-full text-sm font-medium`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 ${
                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          } rounded-full text-sm font-medium`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                            className={`${
                              user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                            } text-sm font-medium`}
                          >
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={fetchDashboardData}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all text-sm font-medium"
              >
                🔄 Refresh Data
              </button>
              <Link
                to="/admin/users"
                className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium text-center"
              >
                👥 Manage Users
              </Link>
              <Link
                to="/admin/courses"
                className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium text-center"
              >
                📚 View Courses
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quick Tip</h3>
                  <p className="text-sm text-gray-600">
                    Monitor assignment completion rates to identify courses where students may need extra support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
