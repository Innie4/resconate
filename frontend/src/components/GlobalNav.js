import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getToken, getEmployeeToken } from '../utils/api';

const GlobalNav = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by checking for any token
    const adminToken = getToken();
    const employeeToken = getEmployeeToken();
    setIsLoggedIn(!!(adminToken || employeeToken));
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="global-nav">
      <div className="global-nav__container">
        <Link to="/" className="global-nav__brand">
          <img src="/resconate-logo.png" alt="Resconate Logo" />
          <span>Resconate HR Suite</span>
        </Link>
        <nav className="global-nav__links" aria-label="Resconate navigation">
          <Link to="/#home" className="global-nav__link">Main Site</Link>
          {isLoggedIn ? (
            <>
              <Link to="/#ecosystem" className="global-nav__link">Platform Directory</Link>
              <Link to="/hr-login" className={`global-nav__link ${isActive('/hr-login') ? 'active' : ''}`}>HR Login</Link>
              <Link to="/admin-dashboard" className={`global-nav__link ${isActive('/admin-dashboard') ? 'active' : ''}`}>Admin</Link>
              <Link to="/hr-dashboard" className={`global-nav__link ${isActive('/hr-dashboard') ? 'active' : ''}`}>HR Dashboard</Link>
              <Link to="/employee-login" className={`global-nav__link ${isActive('/employee-login') ? 'active' : ''}`}>Employee Login</Link>
              <Link to="/employee-portal" className={`global-nav__link ${isActive('/employee-portal') ? 'active' : ''}`}>Employee Portal</Link>
            </>
          ) : (
            <Link to="/hr-login" className={`global-nav__link ${isActive('/hr-login') ? 'active' : ''}`}>HR Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default GlobalNav;


