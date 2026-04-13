import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [previousSubmissions, setPreviousSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      setAssignment(response.data.data);

      // Load previous submissions
      const submissionsRes = await apiClient.get(`/assignments/${assignmentId}/my-submissions`);
      setPreviousSubmissions(submissionsRes.data.data || []);
    } catch (error) {
      console.error('Error loading assignment:', error);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('file', file);
      if (note.trim()) {
        formData.append('note', note);
      }

      await apiClient.post(`/assignments/${assignmentId}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success - redirect to assignments page
      navigate('/student/assignments', {
        state: { message: 'Assignment submitted successfully!' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = () => {
    if (!assignment) return false;
    return new Date() > new Date(assignment.dueDate);
  };

  const getTimeUntilDeadline = () => {
    if (!assignment) return '';
    const now = new Date();
    const deadline = new Date(assignment.dueDate);
    const diff = deadline - now;
    
    if (diff < 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''} left`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h2>
          <button
            onClick={() => navigate('/student/assignments')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/assignments')}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center text-sm"
          >
            ← Back to Assignments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
          <p className="text-gray-600">{assignment.course?.title}</p>
        </div>

        {/* Assignment Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h2>
              <p className="text-gray-700">
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Deadline */}
          <div className={`p-4 rounded-lg ${
            isDeadlinePassed() ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Deadline: {formatDate(assignment.dueDate)}
                </p>
                <p className={`text-xs font-semibold mt-1 ${
                  isDeadlinePassed() ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {getTimeUntilDeadline()}
                </p>
              </div>
              {isDeadlinePassed() && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  Late Submission
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Previous Submissions */}
        {previousSubmissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Previous Submissions</h3>
            <div className="space-y-3">
              {previousSubmissions.map((submission, index) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                      v{submission.versionNumber}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Submitted {formatDate(submission.submittedAt)}
                      </p>
                      {submission.isLate && (
                        <p className="text-xs text-red-600">Late submission</p>
                      )}
                      {submission.grade && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Graded: {submission.grade.score}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    submission.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {submission.isActive ? 'Active' : 'Superseded'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              💡 Submitting again will create version {previousSubmissions.length + 1}
            </p>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            {previousSubmissions.length > 0 ? 'Upload New Version' : 'Upload Your Submission'}
          </h3>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isDeadlinePassed() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> The deadline has passed. This will be marked as a late submission.
              </p>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File *
            </label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or
                  </p>
                  <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.zip"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Supported: PDF, DOC, DOCX, TXT, ZIP (Max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any comments or notes for your submission..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/student/assignments')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                `Submit ${previousSubmissions.length > 0 ? `Version ${previousSubmissions.length + 1}` : 'Assignment'}`
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-xl mr-2">💡</span>
            Submission Guidelines
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              You can resubmit as many times as you want before the deadline
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Only the latest version will be graded by your lecturer
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              All previous versions are saved in your submission history
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Late submissions are allowed but will be marked accordingly
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Maximum file size: 10MB
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssignment;
