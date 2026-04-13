import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const LandingPage = () => {
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

  const features = [
    {
      icon: '📚',
      title: 'Course Management',
      description: 'Create and manage courses with ease. Upload materials and track student progress.',
    },
    {
      icon: '✍️',
      title: 'Assignments & Grading',
      description: 'Create assignments, receive submissions, and provide detailed feedback to students.',
    },
    {
      icon: '💬',
      title: 'Real-time Messaging',
      description: 'Communicate directly with students and lecturers through our integrated messaging system.',
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Stay updated with instant notifications for assignments, grades, and messages.',
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor academic progress with detailed analytics and performance reports.',
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and encryption.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AcademiQ
              </span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  🚀 Modern Learning Platform
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AcademiQ
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                A comprehensive academic collaboration platform connecting students, lecturers, 
                and administrators. Streamline your educational journey with powerful tools and seamless communication.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/auth')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  Get Started
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 font-semibold text-lg border border-gray-200"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="text-8xl animate-bounce">🎓</div>
                    <div className="grid grid-cols-3 gap-4 px-12">
                      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                        <div className="text-3xl mb-2">👨‍🏫</div>
                        <div className="text-xs font-semibold text-gray-700">Lecturers</div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                        <div className="text-3xl mb-2">👨‍🎓</div>
                        <div className="text-xs font-semibold text-gray-700">Students</div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                        <div className="text-3xl mb-2">⚙️</div>
                        <div className="text-xs font-semibold text-gray-700">Admins</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-purple-400 rounded-full opacity-20 animate-pulse delay-75"></div>
                <div className="absolute top-1/2 right-20 w-12 h-12 bg-indigo-400 rounded-full opacity-20 animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Academic Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to enhance learning, teaching, and collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students and educators using AcademiQ every day
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold text-lg"
          >
            Start Your Journey Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎓</span>
                </div>
                <span className="text-lg font-bold text-white">AcademiQ</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering education through innovative technology and seamless collaboration.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 AcademiQ. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add custom CSS for grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
