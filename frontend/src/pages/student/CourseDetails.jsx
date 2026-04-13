import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('materials'); // materials or assignments

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course details
      const courseRes = await apiClient.get(`/courses/${courseId}`);
      setCourse(courseRes.data.data);

      // Load materials
      const materialsRes = await apiClient.get(`/courses/${courseId}/materials`);
      setMaterials(materialsRes.data.data || []);

      // Load assignments
      const assignmentsRes = await apiClient.get(`/courses/${courseId}/assignments`);
      setAssignments(assignmentsRes.data.data || []);

    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📊';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('zip')) return '📦';
    return '📎';
  };

  const handleDownload = async (materialId, title) => {
    try {
      const response = await apiClient.get(`/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <button
            onClick={() => navigate('/student/courses')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Courses
          </button>
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
          <button
            onClick={() => navigate('/student/courses')}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center text-sm"
          >
            ← Back to My Courses
          </button>
          
          {/* Course Info Card */}
          <div className={`rounded-xl p-8 ${
            course.type === 'COMPULSORY'
              ? 'bg-gradient-to-br from-red-500 to-pink-500'
              : 'bg-gradient-to-br from-blue-500 to-indigo-500'
          } text-white shadow-2xl`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mr-3">
                    {course.type}
                  </span>
                  <span className="text-lg opacity-90">{course.code}</span>
                </div>
                <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
                <p className="text-lg opacity-90 mb-4">{course.semester}</p>
                
                {course.description && (
                  <p className="text-white/90 leading-relaxed max-w-3xl">
                    {course.description}
                  </p>
                )}
              </div>
            </div>

            {/* Lecturer Info */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl mr-4">
                  {course.lecturer?.user?.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <p className="text-sm opacity-75">Lecturer</p>
                  <p className="text-lg font-semibold">{course.lecturer?.user?.name}</p>
                  {course.lecturer?.department && (
                    <p className="text-sm opacity-75">{course.lecturer.department}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
            <p className="text-sm text-gray-600">Materials</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-green-600">{assignments.length}</p>
            <p className="text-sm text-gray-600">Assignments</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-purple-600">{course.enrollments?.length || 0}</p>
            <p className="text-sm text-gray-600">Students</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-orange-600">{course.type === 'SELECTIVE' ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600">Droppable</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md inline-flex mb-6">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'materials'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Materials ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'assignments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✍️ Assignments ({assignments.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'materials' ? (
          <div>
            {materials.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Materials Yet</h3>
                <p className="text-gray-600">Your lecturer hasn't uploaded any materials for this course</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 cursor-pointer"
                    onClick={() => handleDownload(material.id, material.title)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{getFileIcon(material.mimeType)}</div>
                      <span className="text-xs text-gray-500">{formatFileSize(material.fileSize)}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {material.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded {formatDate(material.uploadedAt)}
                    </p>

                    <button
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(material.id, material.title);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <div className="text-6xl mb-4">✍️</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                <p className="text-gray-600">Your lecturer hasn't posted any assignments for this course</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assignment.type === 'PROJECT'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {assignment.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-700 mb-3">{assignment.description}</p>
                        <p className="text-sm text-gray-500">
                          Due: {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
