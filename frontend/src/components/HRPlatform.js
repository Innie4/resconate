import React from 'react';
import Link from 'next/link';
import { handleAnchorClick } from '../utils/scrollUtils';

const HRPlatform = () => {
  const features = [
    {
      icon: 'fas fa-diagram-project',
      iconClass: 'feature-icon--indigo',
      title: 'Unified delivery playbooks',
      description: 'Discovery rituals, research libraries, and release dashboards keeping squads synced.'
    },
    {
      icon: 'fas fa-money-check-dollar',
      iconClass: 'feature-icon--pink',
      title: 'Payroll & compliance automation',
      description: 'Local tax logic, benefits orchestration, and filings handled in real time.'
    },
    {
      icon: 'fas fa-user-chart',
      iconClass: 'feature-icon--emerald',
      title: 'Performance & culture intelligence',
      description: 'OKRs, pulse surveys, and growth plans surfaced with actionable insight.'
    },
    {
      icon: 'fas fa-plug',
      iconClass: 'feature-icon--amber',
      title: 'Banking & API connectivity',
      description: 'Secure hooks into regional banks, identity partners, and core business systems.'
    }
  ];

  return (
    <section id="hr-platform" className="section-shell section-shell--gradient py-20 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="platform-grid">
          <div className="platform-intro" data-animate="fade-up">
            <span className="section-eyebrow">Platform Highlights</span>
            <h2 className="section-title">The suite that keeps shipping momentum and people care connected.</h2>
            <p className="section-lead">Turn on modules as you need them—each one plugs into your existing rituals without slowing teams down.</p>
            <div className="platform-actions">
              <Link href="/hr-login" className="btn btn-primary">Launch HR Suite</Link>
              <a href="#contact" className="btn btn-ghost" onClick={(e) => handleAnchorClick(e, 'contact')}>Talk to our team</a>
            </div>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article key={index} className="feature-card" data-animate="fade-up" style={{ '--animate-delay': `${(index + 1) * 0.05}s` }}>
                <div className={`feature-icon ${feature.iconClass}`}>
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HRPlatform;

