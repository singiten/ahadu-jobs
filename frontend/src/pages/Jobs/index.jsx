import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs, getCategories } from '../../services/api';
import { toast } from 'react-toastify';
import './Jobs.css';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    employmentType: searchParams.get('type') || '',
    experienceLevel: searchParams.get('level') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, [currentPage, filters.category, filters.employmentType, filters.experienceLevel]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.location) params.set('location', filters.location);
    if (filters.employmentType) params.set('type', filters.employmentType);
    if (filters.experienceLevel) params.set('level', filters.experienceLevel);
    if (filters.minSalary) params.set('minSalary', filters.minSalary);
    if (filters.maxSalary) params.set('maxSalary', filters.maxSalary);
    setSearchParams(params);
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Build params object - only include defined values
      const params = {
        page: currentPage,
        limit: 12
      };
      
      // Only add filters if they have values
      if (filters.category) params.category = filters.category;
      if (filters.employmentType) params.employmentType = filters.employmentType;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.minSalary) params.minSalary = filters.minSalary;
      if (filters.maxSalary) params.maxSalary = filters.maxSalary;
      
      console.log('Fetching jobs with params:', params);
      const response = await getJobs(params);
      console.log('Jobs response:', response.data);
      
      setJobs(response.data.jobs);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(error.response?.data?.error || 'Failed to load jobs');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      minSalary: '',
      maxSalary: ''
    });
    setCurrentPage(1);
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

  if (loading) return <div className="loading">Loading jobs...</div>;

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>Find Your Dream Job</h1>
        <p>Browse through thousands of job opportunities</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Job title, keywords, or company"
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </div>
        <button 
          type="button" 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}
        </button>
      </form>

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City or remote"
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Employment Type</label>
              <select
                name="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Experience Level</label>
              <select
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Salary (Birr)</label>
              <input
                type="number"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                placeholder="e.g., 30000"
              />
            </div>

            <div className="filter-group">
              <label>Max Salary (Birr)</label>
              <input
                type="number"
                name="maxSalary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                placeholder="e.g., 80000"
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="results-count">
        <p>{jobs.length} jobs found</p>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="no-results">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <Link to={`/jobs/${job._id}`} key={job._id} className="job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className={`job-type ${job.employmentType}`}>
                  {getEmploymentTypeLabel(job.employmentType)}
                </span>
              </div>
              
              <div className="job-company">
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
                {job.salary?.isNegotiable && <span className="negotiable"> (Negotiable)</span>}
              </div>
              
              <div className="job-meta">
                <span>📅 Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                <span>⚡ {job.experienceLevel && getExperienceLevelLabel(job.experienceLevel)}</span>
              </div>
              
              <div className="job-footer">
                <span className="view-job">View Job →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;