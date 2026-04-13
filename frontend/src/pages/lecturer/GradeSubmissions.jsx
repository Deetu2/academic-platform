import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const GradeSubmissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, graded
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingModal, setGradingModal] = useState(false);
  const [gradeData, setGradeData] = useState({
    score: '',
    feedbackText: '',
    feedbackFile: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      // Get lecturer's courses
      const coursesRes = await apiClient.get('/lecturers/me/courses');
      const courses = coursesRes.data.data || [];
      
      // Get all assignments from all courses
      let allSubmissions = [];
      for (const course of courses) {
        const assignmentsRes = await apiClient.get(`/courses/${course.id}/assignments`);
        const assignments = assignmentsRes.data.data || [];
        
        for (const assignment of assignments) {
          const subsRes = await apiClient.get(`/assignments/${assignment.id}/submissions`);
          const subs = (subsRes.data.data || []).map(s => ({
            ...s,
            assignment: { ...assignment, course }
          }));
          allSubmissions = [...allSubmissions, ...subs];
        }
      }
      
      // Sort by submission date (newest first)
      allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      // Only show active (latest) submissions
      const activeSubmissions = allSubmissions.filter(s => s.isActive);
      setSubmissions(activeSubmissions);
      
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !sub.grade;
    if (filter === 'graded') return sub.grade;
    return true;
  });

  const handleOpenGrading = (submission) => {
    setSelectedSubmission(submission);
    if (submission.grade) {
      setGradeData({
        score: submission.grade.score.toString(),
        feedbackText: submission.grade.feedbackText || '',
        feedbackFile: null
      });
    } else {
      setGradeData({ score: '', feedbackText: '', feedbackFile: null });
    }
    setGradingModal(true);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeData.score || gradeData.score < 0 || gradeData.score > 100) {
      alert('Please enter a valid score (0-100)');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('score', gradeData.score);
      if (gradeData.feedbackText) {
        formData.append('feedbackText', gradeData.feedbackText);
      }
      if (gradeData.feedbackFile) {
        formData.append('file', gradeData.feedbackFile);
      }

      await apiClient.post(`/submissions/${selectedSubmission.id}/grade`, formData);
      
      alert('Grade submitted successfully!');
      setGradingModal(false);
      setSelectedSubmission(null);
      setGradeData({ score: '', feedbackText: '', feedbackFile: null });
      loadSubmissions();
      
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit grade');
    } finally {
      setSubmitting(false);
    }
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

  const downloadSubmission = async (submissionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/submissions/${submissionId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'submission';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download submission');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grade Submissions</h1>
          <p className="text-gray-600">Review and grade student submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
            <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Grading</p>
            <p className="text-3xl font-bold text-orange-600">
              {submissions.filter(s => !s.grade).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Graded</p>
            <p className="text-3xl font-bold text-green-600">
              {submissions.filter(s => s.grade).length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md inline-flex mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({submissions.filter(s => !s.grade).length})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'graded'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Graded ({submissions.filter(s => s.grade).length})
          </button>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Submissions</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No student submissions yet'
                : `No ${filter} submissions`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Student Info */}
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="font-bold text-indigo-600">
                          {submission.student?.user?.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{submission.student?.user?.name}</p>
                        <p className="text-sm text-gray-500">{submission.student?.user?.email}</p>
                      </div>
                    </div>

                    {/* Assignment Info */}
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium mr-2 ${
                          submission.assignment?.type === 'PROJECT'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {submission.assignment?.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {submission.assignment?.course?.code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {submission.assignment?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {submission.assignment?.course?.title}
                      </p>
                    </div>

                    {/* Submission Details */}
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>📅 {formatDate(submission.submittedAt)}</span>
                      {submission.isLate && (
                        <span className="text-red-600 font-medium">⚠️ Late Submission</span>
                      )}
                      {submission.versionNumber > 1 && (
                        <span className="text-blue-600">v{submission.versionNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Grade Display / Actions */}
                  <div className="ml-6">
                    {submission.grade ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {submission.grade.score}
                        </div>
                        <button
                          onClick={() => handleOpenGrading(submission)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Edit Grade
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenGrading(submission)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
                      >
                        Grade Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => downloadSubmission(submission.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Submission
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSubmission.grade ? 'Edit Grade' : 'Grade Submission'}
                </h2>
                <button
                  onClick={() => setGradingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Student & Assignment Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-bold text-gray-900">{selectedSubmission.student?.user?.name}</p>
                <p className="text-sm text-gray-600 mt-2">Assignment</p>
                <p className="font-bold text-gray-900">{selectedSubmission.assignment?.title}</p>
                <p className="text-sm text-gray-500">{selectedSubmission.assignment?.course?.title}</p>
              </div>

              <form onSubmit={handleSubmitGrade} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100) *
                  </label>
                  <input
                    type="number"
                    value={gradeData.score}
                    onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="85"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Text (Optional)
                  </label>
                  <textarea
                    value={gradeData.feedbackText}
                    onChange={(e) => setGradeData({ ...gradeData, feedbackText: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setGradeData({ ...gradeData, feedbackFile: e.target.files[0] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a graded copy or detailed feedback document</p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setGradingModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeSubmissions;
