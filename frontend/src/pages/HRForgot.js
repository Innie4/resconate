import React, { useState } from 'react';
import Link from 'next/link';
import GlobalNav from '../components/GlobalNav';
import { apiUrl } from '../utils/api';

const HRForgot = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('If the username exists, password reset instructions have been sent.');
        setUsername('');
      } else {
        setError(data.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      setError('An error occurred while sending reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <GlobalNav />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-key text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
            <p className="text-gray-600">Enter your username to reset your password</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter your username"
                  />
                  <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    Sending...
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/hr-login" className="text-indigo-600 hover:text-indigo-500 transition duration-200 text-sm">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Login
              </Link>
            </div>

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

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-3"></i>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Password Reset Instructions</p>
                  <p>If your username is found in our system, you will receive instructions on how to reset your password. Please contact your system administrator if you continue to have issues.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Resconate Portfolio. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRForgot;


