import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [grade, setGrade] = useState(null);

  useEffect(() => {
    loadAssignmentDetails();
  }, [assignmentId]);

  const loadAssignmentDetails = async () => {
    try {
      setLoading(true);
      
      // Get assignment details
      const assignmentRes = await apiClient.get(`/assignments/${assignmentId}`);
      setAssignment(assignmentRes.data.data);

      // Get my submissions
      const submissionsRes = await apiClient.get(`/assignments/${assignmentId}/my-submissions`);
      const submissions = submissionsRes.data.data || [];
      setMySubmissions(submissions);

      // Find active submission and its grade
      const active = submissions.find(s => s.isActive);
      setActiveSubmission(active);
      if (active?.grade) {
        setGrade(active.grade);
      }

    } catch (error) {
      console.error('Error loading assignment:', error);
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

  const downloadFeedback = async (gradeId, fileName) => {
    try {
      const response = await apiClient.get(`/grades/${gradeId}/feedback`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'feedback');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download feedback');
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

  const getDeadlineStatus = () => {
    if (!assignment) return null;
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diff = due - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: 'Deadline passed', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysLeft === 0) return { text: 'Due today!', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (daysLeft <= 2) return { text: `${daysLeft} days left`, color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { text: `${daysLeft} days left`, color: 'text-green-600', bgColor: 'bg-green-50' };
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

  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/assignments')}
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center text-sm font-medium"
        >
          ← Back to Assignments
        </button>

        {/* Assignment Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                  assignment.type === 'PROJECT'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {assignment.type}
                </span>
                <span className="text-sm text-gray-500">{assignment.course?.code}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              <p className="text-gray-600">{assignment.course?.title}</p>
            </div>

            {/* Submission Status */}
            {activeSubmission && (
              <div className="text-right">
                {grade ? (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Your Grade</span>
                    <div className={`text-4xl font-bold ${
                      grade.score >= 80 ? 'text-green-600' :
                      grade.score >= 70 ? 'text-blue-600' :
                      grade.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grade.score}
                    </div>
                  </div>
                ) : (
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Pending Grading
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Deadline */}
          {deadlineStatus && (
            <div className={`${deadlineStatus.bgColor} rounded-lg p-4 border ${
              deadlineStatus.color === 'text-red-600' ? 'border-red-200' :
              deadlineStatus.color === 'text-orange-600' ? 'border-orange-200' :
              deadlineStatus.color === 'text-yellow-600' ? 'border-yellow-200' : 'border-green-200'
            }`}>
              <div className="flex items-center">
                <span className="text-2xl mr-3">⏰</span>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-bold text-gray-900">{formatDate(assignment.dueDate)}</p>
                  <p className={`text-sm font-medium ${deadlineStatus.color}`}>{deadlineStatus.text}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
        </div>

        {/* Current Submission */}
        {activeSubmission ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submission</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Submitted on {formatDate(activeSubmission.submittedAt)}</p>
                  <p className="text-sm text-gray-600">Version {activeSubmission.versionNumber}</p>
                  {activeSubmission.isLate && (
                    <p className="text-sm text-red-600 font-medium">⚠️ Late Submission</p>
                  )}
                </div>
                <button
                  onClick={() => downloadSubmission(activeSubmission.id, `${assignment.title}_submission`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
              </div>

              {/* Grade & Feedback */}
              {grade && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3">Feedback</h3>
                  
                  {grade.feedbackText && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                      <p className="text-gray-700">{grade.feedbackText}</p>
                    </div>
                  )}

                  {grade.feedbackFilePath && (
                    <button
                      onClick={() => downloadFeedback(grade.id, 'feedback')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Feedback File
                    </button>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Graded on {formatDate(grade.createdAt)}
                  </p>
                </div>
              )}

              {/* View History */}
              {mySubmissions.length > 1 && (
                <button
                  onClick={() => navigate(`/student/assignments/${assignmentId}/history`)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All Submissions ({mySubmissions.length} versions) →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-6">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Yet Submitted</h3>
            <p className="text-gray-600 mb-6">You haven't submitted this assignment yet</p>
            <button
              onClick={() => navigate(`/student/assignments/${assignmentId}/submit`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Submit Now
            </button>
          </div>
        )}

        {/* Resubmit Button */}
        {activeSubmission && !grade && (
          <button
            onClick={() => navigate(`/student/assignments/${assignmentId}/submit`)}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Resubmit Assignment
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;
