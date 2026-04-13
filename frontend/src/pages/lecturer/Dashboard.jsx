import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0
  });
  const [courses, setCourses] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch lecturer's courses
      const coursesRes = await apiClient.get('/lecturers/me/courses');
      const myCourses = coursesRes.data.data || [];
      setCourses(myCourses);
      
      // Calculate total students
      const totalStudents = myCourses.reduce((sum, course) => 
        sum + (course._count?.enrollments || 0), 0
      );
      
      // Fetch recent submissions
      let allSubmissions = [];
      for (const course of myCourses) {
        try {
          const assignmentsRes = await apiClient.get(`/courses/${course.id}/assignments`);
          const assignments = assignmentsRes.data.data || [];
          
          for (const assignment of assignments) {
            const submissionsRes = await apiClient.get(`/assignments/${assignment.id}/submissions`);
            const subs = (submissionsRes.data.data || []).map(s => ({
              ...s,
              assignment: { ...assignment, course }
            }));
            allSubmissions = [...allSubmissions, ...subs];
          }
        } catch (error) {
          console.error('Error loading submissions:', error);
        }
      }
      
      // Sort by date and get recent
      allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setRecentSubmissions(allSubmissions.slice(0, 10));
      
      // Count pending (not graded)
      const pending = allSubmissions.filter(s => !s.grade && s.isActive).length;
      
      setStats({
        totalCourses: myCourses.length,
        totalStudents,
        pendingSubmissions: pending
      });
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {getGreeting()}, {user?.name?.split(' ')[0]}! 👨‍🏫
            </h1>
            <p className="text-purple-100 text-lg">
              Manage your courses and guide your students
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/lecturer/courses')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-xs text-purple-600 mt-2">Manage courses →</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-xs text-blue-600 mt-2">Across all courses</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">👨‍🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/lecturer/submissions')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Grading</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
                <p className="text-xs text-orange-600 mt-2">Grade now →</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/messages')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course Chats</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-xs text-green-600 mt-2">View chats →</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/lecturer/courses/create')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</div>
            <div className="text-sm font-semibold text-gray-700">Create Course</div>
          </button>

          <button
            onClick={() => navigate('/lecturer/courses')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
            <div className="text-sm font-semibold text-gray-700">My Courses</div>
          </button>

          <button
            onClick={() => navigate('/lecturer/submissions')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✍️</div>
            <div className="text-sm font-semibold text-gray-700">Grade Submissions</div>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <button
                onClick={() => navigate('/lecturer/courses')}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-6">Create your first course to get started</p>
                <button
                  onClick={() => navigate('/lecturer/courses/create')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {courses.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/lecturer/courses/${course.id}`)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.type === 'COMPULSORY' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {course.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>📅 {course.semester}</span>
                      <span>🔑 {course.joinCode}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">
                          {course._count?.enrollments || 0}
                        </p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                          {course._count?.materials || 0}
                        </p>
                        <p className="text-xs text-gray-500">Materials</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">
                          {course._count?.assignments || 0}
                        </p>
                        <p className="text-xs text-gray-500">Assignments</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Submissions</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500 text-sm">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSubmissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/lecturer/submissions`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {submission.student?.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.assignment?.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {submission.assignment?.course?.code}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          submission.grade
                            ? 'bg-green-100 text-green-700'
                            : submission.isLate
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {submission.grade ? 'Graded' : submission.isLate ? 'Late' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Quick Tips
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Share join codes with students to enroll
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Grade submissions within 48 hours
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Upload materials regularly
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Create assignments with clear deadlines
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
