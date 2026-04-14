import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';
import { CourseSkeleton } from '../../components/Skeleton';
import apiClient from '../../api/client';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => { loadCourses(); }, []);

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

  const semesters = [...new Set(courses.map(c => c.semester))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || course.type.toLowerCase() === typeFilter;
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter;
    return matchesSearch && matchesType && matchesSemester;
  });

  const handleRegenerateCode = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm('Generate a new join code? The old one will stop working.')) return;
    try {
      await apiClient.post(`/courses/${courseId}/join-code`);
      loadCourses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to regenerate join code');
    }
  };

  const copyJoinCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopyFeedback(code);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Courses</h1>
              <p className="text-blue-100">{courses.length} course{courses.length !== 1 ? 's' : ''} created</p>
            </div>
            <button
              onClick={() => navigate('/lecturer/courses/create')}
              className="px-5 py-2.5 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              ➕ Create Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by title or code..."
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="compulsory">Compulsory</option>
              <option value="selective">Selective</option>
            </select>
            <select
              value={semesterFilter}
              onChange={e => setSemesterFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {(searchTerm || typeFilter !== 'all' || semesterFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>Showing {filteredCourses.length} of {courses.length} courses</span>
              <button onClick={() => { setSearchTerm(''); setTypeFilter('all'); setSemesterFilter('all'); }}
                className="text-blue-600 hover:text-blue-700 font-medium underline">Clear filters</button>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <CourseSkeleton key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">{searchTerm ? '🔍' : '📚'}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No courses match your search' : 'No courses yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try different keywords' : 'Create your first course to get started'}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate('/lecturer/courses/create')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-semibold">
                Create a Course
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredCourses.map(course => (
              <div key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/lecturer/courses/${course.id}`)}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-blue-100">{course.code}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.type === 'COMPULSORY' ? 'bg-red-400/30 text-red-100' : 'bg-green-400/30 text-green-100'
                    }`}>{course.type}</span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-blue-100 transition-colors">{course.title}</h3>
                  <p className="text-sm text-blue-200 mt-1">📅 {course.semester}</p>
                </div>

                <div className="p-5">
                  <div className="flex justify-around text-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{course._count?.enrollments || 0}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{course._count?.materials || 0}</p>
                      <p className="text-xs text-gray-500">Materials</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{course._count?.assignments || 0}</p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                  </div>

                  {/* Join Code */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Join Code</p>
                      <p className="font-mono font-bold text-gray-900">{course.joinCode}</p>
                    </div>
                    <button
                      onClick={e => copyJoinCode(e, course.joinCode)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        copyFeedback === course.joinCode
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {copyFeedback === course.joinCode ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/lecturer/courses/${course.id}`); }}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      Manage
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/lecturer/courses/${course.id}/edit`); }}
                      className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => handleRegenerateCode(e, course.id)}
                      className="px-3 py-2 border border-orange-200 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-all"
                      title="Regenerate join code"
                    >
                      🔄
                    </button>
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
