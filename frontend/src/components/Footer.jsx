import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section">
            <h3>Kuraz Jobs</h3>
            <p className="footer-tagline">Connecting Ethiopia's talent with opportunity</p>
            <p className="footer-description">
              Find your dream job or hire the best talent in Ethiopia. 
              We're here to help you succeed.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/jobs">Find Jobs</Link></li>
              <li><Link to="/companies">Companies</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="footer-section">
            <h4>For Job Seekers</h4>
            <ul>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/saved-jobs">Saved Jobs</Link></li>
              <li><Link to="/applications">My Applications</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="footer-section">
            <h4>For Employers</h4>
            <ul>
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/resources">Resources</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-info">
              <li>📍 Addis Ababa, Ethiopia</li>
              <li>📞 +251 944067097</li>
              <li>✉️ hello@ahadujobs.com</li>
            </ul>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="Instagram">📷</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Kuraz Jobs. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;