import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { handleAnchorClick } from '../utils/scrollUtils';

const Hero = () => {
  const statRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target.querySelector('[data-count]');
          if (counter && !counter.dataset.animated) {
            animateCounter(counter);
            counter.dataset.animated = 'true';
          }
        }
      });
    }, observerOptions);

    const currentRefs = statRefs.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const animateCounter = (element) => {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  };

  return (
    <section id="home" className="hero-section pt-36 md:pt-40 pb-24 px-4 md:px-8 relative overflow-hidden">
      <div className="hero__glow"></div>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="hero__grid">
          <div className="hero__content" data-animate="fade-up">
            <span className="hero__badge">Product Studio × HR Flow</span>
            <h1 className="hero__title">
              Build magnetic products.<br />Run people operations without drag.
            </h1>
            <p className="hero__subtitle">
              Resconate pairs a venture-ready product studio with a compliant HR platform so your brand, product, and teams move in one rhythm.
            </p>
            <div className="hero__actions">
              <a href="#contact" className="btn btn-primary" onClick={(e) => handleAnchorClick(e, 'contact')}>Book a Discovery Call</a>
              <Link to="/hr-login" className="btn btn-secondary">Launch HR Platform</Link>
              <a href="#hr-platform" className="btn btn-ghost" onClick={(e) => handleAnchorClick(e, 'hr-platform')}>See the Platform</a>
            </div>
            <div className="hero__stats">
              <div className="hero__stat stat-card" ref={el => statRefs.current[0] = el}>
                <span className="hero__stat-number" data-count="80">80+</span>
                <span className="hero__stat-label">Launches delivered</span>
              </div>
              <div className="hero__stat stat-card" ref={el => statRefs.current[1] = el}>
                <span className="hero__stat-number" data-count="45">45</span>
                <span className="hero__stat-label">Teams running on Resconate</span>
              </div>
              <div className="hero__stat stat-card" ref={el => statRefs.current[2] = el}>
                <span className="hero__stat-number" data-count="6">6</span>
                <span className="hero__stat-label">Markets supported</span>
              </div>
            </div>
          </div>
          <div className="hero__visual" data-animate="fade-up" style={{ '--animate-delay': '0.15s' }}>
            <div className="hero__visual-card">
              <div className="hero__visual-header">
                <span>Studio sprint</span>
                <span className="hero__dot hero__dot--purple"></span>
                <span className="hero__dot hero__dot--pink"></span>
              </div>
              <ul className="hero__visual-list">
                <li>
                  <span>Map the story, ship in six weeks</span>
                  <i className="fas fa-arrow-right"></i>
                </li>
                <li>
                  <span>Embedded squads. Transparent KPIs.</span>
                  <i className="fas fa-arrow-right"></i>
                </li>
                <li>
                  <span>Brand, product, growth crafted together</span>
                  <i className="fas fa-arrow-right"></i>
                </li>
              </ul>
            </div>
            <div className="hero__visual-card hero__visual-card--accent">
              <h3>HR Flow</h3>
              <p>Payroll, compliance, performance, and banking automations tuned for African scale.</p>
              <a href="#hr-platform" className="hero__visual-link" onClick={(e) => handleAnchorClick(e, 'hr-platform')}>
                Explore modules <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

