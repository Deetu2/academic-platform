import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, selective, compulsory

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/lecturers/me/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.type.toLowerCase() === filter;
  });

  const handleRegenerateCode = async (courseId) => {
    if (!window.confirm('Are you sure you want to generate a new join code? The old code will no longer work.')) {
      return;
    }

    try {
      await apiClient.post(`/courses/${courseId}/join-code`);
      alert('Join code regenerated successfully!');
      loadCourses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to regenerate join code');
    }
  };

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Join code "${code}" copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-2">Manage and organize your courses</p>
            </div>
            <button
              onClick={() => navigate('/lecturer/courses/create')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              + Create New Course
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md inline-flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setFilter('selective')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'selective'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Selective ({courses.filter(c => c.type === 'SELECTIVE').length})
            </button>
            <button
              onClick={() => setFilter('compulsory')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'compulsory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compulsory ({courses.filter(c => c.type === 'COMPULSORY').length})
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Courses Created' : `No ${filter} Courses`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Create your first course to start teaching'
                : `You haven't created any ${filter} courses yet`
              }
            </p>
            <button
              onClick={() => navigate('/lecturer/courses/create')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
              >
                {/* Course Header */}
                <div className={`p-6 ${
                  course.type === 'COMPULSORY'
                    ? 'bg-gradient-to-br from-red-500 to-pink-500'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                } text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm opacity-90">{course.code}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      {course.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span>📅 {course.semester}</span>
                  </div>
                </div>

                {/* Course Body */}
                <div className="p-6">
                  {/* Join Code */}
                  <div className="mb-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Join Code</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-indigo-600 tracking-wider">
                        {course.joinCode}
                      </p>
                      <button
                        onClick={() => copyJoinCode(course.joinCode)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {course._count?.enrollments || 0}
                      </p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {course._count?.materials || 0}
                      </p>
                      <p className="text-xs text-gray-500">Materials</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {course._count?.assignments || 0}
                      </p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/lecturer/courses/${course.id}`)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                      Manage Course
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/lecturer/courses/${course.id}/edit`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRegenerateCode(course.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        New Code
                      </button>
                    </div>
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

export default MyCourses;
