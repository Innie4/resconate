import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GlobalNav from '../src/components/GlobalNav';
import { apiFetch, clearTokens } from '../utils/api';

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    activeJobs: 0,
    pendingInterviews: 0,
    complianceScore: 0
  });
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [bankingData, setBankingData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddPayroll, setShowAddPayroll] = useState(false);
  const [showAddPerformance, setShowAddPerformance] = useState(false);
  const [showAddCompliance, setShowAddCompliance] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    salary: '',
    phone: '',
    address: '',
    start_date: ''
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: '',
    salary: '',
    description: '',
    requirements: ''
  });
  const [payrollForm, setPayrollForm] = useState({
    employee_id: '',
    pay_period_start: '',
    pay_period_end: '',
    gross_salary: '',
    deductions: '',
    net_salary: ''
  });
  const [performanceForm, setPerformanceForm] = useState({
    employee_id: '',
    review_period_start: '',
    review_period_end: '',
    rating: '',
    comments: ''
  });
  const [complianceForm, setComplianceForm] = useState({
    record_type: '',
    employee_id: '',
    compliance_date: '',
    score: '',
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/api/auth/me');
        if (!response.ok) {
          clearTokens();
          router.push('/hr-login');
          return;
        }
        const data = await response.json();
        if (!data.success) {
          clearTokens();
          router.push('/hr-login');
          return;
        }
        loadAnalytics();
      } catch (error) {
        clearTokens();
        router.push('/hr-login');
      }
    };
    checkAuth();
  }, [router]);

  const loadAnalytics = async () => {
    try {
      const response = await apiFetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAnalytics(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push('/hr-login');
  };

  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployees();
    } else if (activeTab === 'recruitment') {
      loadRecruitment();
      loadJobs();
    } else if (activeTab === 'payroll') {
      loadPayroll();
      loadEmployees(); // Load employees for dropdown
    } else if (activeTab === 'performance') {
      loadPerformance();
      loadEmployees(); // Load employees for dropdown
    } else if (activeTab === 'banking') {
      loadBanking();
    } else if (activeTab === 'compliance') {
      loadCompliance();
      loadEmployees(); // Load employees for dropdown
    }
  }, [activeTab]);

  const loadEmployees = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const loadRecruitment = async () => {
    setLoading(true);
    try {
      const [candidatesRes, interviewsRes] = await Promise.all([
        apiFetch('/api/recruitment/candidates'),
        apiFetch('/api/recruitment/interviews')
      ]);
      if (candidatesRes.ok) {
        const data = await candidatesRes.json();
        if (data.success) setCandidates(data.data || []);
      }
      if (interviewsRes.ok) {
        const data = await interviewsRes.json();
        if (data.success) setInterviews(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load recruitment data:', error);
    } finally {
      setLoading(false);
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

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/hr/payroll');
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
      const response = await apiFetch('/api/hr/performance');
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

  const loadBanking = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/banking');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBankingData(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load banking:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/compliance');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComplianceData(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddEmployee(false);
          setEmployeeForm({
            name: '',
            email: '',
            department: '',
            position: '',
            salary: '',
            phone: '',
            address: '',
            start_date: ''
          });
          loadEmployees();
          loadAnalytics();
        }
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch('/api/hr/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddJob(false);
          setJobForm({
            title: '',
            department: '',
            location: '',
            employment_type: '',
            salary: '',
            description: '',
            requirements: ''
          });
          loadJobs();
          loadAnalytics();
        }
      }
    } catch (error) {
      console.error('Failed to add job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const deductions = payrollForm.deductions ? JSON.parse(payrollForm.deductions) : [];
      const response = await apiFetch('/api/hr/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payrollForm,
          deductions
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddPayroll(false);
          setPayrollForm({
            employee_id: '',
            pay_period_start: '',
            pay_period_end: '',
            gross_salary: '',
            deductions: '',
            net_salary: ''
          });
          loadPayroll();
        }
      }
    } catch (error) {
      console.error('Failed to add payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerformance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch('/api/hr/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(performanceForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddPerformance(false);
          setPerformanceForm({
            employee_id: '',
            review_period_start: '',
            review_period_end: '',
            rating: '',
            comments: ''
          });
          loadPerformance();
        }
      }
    } catch (error) {
      console.error('Failed to add performance review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompliance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complianceForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddCompliance(false);
          setComplianceForm({
            record_type: '',
            employee_id: '',
            compliance_date: '',
            score: '',
            notes: ''
          });
          loadCompliance();
        }
      }
    } catch (error) {
      console.error('Failed to add compliance record:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmployeesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Employee Directory</h3>
        <button
          onClick={() => setShowAddEmployee(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-1"></i>Add Employee
        </button>
      </div>
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add New Employee</h3>
              <button
                onClick={() => setShowAddEmployee(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={employeeForm.position}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={employeeForm.start_date}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={employeeForm.address}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
              <p className="text-xs text-gray-500">* Employee ID will be auto-generated</p>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-users text-4xl mb-4 text-gray-300"></i>
          <p>No employees found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{emp.employee_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{emp.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.department || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.position || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatCurrency(emp.salary)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderRecruitmentTab = () => (
    <div className="space-y-6">
      {showAddJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add New Job</h3>
              <button
                onClick={() => setShowAddJob(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={jobForm.employment_type}
                    onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-900">Job Postings</h3>
            <button
              onClick={() => setShowAddJob(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-1"></i>New Job
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-briefcase text-3xl mb-2 text-gray-300"></i>
                <p className="text-sm">No job postings</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{job.department} • {job.location}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Candidates</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-user-tie text-3xl mb-2 text-gray-300"></i>
                <p className="text-sm">No candidates</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {candidates.slice(0, 5).map((candidate) => (
                  <div key={candidate.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{candidate.email}</p>
                        {candidate.job_title && (
                          <p className="text-xs text-blue-600 mt-1">{candidate.job_title}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
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
            )}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-calendar-alt text-3xl mb-2 text-gray-300"></i>
              <p className="text-sm">No scheduled interviews</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {interviews.filter(i => i.status === 'pending' || i.status === 'scheduled').slice(0, 5).map((interview) => (
                <div key={interview.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Interview #{interview.id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(interview.scheduled_date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                      interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayrollTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Payroll Records</h3>
        <button
          onClick={() => setShowAddPayroll(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-1"></i>Add Payroll
        </button>
      </div>
      {showAddPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add Payroll Record</h3>
              <button
                onClick={() => setShowAddPayroll(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddPayroll} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee *</label>
                  <select
                    value={payrollForm.employee_id}
                    onChange={(e) => setPayrollForm({ ...payrollForm, employee_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employee_id}>
                        {emp.employee_id} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pay Period Start *</label>
                  <input
                    type="date"
                    value={payrollForm.pay_period_start}
                    onChange={(e) => setPayrollForm({ ...payrollForm, pay_period_start: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pay Period End *</label>
                  <input
                    type="date"
                    value={payrollForm.pay_period_end}
                    onChange={(e) => setPayrollForm({ ...payrollForm, pay_period_end: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gross Salary *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.gross_salary}
                    onChange={(e) => setPayrollForm({ ...payrollForm, gross_salary: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deductions (JSON)</label>
                  <input
                    type="text"
                    value={payrollForm.deductions}
                    onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder='[{"type":"tax","amount":100}]'
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Net Salary *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.net_salary}
                    onChange={(e) => setPayrollForm({ ...payrollForm, net_salary: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Payroll'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPayroll(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollData.map((pay) => (
                <tr key={pay.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pay.employee_name}</div>
                    <div className="text-xs text-gray-500">{pay.employee_id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(pay.pay_period_start)} - {formatDate(pay.pay_period_end)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(pay.gross_salary)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(pay.net_salary)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pay.status === 'paid' ? 'bg-green-100 text-green-800' :
                      pay.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Performance Reviews</h3>
        <button
          onClick={() => setShowAddPerformance(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-1"></i>Add Review
        </button>
      </div>
      {showAddPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add Performance Review</h3>
              <button
                onClick={() => setShowAddPerformance(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddPerformance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee *</label>
                  <select
                    value={performanceForm.employee_id}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, employee_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employee_id}>
                        {emp.employee_id} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rating (1-5) *</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={performanceForm.rating}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, rating: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Review Period Start</label>
                  <input
                    type="date"
                    value={performanceForm.review_period_start}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, review_period_start: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Review Period End</label>
                  <input
                    type="date"
                    value={performanceForm.review_period_end}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, review_period_end: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={performanceForm.comments}
                  onChange={(e) => setPerformanceForm({ ...performanceForm, comments: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPerformance(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : performanceData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
          <p>No performance reviews found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceData.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{review.employee_name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{review.department}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-blue-600">{review.rating}/5</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Period: {formatDate(review.review_period_start)} - {formatDate(review.review_period_end)}
              </div>
              {review.comments && (
                <p className="text-xs text-gray-600 line-clamp-2">{review.comments}</p>
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

  const renderBankingTab = () => (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Employee Banking Summary</h3>
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : bankingData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-university text-4xl mb-4 text-gray-300"></i>
          <p>No banking data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bankingData.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.employee_id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.department || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(emp.salary)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(emp.total_paid)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{emp.payment_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Compliance Records</h3>
        <button
          onClick={() => setShowAddCompliance(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-1"></i>Add Record
        </button>
      </div>
      {showAddCompliance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">Add Compliance Record</h3>
              <button
                onClick={() => setShowAddCompliance(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddCompliance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Record Type *</label>
                  <input
                    type="text"
                    value={complianceForm.record_type}
                    onChange={(e) => setComplianceForm({ ...complianceForm, record_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Training, Certification"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    value={complianceForm.employee_id}
                    onChange={(e) => setComplianceForm({ ...complianceForm, employee_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Company-wide (no specific employee)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employee_id}>
                        {emp.employee_id} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Compliance Date</label>
                  <input
                    type="date"
                    value={complianceForm.compliance_date}
                    onChange={(e) => setComplianceForm({ ...complianceForm, compliance_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={complianceForm.score}
                    onChange={(e) => setComplianceForm({ ...complianceForm, score: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={complianceForm.notes}
                  onChange={(e) => setComplianceForm({ ...complianceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompliance(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        </div>
      ) : complianceData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-shield-alt text-4xl mb-4 text-gray-300"></i>
          <p>No compliance records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceData.map((record) => (
            <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{record.record_type}</h4>
                {record.score && (
                  <div className="text-right">
                    <div className="text-base font-bold text-purple-600">{record.score}%</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Date: {formatDate(record.compliance_date)}
              </div>
              {record.notes && (
                <p className="text-xs text-gray-600 line-clamp-2">{record.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <GlobalNav />
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/resconate-logo.png" alt="Resconate" className="h-8 w-auto" />
              <h1 className="ml-3 text-base font-semibold text-gray-900">HR Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span>Welcome, HR Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <i className="fas fa-users text-base"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total Employees</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.totalEmployees}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <i className="fas fa-briefcase text-base"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Active Jobs</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.activeJobs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                  <i className="fas fa-calendar-alt text-base"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Pending Interviews</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.pendingInterviews}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <i className="fas fa-chart-line text-base"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Compliance Score</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.complianceScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-6 overflow-x-auto px-4">
              {['employees', 'recruitment', 'payroll', 'performance', 'banking', 'compliance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <i className={`fas fa-${tab === 'employees' ? 'users' : tab === 'recruitment' ? 'user-plus' : tab === 'payroll' ? 'money-bill-wave' : tab === 'performance' ? 'chart-bar' : tab === 'banking' ? 'university' : 'shield-alt'} mr-2`}></i>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'employees' && renderEmployeesTab()}
            {activeTab === 'recruitment' && renderRecruitmentTab()}
            {activeTab === 'payroll' && renderPayrollTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
            {activeTab === 'banking' && renderBankingTab()}
            {activeTab === 'compliance' && renderComplianceTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
