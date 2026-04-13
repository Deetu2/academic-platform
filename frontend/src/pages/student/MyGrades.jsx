import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const MyGrades = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, graded, pending

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/students/me/submissions');
      // Only show active submissions
      const activeSubmissions = (response.data.data || []).filter(s => s.isActive);
      setSubmissions(activeSubmissions);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    if (filter === 'graded') return submission.grade !== null;
    if (filter === 'pending') return submission.grade === null;
    return true;
  });

  const calculateStats = () => {
    const graded = submissions.filter(s => s.grade).length;
    const pending = submissions.filter(s => !s.grade).length;
    const avgScore = graded > 0 
      ? submissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade.score, 0) / graded 
      : 0;
    
    return { graded, pending, avgScore: avgScore.toFixed(1) };
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const getGradeColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Pass';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your grades...</p>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Grades</h1>
          <p className="text-gray-600">Track your academic performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-4xl font-bold text-blue-600">{stats.avgScore}</p>
                <p className="text-xs text-gray-500 mt-1">Out of 100</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Graded</p>
                <p className="text-4xl font-bold text-green-600">{stats.graded}</p>
                <p className="text-xs text-gray-500 mt-1">Submissions</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting grades</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-md inline-flex mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'graded'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Graded ({stats.graded})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>

        {/* Grades List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Submissions Yet' : `No ${filter} Submissions`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start submitting assignments to see your grades here'
                : `You have no ${filter} submissions at the moment`
              }
            </p>
            <button
              onClick={() => navigate('/student/assignments')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Assignments
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
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
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {submission.assignment?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {submission.assignment?.course?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted on {formatDate(submission.submittedAt)}
                        {submission.isLate && (
                          <span className="ml-2 text-red-600 font-medium">• Late submission</span>
                        )}
                        {submission.versionNumber > 1 && (
                          <span className="ml-2 text-blue-600">• Version {submission.versionNumber}</span>
                        )}
                      </p>
                    </div>

                    {/* Grade Display */}
                    <div className="ml-6">
                      {submission.grade ? (
                        <div className="text-center">
                          <div className={`text-5xl font-bold ${getGradeColor(submission.grade.score)} mb-2`}>
                            {submission.grade.score}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            submission.grade.score >= 70 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {getGradeLabel(submission.grade.score)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-4xl mb-2">⏳</div>
                          <p className="text-sm text-gray-500 font-medium">
                            Pending
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback Section */}
                  {submission.grade && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {submission.grade.feedbackText && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            Lecturer Feedback:
                          </p>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-gray-700">{submission.grade.feedbackText}</p>
                          </div>
                        </div>
                      )}

                      {submission.grade.feedbackFilePath && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            Feedback File:
                          </p>
                          <a
                            href={`http://localhost:5000${submission.grade.feedbackFilePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Feedback File
                          </a>
                        </div>
                      )}

                      <div className="mt-4 flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Graded on {formatDate(submission.grade.createdAt)}
                      </div>
                    </div>
                  )}

                  {/* View Submission Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/student/submissions/${submission.id}`)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      View Submission Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGrades;
