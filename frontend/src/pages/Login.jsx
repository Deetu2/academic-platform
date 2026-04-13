import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = ({ role }) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      if (user.role !== role) {
        setError(`This account is registered as ${user.role.toLowerCase()}, not ${role.toLowerCase()}`);
        await useAuthStore.getState().logout();
        return;
      }

      const roleRoutes = {
        LECTURER: '/lecturer/dashboard',
        STUDENT: '/student/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(roleRoutes[role]);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    LECTURER: { title: 'Lecturer Login', icon: '👨‍🏫', registerRoute: '/lecturer/register' },
    STUDENT: { title: 'Student Login', icon: '👨‍🎓', registerRoute: '/student/register' },
    ADMIN: { title: 'Admin Login', icon: '⚙️', registerRoute: null },
  };

  const info = roleInfo[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="text-6xl mb-4">{info.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900">{info.title}</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {info.registerRoute && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to={info.registerRoute}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
