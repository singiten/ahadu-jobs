import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobs, getJobApplications, updateApplicationStatus } from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Fetch jobs posted by this recruiter
      const response = await getJobs({ recruiter: user?.id });
      setJobs(response.data.jobs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const response = await getJobApplications(jobId);
      setApplications(response.data);
      setSelectedJob(jobId);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-active', text: 'Active' },
      expired: { class: 'badge-expired', text: 'Expired' },
      closed: { class: 'badge-closed', text: 'Closed' }
    };
    const badge = badges[status] || badges.active;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getApplicationStatusBadge = (status) => {
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
          <p className="dashboard-subtitle">Recruiter Dashboard</p>
        </div>
        <div className="header-actions">
          <Link to="/company/profile" className="btn-outline">Company Profile</Link>
          <Link to="/post-job" className="btn-primary">+ Post a Job</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Active Jobs</h3>
            <p className="stat-number">{jobs.filter(j => j.status === 'active').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Applications</h3>
            <p className="stat-number">
              {jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0)}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Review</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Hired</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          My Jobs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'jobs' && (
          <div className="jobs-list">
            <h2>My Job Postings</h2>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <p>You haven't posted any jobs yet.</p>
                <Link to="/post-job" className="btn-primary">Post Your First Job</Link>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map(job => (
                  <div key={job._id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="location">{job.location?.city}</p>
                    <p className="salary">
                      {job.salary?.min} - {job.salary?.max} {job.salary?.currency}
                    </p>
                    <div className="job-stats">
                      <span>📋 {job.applicationsCount || 0} applicants</span>
                      <span>👁️ {job.views || 0} views</span>
                    </div>
                    <div className="job-actions">
                      <button 
                        onClick={() => {
                          setActiveTab('applications');
                          fetchApplications(job._id);
                        }}
                        className="view-link"
                      >
                        View Applicants
                      </button>
                      <Link to={`/edit-job/${job._id}`} className="edit-link">Edit</Link>
                      <button className="delete-link">Close</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-list">
            <h2>Applications</h2>
            {!selectedJob && (
              <div className="empty-state">
                <p>Select a job to view its applications.</p>
              </div>
            )}
            {selectedJob && applications.length === 0 && (
              <div className="empty-state">
                <p>No applications for this job yet.</p>
              </div>
            )}
            {applications.length > 0 && (
              <div className="applications-grid">
                {applications.map(app => (
                  <div key={app._id} className="application-card">
                    <div className="application-header">
                      <h3>{app.applicant?.name || 'Unknown'}</h3>
                      {getApplicationStatusBadge(app.status)}
                    </div>
                    <p className="applicant-email">{app.applicant?.email}</p>
                    {app.coverLetter && (
                      <p className="cover-letter-preview">
                        {app.coverLetter.substring(0, 100)}...
                      </p>
                    )}
                    <div className="application-meta">
                      <span>📅 {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {app.resume && (
                        <a 
                          href={app.resume} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="resume-link"
                        >
                          📎 Resume
                        </a>
                      )}
                    </div>
                    <div className="application-actions">
                      <select 
                        className="status-select"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(app)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'company' && (
          <div className="profile-section">
            <h2>Company Profile</h2>
            <div className="profile-card">
              <div className="profile-field">
                <label>Company Name</label>
                <p>{user?.companyName || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-field">
                <label>Website</label>
                <p>{user?.companyWebsite || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Description</label>
                <p>{user?.companyDescription || 'No description provided'}</p>
              </div>
              <Link to="/company/profile/edit" className="btn-outline">Edit Profile</Link>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content application-details-modal" onClick={e => e.stopPropagation()}>
            <h2>Application Details</h2>
            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            
            <div className="applicant-info">
              <h3>{selectedApplication.applicant?.name}</h3>
              <p><strong>Email:</strong> {selectedApplication.applicant?.email}</p>
              <p><strong>Phone:</strong> {selectedApplication.applicant?.phone || 'Not provided'}</p>
              <p><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge-small ${selectedApplication.status}`}>
                  {selectedApplication.status}
                </span>
              </p>
            </div>

            {selectedApplication.coverLetter && (
              <div className="cover-letter-full">
                <h4>Cover Letter</h4>
                <p>{selectedApplication.coverLetter}</p>
              </div>
            )}

            {selectedApplication.resume && (
              <div className="resume-section">
                <h4>Resume</h4>
                <a 
                  href={selectedApplication.resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="download-resume-btn"
                >
                  📎 Download Resume
                </a>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;