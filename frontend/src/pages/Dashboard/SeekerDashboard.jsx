import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

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
      pending: { class: 'badge-pending', text: 'Pending' },
      reviewed: { class: 'badge-reviewed', text: 'Reviewed' },
      shortlisted: { class: 'badge-shortlisted', text: 'Shortlisted' },
      rejected: { class: 'badge-rejected', text: 'Rejected' },
      hired: { class: 'badge-hired', text: 'Hired' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="dashboard-subtitle">Job Seeker Dashboard</p>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="btn-outline">Edit Profile</Link>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Applications</h3>
            <p className="stat-number">{applications.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Review</h3>
            <p className="stat-number">
              {applications.filter(a => a.status === 'pending').length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Shortlisted</h3>
            <p className="stat-number">
              {applications.filter(a => a.status === 'shortlisted').length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Saved Jobs</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          My Applications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Jobs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'applications' && (
          <div className="applications-list">
            <h2>My Applications</h2>
            {applications.length === 0 ? (
              <div className="empty-state">
                <p>You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
              </div>
            ) : (
              <div className="applications-grid">
                {applications.map(app => (
                  <div key={app._id} className="application-card">
                    <div className="application-header">
                      <h3>{app.job?.title}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="company">{app.job?.company?.name}</p>
                    <p className="location">{app.job?.location?.city}</p>
                    <p className="applied-date">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    <div className="application-footer">
                      <Link to={`/jobs/${app.job?._id}`} className="view-link">
                        View Job →
                      </Link>
                      {app.status === 'shortlisted' && (
                        <span className="next-step">Next: Interview</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="saved-jobs">
            <h2>Saved Jobs</h2>
            <div className="empty-state">
              <p>You haven't saved any jobs yet.</p>
              <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Profile Information</h2>
            <div className="profile-card">
              <div className="profile-field">
                <label>Full Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-field">
                <label>Role</label>
                <p className="role-badge">{user?.role}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{user?.phone || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Location</label>
                <p>{user?.location || 'Not provided'}</p>
              </div>
              <Link to="/profile/edit" className="btn-outline">Edit Profile</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;