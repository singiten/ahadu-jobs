
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-primary">Ahadu</span>
          <span className="logo-secondary">Jobs</span>
        </Link>

        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/jobs" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Find Jobs
          </Link>
          
          {user ? (
            <>
              {user.role === 'recruiter' && (
                <Link to="/post-job" className="nav-link post-job-link" onClick={() => setIsMenuOpen(false)}>
                  Post a Job
                </Link>
              )}
              
              {/* User Dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button 
                  className="user-dropdown-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="user-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/dashboard" 
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Link>
                    
                    {user.role === 'seeker' && (
                      <>
                        <Link 
                          to="/applications" 
                          className="dropdown-item"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          My Applications
                        </Link>
                        <Link 
                          to="/saved-jobs" 
                          className="dropdown-item"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          Saved Jobs
                        </Link>
                      </>
                    )}
                    
                    {user.role === 'recruiter' && (
                      <Link 
                        to="/company/profile" 
                        className="dropdown-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        Company Profile
                      </Link>
                    )}
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item logout"
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;