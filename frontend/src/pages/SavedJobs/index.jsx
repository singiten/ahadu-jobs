import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSavedJobs, removeSavedJob } from '../../services/api';
import { toast } from 'react-toastify';
import './SavedJobs.css';

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await getSavedJobs();
      setSavedJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await removeSavedJob(jobId);
      setSavedJobs(savedJobs.filter(job => job._id !== jobId));
      toast.success('Job removed from saved');
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error('Failed to remove job');
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote'
    };
    return labels[type] || type;
  };

  if (loading) return <div className="loading">Loading saved jobs...</div>;

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-header">
        <h1>Saved Jobs</h1>
        <p>You have {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📌</div>
          <h2>No saved jobs yet</h2>
          <p>Save jobs you're interested in to review them later</p>
          <Link to="/jobs" className="browse-jobs-btn">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {savedJobs.map(job => (
            <div key={job._id} className="saved-job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <button 
                  onClick={() => handleRemove(job._id)}
                  className="remove-btn"
                  title="Remove from saved"
                >
                  ✕
                </button>
              </div>

              <div className="company-info">
                <h4>{job.company?.name}</h4>
              </div>

              <div className="job-location">
                <span>📍 {job.location?.city}</span>
                {job.location?.remote && <span className="remote-badge">Remote</span>}
              </div>

              <div className="job-salary">
                {job.salary?.min && job.salary?.max ? (
                  <span>
                    💰 {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                  </span>
                ) : job.salary?.min ? (
                  <span>💰 From {job.salary.min.toLocaleString()} {job.salary.currency}</span>
                ) : (
                  <span>💰 Salary not specified</span>
                )}
              </div>

              <div className="job-meta">
                <span className="job-type">{getEmploymentTypeLabel(job.employmentType)}</span>
                <span className="posted-date">
                  📅 {new Date(job.postedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="job-actions">
                <Link to={`/jobs/${job._id}`} className="view-job-btn">
                  View Job
                </Link>
                <Link to={`/jobs/${job._id}`} className="apply-now-btn">
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;