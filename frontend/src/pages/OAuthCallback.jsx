import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 OAuth Callback - Starting...');
      
      // Get tokens from URL
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const errorParam = searchParams.get('error');

      console.log('🔍 Checking URL parameters:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasError: !!errorParam
      });

      // Check for error
      if (errorParam) {
        console.error('❌ OAuth error parameter found:', errorParam);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      // Check for tokens
      if (!accessToken || !refreshToken) {
        console.error('❌ Missing tokens in URL');
        setError('Missing authentication tokens. Please try again.');
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      try {
        console.log('✅ Tokens found, saving to localStorage...');
        
        // Save tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Decode token to get user info (JWT format: header.payload.signature)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('🔓 Decoded JWT payload:', payload);
        
        // Fetch full user data
        console.log('📡 Fetching user data from /api/me...');
        const response = await fetch('http://localhost:5000/api/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch user data:', errorText);
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log('✅ User data received:', userData);
        
        const user = userData.data;

        if (!user) {
          console.error('❌ No user data in response');
          throw new Error('No user data received');
        }

        // Save user to localStorage and store
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        console.log('✅ User saved to store, redirecting to dashboard...');

        // Redirect based on role
        const roleRoutes = {
          STUDENT: '/student/dashboard',
          LECTURER: '/lecturer/dashboard',
          ADMIN: '/admin/dashboard',
        };

        const redirectPath = roleRoutes[user.role] || '/';
        console.log('➡️ Redirecting to:', redirectPath);
        
        navigate(redirectPath);
      } catch (err) {
        console.error('❌ OAuth callback error:', err);
        setError(`Failed to complete authentication: ${err.message}`);
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <span className="text-3xl">🎓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Completing Login...</h2>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
