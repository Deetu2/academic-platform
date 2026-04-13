import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const SubmissionHistory = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [assignmentId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      const assignmentRes = await apiClient.get(`/assignments/${assignmentId}`);
      setAssignment(assignmentRes.data.data);

      const submissionsRes = await apiClient.get(`/assignments/${assignmentId}/my-submissions`);
      const allSubmissions = submissionsRes.data.data || [];
      
      // Sort by version number descending (newest first)
      allSubmissions.sort((a, b) => b.versionNumber - a.versionNumber);
      setSubmissions(allSubmissions);

    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/student/assignments/${assignmentId}`)}
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center text-sm font-medium"
        >
          ← Back to Assignment
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submission History</h1>
          <p className="text-gray-600">{assignment?.title}</p>
          <p className="text-sm text-gray-500 mt-1">{assignment?.course?.code} - {assignment?.course?.title}</p>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600">You haven't submitted this assignment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  submission.isActive ? 'border-2 border-blue-500' : ''
                }`}
              >
                {/* Version Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 mr-3">
                      Version {submission.versionNumber}
                    </span>
                    {submission.isActive && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                    {submission.isLate && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium ml-2">
                        Late
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => downloadSubmission(submission.id, submission.versionNumber)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Download
                  </button>
                </div>

                {/* Submission Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>Submitted: {formatDate(submission.submittedAt)}</span>
                  </div>

                  {submission.note && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Note:</p>
                      <p className="text-sm text-gray-700">{submission.note}</p>
                    </div>
                  )}

                  {/* Grade */}
                  {submission.grade ? (
                    <div className="border-t pt-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-2">Grade</p>
                          <div className="flex items-center mb-3">
                            <span className={`text-3xl font-bold mr-3 ${
                              submission.grade.score >= 80 ? 'text-green-600' :
                              submission.grade.score >= 70 ? 'text-blue-600' :
                              submission.grade.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {submission.grade.score}
                            </span>
                            <span className="text-sm text-gray-500">
                              Graded on {formatDate(submission.grade.createdAt)}
                            </span>
                          </div>

                          {submission.grade.feedbackText && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Feedback:</p>
                              <p className="text-sm text-gray-700">{submission.grade.feedbackText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-sm text-yellow-800">⏳ Pending grading</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.grade).length}
              </p>
              <p className="text-sm text-gray-600">Graded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {submissions.filter(s => !s.grade).length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.isLate).length}
              </p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionHistory;
