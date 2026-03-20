import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../services/api';
import { toast } from 'react-toastify';
import './Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await getMyApplications();
      setApplications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending', icon: '⏳' },
      reviewed: { class: 'badge-reviewed', text: 'Reviewed', icon: '👀' },
      shortlisted: { class: 'badge-shortlisted', text: 'Shortlisted', icon: '⭐' },
      rejected: { class: 'badge-rejected', text: 'Rejected', icon: '❌' },
      hired: { class: 'badge-hired', text: 'Hired', icon: '✅' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`status-badge ${badge.class}`}>
        <span className="badge-icon">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const getFilteredApplications = () => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  };

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  const filteredApplications = getFilteredApplications();

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className="applications-page">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track the status of all your job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setFilter('all')}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total</h3>
            <p className="stat-number">{applications.length}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{getStatusCount('pending')}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('reviewed')}>
          <div className="stat-icon">👀</div>
          <div className="stat-content">
            <h3>Reviewed</h3>
            <p className="stat-number">{getStatusCount('reviewed')}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('shortlisted')}>
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Shortlisted</h3>
            <p className="stat-number">{getStatusCount('shortlisted')}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('hired')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Hired</h3>
            <p className="stat-number">{getStatusCount('hired')}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('rejected')}>
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-number">{getStatusCount('rejected')}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Applications
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === 'reviewed' ? 'active' : ''}`}
          onClick={() => setFilter('reviewed')}
        >
          Reviewed
        </button>
        <button 
          className={`filter-tab ${filter === 'shortlisted' ? 'active' : ''}`}
          onClick={() => setFilter('shortlisted')}
        >
          Shortlisted
        </button>
        <button 
          className={`filter-tab ${filter === 'hired' ? 'active' : ''}`}
          onClick={() => setFilter('hired')}
        >
          Hired
        </button>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No applications found</h2>
          <p>
            {filter === 'all' 
              ? "You haven't applied to any jobs yet." 
              : `You don't have any ${filter} applications.`}
          </p>
          <Link to="/jobs" className="browse-jobs-btn">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApplications.map(app => (
            <div key={app._id} className="application-card">
              <div className="application-header">
                <div className="job-info">
                  <h3>{app.job?.title}</h3>
                  <p className="company-name">{app.job?.company?.name}</p>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <span className="detail-label">Applied on:</span>
                  <span className="detail-value">
                    {new Date(app.appliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{app.job?.location?.city}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Job Type:</span>
                  <span className="detail-value">{app.job?.employmentType}</span>
                </div>
              </div>

              {app.coverLetter && (
                <div className="cover-letter-section">
                  <h4>Your Cover Letter</h4>
                  <p className="cover-letter-preview">
                    {app.coverLetter.substring(0, 200)}
                    {app.coverLetter.length > 200 && '...'}
                  </p>
                </div>
              )}

              <div className="application-footer">
                <div className="footer-left">
                  {app.resume && (
                    <a 
                      href={app.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      📎 View Resume
                    </a>
                  )}
                </div>
                <div className="footer-right">
                  <Link to={`/jobs/${app.job?._id}`} className="view-job-link">
                    View Job Details →
                  </Link>
                </div>
              </div>

              {/* Timeline */}
              <div className="application-timeline">
                <div className={`timeline-dot ${app.status === 'pending' ? 'active' : 'completed'}`}>
                  <span className="dot-label">Applied</span>
                </div>
                <div className={`timeline-line ${app.status !== 'pending' ? 'active' : ''}`}></div>
                <div className={`timeline-dot ${['reviewed', 'shortlisted', 'hired'].includes(app.status) ? 'active' : ''}`}>
                  <span className="dot-label">Reviewed</span>
                </div>
                <div className={`timeline-line ${['shortlisted', 'hired'].includes(app.status) ? 'active' : ''}`}></div>
                <div className={`timeline-dot ${['shortlisted', 'hired'].includes(app.status) ? 'active' : ''}`}>
                  <span className="dot-label">Shortlisted</span>
                </div>
                <div className={`timeline-line ${app.status === 'hired' ? 'active' : ''}`}></div>
                <div className={`timeline-dot ${app.status === 'hired' ? 'active' : ''}`}>
                  <span className="dot-label">Hired</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;