import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const CourseOversight = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lecturerFilter, setLecturerFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, lecturerFilter, semesterFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await apiClient.get('/courses');
      const coursesData = coursesResponse.data.data || [];
      setCourses(coursesData);

      // Fetch lecturers
      const usersResponse = await apiClient.get('/admin/users');
      const allUsers = usersResponse.data.data;
      const lecturersList = allUsers.filter(u => u.role === 'LECTURER');
      setLecturers(lecturersList);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lecturer filter
    if (lecturerFilter !== 'ALL') {
      filtered = filtered.filter(course => course.lecturerId === lecturerFilter);
    }

    // Semester filter
    if (semesterFilter !== 'ALL') {
      filtered = filtered.filter(course => course.semester === semesterFilter);
    }

    setFilteredCourses(filtered);
  };

  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find(l => l.lecturerProfile?.id === lecturerId);
    return lecturer ? lecturer.name : 'Unknown';
  };

  const getTypeColor = (type) => {
    return type === 'COMPULSORY' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-green-100 text-green-700';
  };

  const semesters = [...new Set(courses.map(c => c.semester))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
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
              <Link to="/admin/dashboard" className="text-purple-100 hover:text-white mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">Course Oversight</h1>
              <p className="text-purple-100">View and manage all courses</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
              <div className="text-sm text-purple-100">Total Courses</div>
              <div className="text-2xl font-bold">{courses.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Search by title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Lecturer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Lecturer
              </label>
              <select
                value={lecturerFilter}
                onChange={(e) => setLecturerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Lecturers</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.lecturerProfile?.id}>
                    {lecturer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Semester
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Semesters</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <span>
              Showing <strong>{filteredCourses.length}</strong> of <strong>{courses.length}</strong> courses
            </span>
            <span>•</span>
            <span>
              <strong>{courses.filter(c => c.type === 'COMPULSORY').length}</strong> Compulsory
            </span>
            <span>•</span>
            <span>
              <strong>{courses.filter(c => c.type === 'SELECTIVE').length}</strong> Selective
            </span>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">No courses found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{course.code}</h3>
                    <span className={`px-2 py-1 ${getTypeColor(course.type)} rounded-full text-xs font-medium`}>
                      {course.type}
                    </span>
                  </div>
                  <p className="text-blue-100 font-medium">{course.title}</p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lecturer:</span>
                      <span className="font-medium text-gray-900">
                        {getLecturerName(course.lecturerId)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Semester:</span>
                      <span className="font-medium text-gray-900">{course.semester}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Enrollments:</span>
                      <span className="font-medium text-gray-900">
                        {course._count?.enrollments || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Assignments:</span>
                      <span className="font-medium text-gray-900">
                        {course._count?.assignments || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Join Code: <span className="font-mono font-semibold text-gray-900">{course.joinCode}</span>
                    </p>
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

export default CourseOversight;