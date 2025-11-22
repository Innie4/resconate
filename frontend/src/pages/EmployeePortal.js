import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GlobalNav from '../src/components/GlobalNav';
import { apiFetch, clearTokens } from '../utils/api';

const EmployeePortal = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [employeeData, setEmployeeData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'vacation', start_date: '', end_date: '', reason: '' });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/api/employee/me');
        if (!response.ok) {
          clearTokens();
          router.push('/employee-login');
          return;
        }
        const data = await response.json();
        if (data.success) {
          setEmployeeData(data.employee);
        }
      } catch (error) {
        clearTokens();
        router.push('/employee-login');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (activeSection === 'profile') {
      loadProfile();
    } else if (activeSection === 'leave') {
      loadLeaveRequests();
    } else if (activeSection === 'payroll') {
      loadPayroll();
    } else if (activeSection === 'performance') {
      loadPerformance();
    }
  }, [activeSection]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/employee/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployeeData(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/leave');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLeaveRequests(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/payroll');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayrollData(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/performance');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPerformanceData(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startDate = new Date(leaveForm.start_date);
      const endDate = new Date(leaveForm.end_date);
      const daysRequested = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const response = await apiFetch('/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leaveForm,
          days_requested: daysRequested
        })
      });

      if (response.ok) {
        setShowLeaveForm(false);
        setLeaveForm({ leave_type: 'vacation', start_date: '', end_date: '', reason: '' });
        loadLeaveRequests();
      }
    } catch (error) {
      console.error('Failed to submit leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push('/employee-login');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const sections = [
    { id: 'profile', icon: 'user', title: 'My Profile', desc: 'View & update details', color: 'blue' },
    { id: 'leave', icon: 'calendar-alt', title: 'Leave Requests', desc: 'Apply & track leave', color: 'green' },
    { id: 'payroll', icon: 'money-bill-wave', title: 'Payroll', desc: 'View payslips', color: 'yellow' },
    { id: 'performance', icon: 'chart-line', title: 'Performance', desc: 'Reviews & goals', color: 'purple' }
  ];

  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : employeeData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Employee ID</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.employee_id}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.email}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Department</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.department || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Position</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.position || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Start Date</label>
            <p className="text-sm text-gray-900 mt-1">{formatDate(employeeData.start_date)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.phone || 'Not provided'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
            <p className="text-sm text-gray-900 mt-1">{employeeData.address || 'Not provided'}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Unable to load profile data</p>
        </div>
      )}
    </div>
  );

  const renderLeave = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
        <button
          onClick={() => setShowLeaveForm(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Request Leave
        </button>
      </div>
      {showLeaveForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">New Leave Request</h4>
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows="3"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : leaveRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-calendar-alt text-4xl mb-4 text-gray-300"></i>
          <p>No leave requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaveRequests.map((request) => (
            <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 capitalize">{request.leave_type} Leave</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.days_requested} days)
                  </p>
                  {request.reason && (
                    <p className="text-xs text-gray-600 mt-2">{request.reason}</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayroll = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payroll History</h3>
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : payrollData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-money-bill-wave text-4xl mb-4 text-gray-300"></i>
          <p>No payroll records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payrollData.map((pay) => (
            <div key={pay.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Pay Period</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDate(pay.pay_period_start)} - {formatDate(pay.pay_period_end)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(pay.net_salary)}</p>
                  <p className="text-xs text-gray-500">Net Salary</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs">
                <span className="text-gray-600">Gross: {formatCurrency(pay.gross_salary)}</span>
                <span className={`px-2 py-1 rounded ${
                  pay.status === 'paid' ? 'bg-green-100 text-green-800' :
                  pay.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pay.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Performance Reviews</h3>
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : performanceData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-chart-line text-4xl mb-4 text-gray-300"></i>
          <p>No performance reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {performanceData.map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Review Period</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDate(review.review_period_start)} - {formatDate(review.review_period_end)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{review.rating}/5</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
              {review.comments && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Comments</p>
                  <p className="text-xs text-gray-600">{review.comments}</p>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  review.status === 'completed' ? 'bg-green-100 text-green-800' :
                  review.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {review.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <GlobalNav />
      <nav className="shadow-sm border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/resconate-logo.png" alt="Resconate" className="h-8 w-auto" />
              <span className="ml-3 text-white text-base font-semibold">Employee Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">{employeeData?.name || 'Employee'}</span>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                activeSection === section.id ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2.5 rounded-full bg-${section.color}-100 text-${section.color}-600`}>
                  <i className={`fas fa-${section.icon} text-base`}></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-600">{section.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'leave' && renderLeave()}
          {activeSection === 'payroll' && renderPayroll()}
          {activeSection === 'performance' && renderPerformance()}
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
