import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const RoleSelect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        LECTURER: '/lecturer/dashboard',
        STUDENT: '/student/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(roleRoutes[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  const roles = [
    {
      name: 'Lecturer',
      description: 'Manage courses, assignments, and student progress',
      icon: '👨‍🏫',
      route: '/lecturer/login',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Student',
      description: 'Access courses, submit assignments, and view grades',
      icon: '👨‍🎓',
      route: '/student/login',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Admin',
      description: 'Manage users, courses, and system settings',
      icon: '⚙️',
      route: '/admin/login',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Academic Collaboration Platform
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <button
              key={role.name}
              onClick={() => navigate(role.route)}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{role.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {role.name}
                </h2>
                <p className="text-gray-600 mb-6">{role.description}</p>
                <div className={`inline-block px-6 py-3 rounded-lg text-white font-semibold ${role.color} transition-colors`}>
                  Continue as {role.name}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>© 2025 Academic Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
