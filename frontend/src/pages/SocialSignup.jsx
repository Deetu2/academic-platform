import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

const SocialSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [socialData, setSocialData] = useState(null);
  const [role, setRole] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse social data from URL
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError('Invalid signup link. Please try again.');
      return;
    }

    try {
      const data = JSON.parse(decodeURIComponent(dataParam));
      setSocialData(data);
    } catch (err) {
      setError('Invalid signup data. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!role) {
      setError('Please select your role');
      setLoading(false);
      return;
    }

    if (role === 'STUDENT' && !matricNumber) {
      setError('Matric number is required for students');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/social-signup', {
        ...socialData,
        role,
        matricNumber: role === 'STUDENT' ? matricNumber : undefined,
      });

      // Save tokens
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      // Redirect based on role
      const roleRoutes = {
        STUDENT: '/student/dashboard',
        LECTURER: '/lecturer/dashboard',
      };
      navigate(roleRoutes[role]);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !socialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Signup Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/auth')}
              className="btn btn-primary"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!socialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">Welcome, {socialData.name}!</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Profile Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-3">
                {socialData.avatarUrl && (
                  <img
                    src={socialData.avatarUrl}
                    alt="Profile"
                    referrerPolicy="no-referrer" className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{socialData.name}</p>
                  <p className="text-sm text-gray-600">{socialData.email}</p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a... <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`p-6 border-2 rounded-lg transition-all text-center ${
                    role === 'STUDENT'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-4xl mb-2">👨‍🎓</div>
                  <div className="font-semibold text-gray-900">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('LECTURER')}
                  className={`p-6 border-2 rounded-lg transition-all text-center ${
                    role === 'LECTURER'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-4xl mb-2">👨‍🏫</div>
                  <div className="font-semibold text-gray-900">Lecturer</div>
                </button>
              </div>
            </div>

            {/* Matric Number - Only for Students */}
            {role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matric Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                  required
                  placeholder="SOF/25A/10001"
                  pattern="[A-Z]{3}/\d{2}[A-Z]/\d{5}"
                  title="Format: SOF/25A/10001"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: <strong>SOF/25A/10001</strong> (e.g., SOF/25A/10001)
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !role}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </button>
          </form>

          {/* Cancel */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel and go back
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default SocialSignup;
