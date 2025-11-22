import React from 'react';
import Link from 'next/link';
import { handleAnchorClick } from '../utils/scrollUtils';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer border-t border-gray-900/70 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="footer-logo" onClick={(e) => handleAnchorClick(e, 'home')}>
              <img src="/resconate-logo.png" alt="Resconate logo" />
              <span>Resconate</span>
            </a>
            <p>Digital products and HR infrastructure that move ambitious African teams forward.</p>
          </div>
          <div className="footer-nav">
            <span className="footer-heading">Navigate</span>
            <div className="footer-links">
              <a href="#agency-services" onClick={(e) => handleAnchorClick(e, 'agency-services')}>Value</a>
              <a href="#hr-platform" onClick={(e) => handleAnchorClick(e, 'hr-platform')}>Solutions</a>
              <a href="#proof" onClick={(e) => handleAnchorClick(e, 'proof')}>Proof</a>
              <a href="#contact" onClick={(e) => handleAnchorClick(e, 'contact')}>Contact</a>
            </div>
          </div>
          <div className="footer-nav">
            <span className="footer-heading">Platform</span>
            <div className="footer-links">
              <Link href="/hr-login">HR Portal</Link>
              <Link href="/admin-dashboard">Admin Console</Link>
              <Link href="/employee-login">Employee Sign In</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; <span id="current-year">{currentYear}</span> Resconate. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/api-docs" target="_blank" rel="noopener">API Docs</a>
            <a href="mailto:inimfonudoh2004@gmail.com">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

