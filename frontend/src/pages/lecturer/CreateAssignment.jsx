import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const CreateAssignment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ASSIGNMENT',
    dueDate: '',
    dueTime: '23:59',
    allowLateSubmission: true
  });

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/courses/${courseId}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error('Error loading course:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Combine date and time
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

    // Check if due date is in the future
    if (dueDateTime <= new Date()) {
      setError('Due date must be in the future');
      return;
    }

    try {
      setCreating(true);
      await apiClient.post(`/courses/${courseId}/assignments`, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        dueDate: dueDateTime.toISOString(),
        allowLateSubmission: formData.allowLateSubmission
      });

      navigate(`/lecturer/courses/${courseId}`, {
        state: { message: 'Assignment created successfully!' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(`/lecturer/courses/${courseId}`)}
          className="text-indigo-600 hover:text-indigo-700 mb-6 inline-flex items-center text-sm font-medium"
        >
          ← Back to Course
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✍️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Assignment</h1>
            <p className="text-gray-600">{course?.title} ({course?.code})</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assignment Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Web Development Project 1"
                required
              />
            </div>

            {/* Assignment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'ASSIGNMENT' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'ASSIGNMENT'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-semibold">Assignment</div>
                  <div className="text-xs text-gray-500 mt-1">Regular task</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'PROJECT' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'PROJECT'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-semibold">Project</div>
                  <div className="text-xs text-gray-500 mt-1">Major work</div>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe the assignment requirements, objectives, and deliverables..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Be clear about what students need to submit and how they'll be graded
              </p>
            </div>

            {/* Due Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Time *
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Late Submission */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowLateSubmission}
                  onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900">Allow Late Submissions</span>
                  <p className="text-sm text-gray-500">Students can submit after the deadline (will be marked as late)</p>
                </div>
              </label>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">👁️</span>
                Preview
              </h3>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formData.type === 'PROJECT'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {formData.type}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {formData.title || 'Assignment Title'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.description || 'Assignment description will appear here...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 pt-3 border-t">
                  <span className="mr-2">📅</span>
                  Due: {formData.dueDate || 'Not set'} at {formData.dueTime || '23:59'}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/lecturer/courses/${courseId}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Assignment Tips
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Be specific about deliverables and submission format
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Set realistic deadlines considering assignment complexity
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Include grading criteria in the description
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Students will see their submission status and late penalties
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
