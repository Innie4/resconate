import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalNav from '../components/GlobalNav';
import { apiUrl, apiFetch, clearTokens } from '../utils/api';

const EmployeePortal = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/api/employee/me');
        if (!response.ok) {
          clearTokens();
          navigate('/employee-login');
        }
      } catch (error) {
        clearTokens();
        navigate('/employee-login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    clearTokens();
    navigate('/employee-login');
  };

  const sections = [
    { id: 'profile', icon: 'user', title: 'My Profile', desc: 'View & update details' },
    { id: 'leave', icon: 'calendar-alt', title: 'Leave Requests', desc: 'Apply & track leave' },
    { id: 'payroll', icon: 'money-bill-wave', title: 'Payroll', desc: 'View payslips' },
    { id: 'performance', icon: 'chart-line', title: 'Performance', desc: 'Reviews & goals' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <GlobalNav />
      <nav className="gradient-bg shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="/resconate-logo.png" alt="Resconate" className="h-8 w-auto" />
              <span className="ml-3 text-white text-xl font-bold">Employee Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, Employee</span>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${section.id === 'profile' ? 'blue' : section.id === 'leave' ? 'green' : section.id === 'payroll' ? 'yellow' : 'purple'}-100 text-${section.id === 'profile' ? 'blue' : section.id === 'leave' ? 'green' : section.id === 'payroll' ? 'yellow' : 'purple'}-600`}>
                  <i className={`fas fa-${section.icon} text-xl`}></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-gray-600">{section.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12 text-gray-500">
            <i className={`fas fa-${sections.find(s => s.id === activeSection)?.icon || 'cog'} text-4xl mb-4`}></i>
            <p>{sections.find(s => s.id === activeSection)?.title || 'Dashboard'} content coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;


