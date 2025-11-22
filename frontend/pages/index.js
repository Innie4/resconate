import React, { useEffect } from 'react';
import Header from '../src/components/Header';
import Hero from '../src/components/Hero';
import ValueProposition from '../src/components/ValueProposition';
import HRPlatform from '../src/components/HRPlatform';
import Ecosystem from '../src/components/Ecosystem';
import Proof from '../src/components/Proof';
import Contact from '../src/components/Contact';
import Footer from '../src/components/Footer';
import ScrollToTop from '../src/components/ScrollToTop';

const Home = () => {
  useEffect(() => {
    // Initialize animations for elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="App">
      <a href="#home" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main-content">
        <Hero />
        <ValueProposition />
        <HRPlatform />
        <Ecosystem />
        <Proof />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;



