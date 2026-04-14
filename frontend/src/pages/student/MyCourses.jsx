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

  useEffect(() => { loadCourses(); }, []);

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

  const semesters = [...new Set(courses.map(c => c.semester))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || course.type.toLowerCase() === typeFilter;
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter;
    return matchesSearch && matchesType && matchesSemester;
  });

  const handleDropCourse = async (courseId, courseType) => {
    if (courseType === 'COMPULSORY') {
      alert('Cannot drop compulsory courses!');
      return;
    }
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    try {
      await apiClient.post(`/courses/${courseId}/drop`);
      loadCourses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to drop course');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Courses</h1>
              <p className="text-green-100">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</p>
            </div>
            <button
              onClick={() => navigate('/student/enroll')}
              className="px-5 py-2.5 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              ➕ Enroll in Course
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
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="compulsory">Compulsory</option>
              <option value="selective">Selective</option>
            </select>
            <select
              value={semesterFilter}
              onChange={e => setSemesterFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            >
              <option value="all">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {(searchTerm || typeFilter !== 'all' || semesterFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>Showing {filteredCourses.length} of {courses.length} courses</span>
              <button onClick={() => { setSearchTerm(''); setTypeFilter('all'); setSemesterFilter('all'); }}
                className="text-green-600 hover:text-green-700 font-medium underline">Clear filters</button>
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
              {searchTerm ? 'Try different keywords' : 'Enroll in a course to get started'}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate('/student/enroll')}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-semibold">
                Enroll in a Course
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredCourses.map(course => (
              <div key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-green-100">{course.code}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.type === 'COMPULSORY' ? 'bg-red-400/30 text-red-100' : 'bg-blue-400/30 text-blue-100'
                    }`}>{course.type}</span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-green-100 transition-colors">{course.title}</h3>
                  <p className="text-sm text-green-200 mt-1">📅 {course.semester}</p>
                </div>
                <div className="p-5">
                  <div className="flex justify-around text-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{course._count?.materials || 0}</p>
                      <p className="text-xs text-gray-500">Materials</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{course._count?.assignments || 0}</p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/student/courses/${course.id}`); }}
                      className="flex-1 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-teal-700 transition-all"
                    >
                      View Course
                    </button>
                    {course.type === 'SELECTIVE' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDropCourse(course.id, course.type); }}
                        className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all"
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
