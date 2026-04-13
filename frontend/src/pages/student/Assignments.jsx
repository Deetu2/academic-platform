import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all enrolled courses and their assignments
      const coursesRes = await apiClient.get('/courses');
      const courses = coursesRes.data.data || [];
      
      // Get assignments for each course
      let allAssignments = [];
      for (const course of courses) {
        try {
          const assignmentsRes = await apiClient.get(`/courses/${course.id}/assignments`);
          const courseAssignments = (assignmentsRes.data.data || []).map(a => ({
            ...a,
            course: { title: course.title, code: course.code }
          }));
          allAssignments = [...allAssignments, ...courseAssignments];
        } catch (error) {
          console.error(`Error loading assignments for course ${course.id}:`, error);
        }
      }
      
      // Get my submissions
      const submissionsRes = await apiClient.get('/students/me/submissions');
      setSubmissions(submissionsRes.data.data || []);
      
      // Sort by due date
      allAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setAssignments(allAssignments);
      
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = submissions.find(s => s.assignment?.id === assignmentId && s.isActive);
    if (!submission) return 'not_submitted';
    if (submission.grade) return 'graded';
    return 'submitted';
  };

  const getSubmission = (assignmentId) => {
    return submissions.find(s => s.assignment?.id === assignmentId && s.isActive);
  };

  const getDaysUntilDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Overdue', color: 'text-red-600', urgent: true };
    if (days === 0) return { text: 'Due Today', color: 'text-red-600', urgent: true };
    if (days === 1) return { text: 'Due Tomorrow', color: 'text-orange-600', urgent: true };
    if (days <= 3) return { text: `${days} days left`, color: 'text-orange-600', urgent: true };
    return { text: `${days} days left`, color: 'text-gray-600', urgent: false };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const status = getSubmissionStatus(assignment.id);
    if (filter === 'all') return true;
    if (filter === 'pending') return status === 'not_submitted';
    if (filter === 'submitted') return status === 'submitted';
    if (filter === 'graded') return status === 'graded';
    return true;
  });

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
            <p className="mt-4 text-gray-600">Loading assignments...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments & Projects</h1>
          <p className="text-gray-600">Track and submit your coursework</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-blue-600">
              {assignments.length}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-orange-600">
              {assignments.filter(a => getSubmissionStatus(a.id) === 'not_submitted').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {assignments.filter(a => getSubmissionStatus(a.id) === 'submitted').length}
            </p>
            <p className="text-sm text-gray-600">Submitted</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-green-600">
              {assignments.filter(a => getSubmissionStatus(a.id) === 'graded').length}
            </p>
            <p className="text-sm text-gray-600">Graded</p>
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
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({assignments.filter(a => getSubmissionStatus(a.id) === 'not_submitted').length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'submitted'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Submitted ({assignments.filter(a => getSubmissionStatus(a.id) === 'submitted').length})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              filter === 'graded'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Graded ({assignments.filter(a => getSubmissionStatus(a.id) === 'graded').length})
          </button>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Assignments' : `No ${filter} Assignments`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'No assignments posted yet in your courses'
                : `You have no ${filter} assignments at the moment`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const status = getSubmissionStatus(assignment.id);
              const submission = getSubmission(assignment.id);
              const deadline = getDaysUntilDeadline(assignment.dueDate);
              
              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                            assignment.type === 'PROJECT'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {assignment.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {assignment.course?.code}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {assignment.course?.title}
                        </p>
                        <p className="text-gray-700 line-clamp-2">
                          {assignment.description}
                        </p>
                      </div>

                      <div className="ml-6 flex flex-col items-end">
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          status === 'graded'
                            ? 'bg-green-100 text-green-700'
                            : status === 'submitted'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {status === 'graded' ? '✓ Graded' : status === 'submitted' ? '✓ Submitted' : 'Not Submitted'}
                        </span>
                        
                        {submission?.grade && (
                          <div className="mt-3 text-center">
                            <p className="text-3xl font-bold text-green-600">
                              {submission.grade.score}
                            </p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className={`flex items-center mb-4 ${deadline.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'} rounded-lg p-3`}>
                      <svg className={`w-5 h-5 mr-2 ${deadline.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Due: {formatDate(assignment.dueDate)}
                        </p>
                        <p className={`text-xs ${deadline.color} font-semibold`}>
                          {deadline.text}
                        </p>
                      </div>
                    </div>

                    {/* Submission Details */}
                    {submission && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Submitted on {formatDate(submission.submittedAt)}
                            </p>
                            {submission.isLate && (
                              <p className="text-xs text-red-600 font-medium mt-1">
                                ⚠️ Submitted after deadline
                              </p>
                            )}
                            {submission.versionNumber > 1 && (
                              <p className="text-xs text-blue-600 mt-1">
                                Version {submission.versionNumber} (Resubmitted)
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/student/assignments/${assignment.id}/history`)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View History →
                          </button>
                        </div>
                        
                        {submission.grade?.feedbackText && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-900">{submission.grade.feedbackText}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Details
                      </button>
                      {status !== 'graded' && (
                        <button
                          onClick={() => navigate(`/student/assignments/${assignment.id}/submit`)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          {status === 'submitted' ? 'Resubmit' : 'Submit Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
