import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    upcomingDeadlines: 0
  });
  const [courses, setCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled courses
      const coursesRes = await apiClient.get('/courses');
      const enrolledCourses = coursesRes.data.data || [];
      setCourses(enrolledCourses);
      
      // Fetch all my submissions
      const submissionsRes = await apiClient.get('/students/me/submissions');
      const mySubmissions = submissionsRes.data.data || [];
      
      // Get all assignments from enrolled courses
      let allAssignments = [];
      for (const course of enrolledCourses) {
        const assignmentsRes = await apiClient.get(`/courses/${course.id}/assignments`);
        const courseAssignments = assignmentsRes.data.data || [];
        allAssignments = [...allAssignments, ...courseAssignments];
      }
      
      // Find assignments without submissions (truly pending)
      const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignment.id));
      const pendingAssignments = allAssignments.filter(a => !submittedAssignmentIds.has(a.id));
      
      // Calculate stats
      setStats({
        enrolledCourses: enrolledCourses.length,
        pendingAssignments: pendingAssignments.length, // Unsubmitted assignments
        upcomingDeadlines: allAssignments.filter(a => {
          const deadline = new Date(a.dueDate);
          const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 7 && !submittedAssignmentIds.has(a.id);
        }).length
      });
      
      // Get recent assignments (submitted ones for display)
      setRecentAssignments(mySubmissions.slice(0, 5));
      
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

  const getDaysUntilDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to continue your learning journey?
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/student/courses')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.enrolledCourses}</p>
                <p className="text-xs text-blue-600 mt-2">View all courses →</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/student/assignments')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                <p className="text-xs text-yellow-600 mt-2">View assignments →</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Deadlines</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingDeadlines}</p>
                <p className="text-xs text-red-600 mt-2">Next 7 days</p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⏰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/messages')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course Chats</p>
                <p className="text-3xl font-bold text-gray-900">{stats.enrolledCourses}</p>
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
            onClick={() => navigate('/student/lecturers')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👨‍🏫</div>
            <div className="text-sm font-semibold text-gray-700">Browse Lecturers</div>
          </button>

          <button
            onClick={() => navigate('/student/enroll')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</div>
            <div className="text-sm font-semibold text-gray-700">Enroll Course</div>
          </button>

          <button
            onClick={() => navigate('/student/assignments')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✍️</div>
            <div className="text-sm font-semibold text-gray-700">Assignments</div>
          </button>

          <button
            onClick={() => navigate('/student/grades')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-center group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎯</div>
            <div className="text-sm font-semibold text-gray-700">My Grades</div>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <button
                onClick={() => navigate('/student/courses')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                <button
                  onClick={() => navigate('/student/enroll')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Enroll in a Course
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {courses.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
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

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="mr-4">👨‍🏫 {course.lecturer?.user?.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>📅 {course.semester}</span>
                      <span className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              {recentAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500 text-sm">No recent submissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAssignments.map((submission) => (
                    <div
                      key={submission.id}
                      className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/student/assignments')}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {submission.assignment?.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {submission.assignment?.course?.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          submission.grade
                            ? 'bg-green-100 text-green-700'
                            : submission.isLate
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {submission.grade ? `Graded: ${submission.grade.score}` : submission.isLate ? 'Late' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="mt-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border border-red-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⏰</span>
                Upcoming Deadlines
              </h3>
              
              {stats.upcomingDeadlines === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  No upcoming deadlines
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAssignments
                    .filter(s => {
                      const deadline = new Date(s.assignment.dueDate);
                      const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                      return daysUntil >= 0 && daysUntil <= 7 && !s.grade;
                    })
                    .slice(0, 3)
                    .map((submission) => (
                      <div key={submission.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm font-semibold text-gray-900">
                          {submission.assignment?.title}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {getDaysUntilDeadline(submission.assignment?.dueDate)}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
