import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlobalNav from '../components/GlobalNav';
import { apiUrl, apiFetch, setToken, clearTokens } from '../utils/api';

const HRLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            navigate('/hr-dashboard');
          }
        }
      } catch (error) {
        // User is not logged in, stay on login page
        clearTokens();
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token, rememberMe);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/hr-dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <GlobalNav />
      <main className="flex items-center justify-center px-4 py-10 min-h-[calc(100vh-80px)] mt-20">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-users text-white text-2xl"></i>
            </div>
            <h1 className="hr-login-title">HR Portal</h1>
            <p className="hr-login-subtitle">Sign in to access your HR dashboard</p>
          </div>

          <div className="hr-login-form">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="username" className="hr-login-label">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="hr-login-input"
                    placeholder="Enter your username"
                  />
                  <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="hr-login-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="hr-login-input hr-login-input--password"
                    placeholder="Enter your password"
                  />
                  <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="hr-login-checkbox-label">Remember me</span>
                </label>
                <Link to="/hr-forgot" className="hr-login-forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hr-login-cta-btn"
              >
                {loading ? (
                  <>
                    Signing In...
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <i className="fas fa-check-circle mr-2"></i>
                {success}
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Resconate Portfolio. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRLogin;


