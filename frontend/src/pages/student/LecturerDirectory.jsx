import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const LecturerDirectory = () => {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLecturers();
  }, []);

  const loadLecturers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/lecturers');
      setLecturers(response.data.data || []);
    } catch (error) {
      console.error('Error loading lecturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lecturers...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lecturer Directory</h1>
          <p className="text-gray-600">Browse and connect with lecturers</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {filteredLecturers.length} {filteredLecturers.length === 1 ? 'lecturer' : 'lecturers'} found
          </p>
        </div>

        {/* Lecturers Grid */}
        {filteredLecturers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Lecturers Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No lecturers available at the moment'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                onClick={() => navigate(`/student/lecturers/${lecturer.id}`)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer group"
              >
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-8 text-center">
                  {lecturer.photoUrl ? (
                    <img
                      src={`http://localhost:5000${lecturer.photoUrl}`}
                      alt={lecturer.user.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg bg-white flex items-center justify-center">
                      <span className="text-4xl font-bold text-blue-600">
                        {lecturer.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">
                    {lecturer.user.name}
                  </h3>
                  <p className="text-blue-100 text-sm">{lecturer.user.email}</p>
                </div>

                {/* Profile Body */}
                <div className="p-6">
                  {lecturer.department && (
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                      <p className="font-semibold text-gray-900">{lecturer.department}</p>
                    </div>
                  )}

                  {lecturer.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {lecturer.bio}
                      </p>
                    </div>
                  )}

                  {/* Courses Count */}
                  <div className="mb-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600 mb-1">
                        {lecturer.courses?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {lecturer.courses?.length === 1 ? 'Course' : 'Courses'} Offered
                      </p>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold group-hover:shadow-lg">
                    View Profile & Courses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerDirectory;
