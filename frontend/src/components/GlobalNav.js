import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getToken, getEmployeeToken } from '../utils/api';

const GlobalNav = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by checking for any token
    const adminToken = getToken();
    const employeeToken = getEmployeeToken();
    setIsLoggedIn(!!(adminToken || employeeToken));
  }, [router.pathname]);

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <header className="global-nav">
      <div className="global-nav__container">
        <Link href="/" className="global-nav__brand">
          <img src="/resconate-logo.png" alt="Resconate Logo" />
          <span>Resconate HR Suite</span>
        </Link>
        <nav className="global-nav__links" aria-label="Resconate navigation">
          <Link href="/#home" className="global-nav__link">Main Site</Link>
          {isLoggedIn ? (
            <>
              <Link href="/#ecosystem" className="global-nav__link">Platform Directory</Link>
              <Link href="/hr-login" className={`global-nav__link ${isActive('/hr-login') ? 'active' : ''}`}>HR Login</Link>
              <Link href="/admin-dashboard" className={`global-nav__link ${isActive('/admin-dashboard') ? 'active' : ''}`}>Admin</Link>
              <Link href="/hr-dashboard" className={`global-nav__link ${isActive('/hr-dashboard') ? 'active' : ''}`}>HR Dashboard</Link>
              <Link href="/employee-login" className={`global-nav__link ${isActive('/employee-login') ? 'active' : ''}`}>Employee Login</Link>
              <Link href="/employee-portal" className={`global-nav__link ${isActive('/employee-portal') ? 'active' : ''}`}>Employee Portal</Link>
            </>
          ) : (
            <Link href="/hr-login" className={`global-nav__link ${isActive('/hr-login') ? 'active' : ''}`}>HR Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default GlobalNav;


