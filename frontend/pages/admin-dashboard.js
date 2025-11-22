import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GlobalNav from '../src/components/GlobalNav';
import { apiUrl, apiFetch, setToken, clearTokens } from '../utils/api';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({ totalEmployees: 0, activeJobs: 0, totalCandidates: 0 });
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'overview') {
        loadOverview();
      } else if (activeTab === 'users') {
        loadEmployees();
      } else if (activeTab === 'jobs') {
        loadJobs();
      } else if (activeTab === 'candidates') {
        loadCandidates();
      }
    }
  }, [isAuthenticated, activeTab]);

  const checkAuth = async () => {
    try {
      const response = await apiFetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadOverview = async () => {
    try {
      const [analyticsRes, employeesRes, jobsRes] = await Promise.all([
        apiFetch('/api/analytics'),
        apiFetch('/api/employees'),
        apiFetch('/api/hr/jobs')
      ]);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        if (data.success && data.data) {
          setAnalytics(data.data);
        }
      }
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        if (data.success) {
          setEmployees(data.data || []);
        }
      }
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        if (data.success) {
          setJobs(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load overview:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiFetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployees(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await apiFetch('/api/hr/jobs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await apiFetch('/api/recruitment/candidates');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCandidates(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token, true);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-users text-base"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-blue-600">Total Employees</p>
              <p className="text-xl font-bold text-blue-900">{analytics.totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-briefcase text-base"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-green-600">Active Jobs</p>
              <p className="text-xl font-bold text-green-900">{analytics.activeJobs}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-user-tie text-base"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-purple-600">Candidates</p>
              <p className="text-xl font-bold text-purple-900">{candidates.length}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Employees</h3>
          <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
            {employees.slice(0, 5).map((emp) => (
              <div key={emp.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.department || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Job Postings</h3>
          <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
            {jobs.filter(j => j.status === 'active').slice(0, 5).map((job) => (
              <div key={job.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.department} • {job.location}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">All Employees</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{emp.employee_id}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{emp.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{emp.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{emp.department || 'N/A'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Job Postings</h3>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{job.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{job.department} • {job.location}</p>
                <p className="text-xs text-gray-500 mt-1">Posted: {formatDate(job.posted_date)}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Candidates</h3>
      <div className="space-y-3">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{candidate.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{candidate.email}</p>
                {candidate.job_title && (
                  <p className="text-xs text-blue-600 mt-1">{candidate.job_title}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                candidate.status === 'hired' ? 'bg-green-100 text-green-800' :
                candidate.status === 'interview' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {candidate.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <GlobalNav />
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <i className="fas fa-shield-alt text-4xl text-blue-600 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
              <p className="text-sm text-gray-600">Access the HR Platform Admin Dashboard</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Username or Email</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-600">
              <p>Default credentials: <strong>admin</strong> / <strong>admin123</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <GlobalNav />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <i className="fas fa-users-cog text-xl text-blue-600 mr-3"></i>
              <h1 className="text-lg font-semibold text-gray-900">HR Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button
                onClick={() => {
                  clearTokens();
                  setIsAuthenticated(false);
                  router.push('/');
                }}
                className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6">
            {['overview', 'users', 'jobs', 'candidates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className={`fas fa-${tab === 'overview' ? 'chart-line' : tab === 'users' ? 'users' : tab === 'jobs' ? 'briefcase' : 'user-tie'} mr-2`}></i>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'jobs' && renderJobs()}
          {activeTab === 'candidates' && renderCandidates()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
