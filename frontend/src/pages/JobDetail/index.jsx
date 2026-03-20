import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJob, applyToJob, saveJob, checkSavedStatus } from '../../services/api';
import { toast } from 'react-toastify';
import './JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJob();
    if (user) {
      checkSaved();
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const response = await getJob(id);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      setLoading(false);
    }
  };

  const checkSaved = async () => {
    try {
      const response = await checkSavedStatus(id);
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await saveJob(id);
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully');
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'seeker') {
      toast.error('Only job seekers can apply');
      return;
    }

    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }

    setApplying(true);

    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);

      await applyToJob(formData);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setCoverLetter('');
      setResume(null);
    } catch (error) {
      console.error('Error applying:', error);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
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

  const getExperienceLevelLabel = (level) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'lead': 'Lead',
      'executive': 'Executive'
    };
    return labels[level] || level;
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="error">Job not found</div>;

  return (
    <div className="job-detail-page">
      {/* Job Header */}
      <div className="job-header">
        <div className="job-header-content">
          <Link to="/jobs" className="back-link">← Back to Jobs</Link>
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="job-actions">
              <button 
                onClick={handleSaveJob}
                className={`save-btn ${isSaved ? 'saved' : ''}`}
              >
                {isSaved ? '★ Saved' : '☆ Save Job'}
              </button>
              {user?.role === 'seeker' && (
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="apply-btn"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
          
          <div className="job-meta-header">
            <span className="company-name">{job.company?.name}</span>
            <span className="job-type-badge">{getEmploymentTypeLabel(job.employmentType)}</span>
            <span className="experience-badge">{getExperienceLevelLabel(job.experienceLevel)}</span>
          </div>

          <div className="job-location-header">
            <span>📍 {job.location?.city}</span>
            {job.location?.remote && <span className="remote-tag">Remote</span>}
          </div>

          <div className="job-salary-header">
            {job.salary?.min && job.salary?.max ? (
              <span>
                💰 {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
              </span>
            ) : job.salary?.min ? (
              <span>💰 From {job.salary.min.toLocaleString()} {job.salary.currency}</span>
            ) : (
              <span>💰 Salary not specified</span>
            )}
            {job.salary?.isNegotiable && <span className="negotiable"> (Negotiable)</span>}
          </div>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-main">
          {/* Description */}
          <section className="job-section">
            <h2>Job Description</h2>
            <p className="job-description">{job.description}</p>
          </section>

          {/* Requirements */}
          <section className="job-section">
            <h2>Requirements</h2>
            <ul className="requirements-list">
              {job.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </section>

          {/* Responsibilities */}
          <section className="job-section">
            <h2>Responsibilities</h2>
            <ul className="responsibilities-list">
              {job.responsibilities?.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="job-sidebar">
          {/* Company Info */}
          <div className="company-card">
            <h3>About the Company</h3>
            <h4>{job.company?.name}</h4>
            {job.company?.description && (
              <p>{job.company.description}</p>
            )}
            {job.company?.website && (
              <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="company-website">
                Visit Website →
              </a>
            )}
          </div>

          {/* Job Overview */}
          <div className="overview-card">
            <h3>Job Overview</h3>
            <div className="overview-item">
              <span className="label">Posted Date</span>
              <span className="value">{new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
            <div className="overview-item">
              <span className="label">Applications</span>
              <span className="value">{job.applicationsCount || 0}</span>
            </div>
            <div className="overview-item">
              <span className="label">Views</span>
              <span className="value">{job.views || 0}</span>
            </div>
            {job.tags?.length > 0 && (
              <div className="tags-section">
                <span className="label">Tags</span>
                <div className="tags-list">
                  {job.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Apply for {job.title}</h2>
            <button className="modal-close" onClick={() => setShowApplyModal(false)}>×</button>
            
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows="5"
                  placeholder="Tell the employer why you're a good fit for this position..."
                />
              </div>

              <div className="form-group">
                <label>Resume *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                  required
                />
                <p className="help-text">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;