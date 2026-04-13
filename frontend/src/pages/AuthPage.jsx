import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState('signin'); // signin or signup
  const [step, setStep] = useState(1); // 1: email, 2: password/register
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    password: '',
    name: '',
    department: '',
    bio: '',
    matricNo: '',
    level: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for OAuth errors
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'oauth_failed') {
      setError('Google authentication failed. Please try again.');
    } else if (errorParam === 'google_auth_failed') {
      setError('Google authentication was cancelled or failed. Please try again.');
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email exists in the system
      const response = await apiClient.post('/auth/check-email', { email });
      
      if (response.data.exists) {
        // Email exists - check if account is active
        if (response.data.status === 'DEACTIVATED') {
          setError('This account has been deactivated. Please contact support.');
          setLoading(false);
          return;
        }
        
        // Email exists - sign in mode
        setMode('signin');
        setUserRole(response.data.role);
        setStep(2);
      } else {
        // Email doesn't exist - sign up mode
        setMode('signup');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, formData.password);
      
      const roleRoutes = {
        LECTURER: '/lecturer/dashboard',
        STUDENT: '/student/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(roleRoutes[user.role]);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = {
        role: userRole,
        email,
        name: formData.name,
        password: formData.password,
        ...(userRole === 'LECTURER' && {
          department: formData.department,
          bio: formData.bio,
        }),
        ...(userRole === 'STUDENT' && {
          matricNo: formData.matricNo,
          level: formData.level,
          department: formData.department,
        }),
      };

      const user = await register(userData);
      
      const roleRoutes = {
        LECTURER: '/lecturer/dashboard',
        STUDENT: '/student/dashboard',
      };
      navigate(roleRoutes[user.role]);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    // Redirect to backend OAuth endpoint
    if (provider === 'Google') {
      window.location.href = 'http://localhost:5000/api/auth/google';
    }
    // Facebook and Microsoft removed - only Google supported
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Home
          </Link>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AcademiQ
          </h1>
          <p className="text-gray-600">Academic Collaboration Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setMode('signin');
                setStep(1);
                setError('');
                setEmail('');
                setUserRole(null);
                setFormData({
                  password: '',
                  name: '',
                  department: '',
                  bio: '',
                  matricNo: '',
                  level: '',
                });
              }}
              className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setStep(1);
                setError('');
                setEmail('');
                setUserRole(null);
                setFormData({
                  password: '',
                  name: '',
                  department: '',
                  bio: '',
                  matricNo: '',
                  level: '',
                });
              }}
              className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@university.edu"
                />
                <p className="mt-2 text-xs text-gray-500">
                  We'll check if you already have an account
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>

              {/* Social Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium text-gray-700">Continue with Google</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Sign In Form */}
          {step === 2 && mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  value={email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ← Change email
                </button>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Step 2: Sign Up Form */}
          {step === 2 && mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Role Selection */}
              {!userRole && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserRole('STUDENT')}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                      <div className="text-3xl mb-2">👨‍🎓</div>
                      <div className="font-semibold">Student</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole('LECTURER')}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                      <div className="text-3xl mb-2">👨‍🏫</div>
                      <div className="font-semibold">Lecturer</div>
                    </button>
                  </div>
                </div>
              )}

              {userRole && (
                <>
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{userRole === 'STUDENT' ? '👨‍🎓' : '👨‍🏫'}</span>
                      <span className="font-medium text-blue-900">
                        Registering as {userRole === 'STUDENT' ? 'Student' : 'Lecturer'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserRole(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      value={email}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Matric Number - Only for Students */}
                  {userRole === 'STUDENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Matric Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                        value={formData.matricNo || ''}
                        onChange={(e) => setFormData({ ...formData, matricNo: e.target.value.toUpperCase() })}
                        required
                        placeholder="SOF/25A/10001"
                        pattern="[A-Z]{3}/\d{2}[A-Z]/\d{5}"
                        title="Format: SOF/25A/10001 (e.g., SOF/25A/10001)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Format: <strong>SOF/25A/10001</strong> (3 letters / 2 digits + letter / 5 digits)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Computer Science"
                    />
                  </div>

                  {userRole === 'STUDENT' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Matric Number
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={formData.matricNo}
                            onChange={(e) => setFormData({ ...formData, matricNo: e.target.value })}
                            placeholder="STU001"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level
                          </label>
                          <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                          >
                            <option value="">Select</option>
                            <option value="100">100 Level</option>
                            <option value="200">200 Level</option>
                            <option value="300">300 Level</option>
                            <option value="400">400 Level</option>
                            <option value="500">500 Level</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {userRole === 'LECTURER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio (Optional)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      ← Change email
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </>
              )}
            </form>
          )}
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

export default AuthPage;
