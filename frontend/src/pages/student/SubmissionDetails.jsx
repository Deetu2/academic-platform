import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      
      // Get all my submissions and find the one we need
      const response = await apiClient.get('/students/me/submissions');
      const allSubmissions = response.data.data || [];
      const found = allSubmissions.find(s => s.id === submissionId);
      
      setSubmission(found);
    } catch (error) {
      console.error('Error loading submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSubmission = async () => {
    try {
      const response = await apiClient.get(`/submissions/${submissionId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${submission.assignment.title}_submission`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download submission');
    }
  };

  const downloadFeedback = async () => {
    if (!submission?.grade?.id) return;
    
    try {
      const response = await apiClient.get(`/grades/${submission.grade.id}/feedback`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedback');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download feedback file');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getGradeLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submission details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Not Found</h2>
          <button
            onClick={() => navigate('/student/grades')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Grades
          </button>
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
          onClick={() => navigate('/student/grades')}
          className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center text-sm font-medium"
        >
          ← Back to My Grades
        </button>

        {/* Assignment Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                  submission.assignment.type === 'PROJECT'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {submission.assignment.type}
                </span>
                <span className="text-sm text-gray-500">{submission.assignment.course.code}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {submission.assignment.title}
              </h1>
              <p className="text-gray-600">{submission.assignment.course.title}</p>
            </div>

            {/* Grade Display */}
            {submission.grade && (
              <div className="text-center">
                <div className={`text-6xl font-bold ${getGradeColor(submission.grade.score)} mb-2`}>
                  {submission.grade.score}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getGradeBg(submission.grade.score)} border`}>
                  {getGradeLabel(submission.grade.score)}
                </span>
              </div>
            )}
          </div>

          {/* Submission Info */}
          <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-500 mb-1">Submitted On</p>
              <p className="font-semibold text-gray-900">{formatDate(submission.submittedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Version</p>
              <p className="font-semibold text-gray-900">Version {submission.versionNumber}</p>
            </div>
            {submission.isLate && (
              <div className="md:col-span-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This submission was marked as late
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Description */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{submission.assignment.description}</p>
        </div>

        {/* Your Submission */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submission</h2>
          
          {submission.note && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Your Note:</p>
              <p className="text-gray-900">{submission.note}</p>
            </div>
          )}

          <button
            onClick={downloadSubmission}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Your Submission
          </button>
        </div>

        {/* Grading & Feedback */}
        {submission.grade ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Grading & Feedback</h2>
            
            {/* Score Breakdown */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Your Score</span>
                <span className={`text-2xl font-bold ${getGradeColor(submission.grade.score)}`}>
                  {submission.grade.score} / 100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    submission.grade.score >= 80 ? 'bg-green-600' :
                    submission.grade.score >= 70 ? 'bg-blue-600' :
                    submission.grade.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${submission.grade.score}%` }}
                />
              </div>
            </div>

            {/* Text Feedback */}
            {submission.grade.feedbackText && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Lecturer Feedback</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800">{submission.grade.feedbackText}</p>
                </div>
              </div>
            )}

            {/* Feedback File */}
            {submission.grade.feedbackFilePath && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Feedback File</h3>
                <button
                  onClick={downloadFeedback}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Feedback Document
                </button>
              </div>
            )}

            {/* Graded Date */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Graded on {formatDate(submission.grade.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pending Grading</h3>
            <p className="text-gray-600">Your submission is awaiting grading from your lecturer</p>
          </div>
        )}

        {/* View All Versions */}
        <div className="mt-6">
          <button
            onClick={() => navigate(`/student/assignments/${submission.assignment.id}/history`)}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View All Submission Versions
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
