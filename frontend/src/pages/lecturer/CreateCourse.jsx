import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    type: 'SELECTIVE',
    semester: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.code || !formData.semester) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/courses', formData);
      navigate('/lecturer/courses', {
        state: { message: 'Course created successfully!' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/lecturer/courses')}
          className="text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center text-sm"
        >
          ← Back to My Courses
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
            <p className="text-gray-600">Set up a new course for your students</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Web Development Fundamentals"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., CS101"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'SELECTIVE' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'SELECTIVE'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📘</div>
                  <div className="font-semibold">Selective</div>
                  <div className="text-xs text-gray-500 mt-1">Students can drop</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'COMPULSORY' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'COMPULSORY'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📕</div>
                  <div className="font-semibold">Compulsory</div>
                  <div className="text-xs text-gray-500 mt-1">Cannot be dropped</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Fall 2024, Spring 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>💡 Note:</strong> A unique join code will be automatically generated for this course. You can share it with students to enroll.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/lecturer/courses')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
