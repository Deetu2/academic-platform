import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const LecturerProfile = () => {
  const { lecturerId } = useParams();
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLecturerProfile();
  }, [lecturerId]);

  const loadLecturerProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/lecturers/${lecturerId}`);
      setLecturer(response.data.data);
    } catch (error) {
      console.error('Error loading lecturer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lecturer Not Found</h2>
          <button
            onClick={() => navigate('/student/lecturers')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/lecturers')}
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center text-sm font-medium"
        >
          ← Back to Lecturer Directory
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8 text-white">
            <div className="flex items-center">
              {lecturer.photoUrl ? (
                <img
                  src={`http://localhost:5000${lecturer.photoUrl}`}
                  alt={lecturer.user?.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mr-6"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center mr-6">
                  <span className="text-6xl font-bold text-blue-600">
                    {lecturer.user?.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{lecturer.user?.name}</h1>
                <p className="text-blue-100 text-lg mb-2">{lecturer.user?.email}</p>
                {lecturer.department && (
                  <p className="text-blue-50">Department: {lecturer.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {lecturer.bio && (
            <div className="p-8 border-b">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{lecturer.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="p-8 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">
                  {lecturer.courses?.length || 0}
                </p>
                <p className="text-gray-600 mt-2">
                  {lecturer.courses?.length === 1 ? 'Course' : 'Courses'} Offered
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {lecturer.courses?.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0) || 0}
                </p>
                <p className="text-gray-600 mt-2">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600">
                  {lecturer.user?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </p>
                <p className="text-gray-600 mt-2">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses Offered</h2>
          
          {lecturer.courses?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-gray-500">No courses available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {lecturer.courses?.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.type === 'COMPULSORY' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {course.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{course.code}</p>
                  <p className="text-sm text-gray-500 mb-4">{course.semester}</p>
                  
                  {course.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-4">👨‍🎓 {course._count?.enrollments || 0} students</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                        {course.joinCode}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerProfile;
