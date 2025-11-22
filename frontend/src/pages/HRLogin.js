import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            router.push('/hr-dashboard');
          }
        }
      } catch (error) {
        // User is not logged in, stay on login page
        clearTokens();
      }
    };
    checkAuth();
  }, [router]);

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
          router.push('/hr-dashboard');
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
    <div className="hr-login-page">
      <GlobalNav />
      <main className="hr-login-main">
        <div className="hr-login-container">
          <div className="hr-login-header">
            <div className="hr-login-icon-wrapper">
              <i className="fas fa-users"></i>
            </div>
            <h1 className="hr-login-title">HR Portal</h1>
            <p className="hr-login-subtitle">Sign in to access your HR dashboard</p>
          </div>

          <div className="hr-login-form">
            <form onSubmit={handleSubmit} className="hr-login-form-inner">
              <div className="hr-login-field">
                <label htmlFor="username" className="hr-login-label">
                  Username
                </label>
                <div className="hr-login-input-wrapper">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="hr-login-input"
                    placeholder="Enter your username"
                  />
                  <i className="fas fa-user hr-login-input-icon"></i>
                </div>
              </div>

              <div className="hr-login-field">
                <label htmlFor="password" className="hr-login-label">
                  Password
                </label>
                <div className="hr-login-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="hr-login-input hr-login-input--password"
                    placeholder="Enter your password"
                  />
                  <i className="fas fa-lock hr-login-input-icon"></i>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hr-login-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="hr-login-options">
                <label className="hr-login-checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hr-login-checkbox"
                  />
                  <span className="hr-login-checkbox-label">Remember me</span>
                </label>
                <Link href="/hr-forgot" className="hr-login-forgot-link">
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
              <div className="hr-login-message hr-login-message--error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="hr-login-message hr-login-message--success">
                <i className="fas fa-check-circle"></i>
                <span>{success}</span>
              </div>
            )}
          </div>

          <div className="hr-login-footer">
            <p>&copy; {new Date().getFullYear()} Resconate Portfolio. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRLogin;


