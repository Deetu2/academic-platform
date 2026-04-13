import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import apiClient from '../../api/client';

const EnrollCourse = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [enrolledCourse, setEnrolledCourse] = useState(null);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      return;
    }

    if (joinCode.length !== 8) {
      setError('Join code must be 8 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/courses/enroll', {
        joinCode: joinCode.toUpperCase()
      });
      
      setSuccess(true);
      setEnrolledCourse(response.data.data.course);
      setJoinCode('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student/courses');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll. Please check the join code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/student/courses')}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center text-sm"
          >
            ← Back to My Courses
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Enroll in a Course</h1>
          <p className="text-lg text-gray-600">
            Enter the join code provided by your lecturer to enroll
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {success ? (
            /* Success State */
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Successfully Enrolled! 🎉
              </h2>
              
              {enrolledCourse && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mt-6 mb-6 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">You are now enrolled in:</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {enrolledCourse.title}
                  </h3>
                  <p className="text-gray-600">{enrolledCourse.code}</p>
                  {enrolledCourse.lecturer?.user && (
                    <p className="text-sm text-gray-500 mt-3">
                      Lecturer: {enrolledCourse.lecturer.user.name}
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                Redirecting you to your courses...
              </p>
              
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            /* Enrollment Form */
            <div>
              {/* Decorative Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 text-white text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-2xl font-bold">Ready to Join a Course?</h2>
              </div>

              {/* Form */}
              <div className="p-8 md:p-12">
                <form onSubmit={handleEnroll} className="max-w-md mx-auto">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-3">
                      Course Join Code
                    </label>
                    <input
                      type="text"
                      id="joinCode"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      maxLength={8}
                      className="w-full px-6 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                      placeholder="ABC12345"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      8-character code provided by your lecturer
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || joinCode.length !== 8}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enrolling...
                      </span>
                    ) : (
                      'Enroll Now'
                    )}
                  </button>
                </form>

                {/* Help Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="p-4">
                      <div className="text-3xl mb-3">👨‍🏫</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ask Your Lecturer</h3>
                      <p className="text-sm text-gray-600">
                        Contact your lecturer to get the join code
                      </p>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-3xl mb-3">🔍</div>
                      <h3 className="font-semibold text-gray-900 mb-2">Browse Lecturers</h3>
                      <button
                        onClick={() => navigate('/student/lecturers')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Lecturer Directory →
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-3xl mb-3">📋</div>
                      <h3 className="font-semibold text-gray-900 mb-2">8 Characters</h3>
                      <p className="text-sm text-gray-600">
                        Codes are exactly 8 characters long
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {!success && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-xl mr-2">ℹ️</span>
                What happens after enrolling?
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Access course materials instantly
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  View and submit assignments
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Message your lecturer
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Receive course notifications
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Good to Know
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Join codes are case-insensitive
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  You can drop SELECTIVE courses anytime
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  COMPULSORY courses cannot be dropped
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  You can re-enroll in dropped courses
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollCourse;
