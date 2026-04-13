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
      const response = await apiClient.get('/courses');
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

  const handleDropCourse = async (courseId, courseType) => {
    if (courseType === 'COMPULSORY') {
      alert('Cannot drop compulsory courses!');
      return;
    }

    if (!window.confirm('Are you sure you want to drop this course?')) {
      return;
    }

    try {
      await apiClient.post(`/courses/${courseId}/drop`);
      alert('Course dropped successfully!');
      loadCourses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to drop course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-2">Manage and access your enrolled courses</p>
            </div>
            <button
              onClick={() => navigate('/student/enroll')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              + Enroll in Course
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md inline-flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setFilter('selective')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'selective'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Selective ({courses.filter(c => c.type === 'SELECTIVE').length})
            </button>
            <button
              onClick={() => setFilter('compulsory')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'compulsory'
                  ? 'bg-blue-600 text-white shadow-sm'
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
              {filter === 'all' ? 'No Courses Enrolled' : `No ${filter} Courses`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Get started by enrolling in your first course'
                : `You haven't enrolled in any ${filter} courses yet`
              }
            </p>
            <button
              onClick={() => navigate('/student/enroll')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Enroll in a Course
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
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
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
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {course.lecturer?.user?.name?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lecturer</p>
                      <p className="font-semibold text-gray-900">
                        {course.lecturer?.user?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {course._count?.materials || 0}
                      </p>
                      <p className="text-xs text-gray-500">Materials</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {course._count?.assignments || 0}
                      </p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      View Details
                    </button>
                    {course.type === 'SELECTIVE' && (
                      <button
                        onClick={() => handleDropCourse(course.id, course.type)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                      >
                        Drop
                      </button>
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

export default MyCourses;
