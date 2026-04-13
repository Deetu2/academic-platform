import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseRes = await apiClient.get(`/courses/${courseId}`);
      const courseData = courseRes.data.data;
      setCourse(courseData);

      // Load students
      setStudents(courseData.enrollments?.map(e => e.student) || []);

      // Load materials
      const materialsRes = await apiClient.get(`/courses/${courseId}/materials`);
      setMaterials(materialsRes.data.data || []);

      // Load assignments
      const assignmentsRes = await apiClient.get(`/courses/${courseId}/assignments`);
      setAssignments(assignmentsRes.data.data || []);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt('Enter material title:', file.name);
    if (!title) return;

    try {
      setUploadingMaterial(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      await apiClient.post(`/courses/${courseId}/materials`, formData);
      alert('Material uploaded successfully!');
      loadCourseData();
    } catch (error) {
      alert('Failed to upload material');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(course.joinCode);
    alert(`Join code "${course.joinCode}" copied!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/lecturer/courses')}
          className="text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center text-sm"
        >
          ← Back to My Courses
        </button>

        {/* Course Header */}
        <div className={`rounded-xl p-8 mb-8 ${
          course.type === 'COMPULSORY'
            ? 'bg-gradient-to-br from-red-500 to-pink-500'
            : 'bg-gradient-to-br from-purple-500 to-indigo-500'
        } text-white shadow-2xl`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium mr-3">
                  {course.type}
                </span>
                <span className="text-lg opacity-90">{course.code}</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
              <p className="text-lg opacity-90 mb-4">{course.semester}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm mb-1">Join Code</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold tracking-wider mr-3">{course.joinCode}</p>
                <button onClick={copyJoinCode} className="text-sm hover:underline">📋</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md mb-6 overflow-x-auto">
          {['overview', 'materials', 'assignments', 'students'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-blue-600 mb-2">{students.length}</p>
              <p className="text-gray-600">Enrolled Students</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-green-600 mb-2">{materials.length}</p>
              <p className="text-gray-600">Course Materials</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-purple-600 mb-2">{assignments.length}</p>
              <p className="text-gray-600">Assignments Created</p>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <div className="mb-6">
              <label className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 cursor-pointer inline-block">
                {uploadingMaterial ? 'Uploading...' : '+ Upload Material'}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUploadMaterial}
                  disabled={uploadingMaterial}
                />
              </label>
            </div>
            {materials.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">No materials uploaded yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {materials.map((material) => (
                  <div key={material.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-4xl mb-3">📄</div>
                    <h3 className="font-bold text-gray-900 mb-2">{material.title}</h3>
                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => navigate(`/lecturer/courses/${courseId}/assignments/create`)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700"
              >
                + Create Assignment
              </button>
            </div>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">No assignments created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-lg mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students enrolled yet</p>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      {student.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{student.user?.name}</p>
                      <p className="text-sm text-gray-500">{student.user?.email}</p>
                    </div>
                    {student.matricNo && (
                      <span className="text-sm text-gray-500">{student.matricNo}</span>
                    )}
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
