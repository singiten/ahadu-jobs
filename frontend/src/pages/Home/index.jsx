import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, getCategories } from '../../services/api';
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, categoriesRes] = await Promise.all([
        getJobs({ limit: 6 }),
        getCategories()
      ]);
      setFeaturedJobs(jobsRes.data.jobs || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search params
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    navigate(`/jobs?${params.toString()}`);
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full-Time',
      'part-time': 'Part-Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote'
    };
    return labels[type] || type;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home">
      {/* Hero Section with Animations */}
      <section className="hero">
        <div className="hero-icon-1">💼</div>
        <div className="hero-icon-2">📄</div>
        <div className="hero-icon-3">🔍</div>
        <div className="hero-icon-3" style={{ left: '80%', top: '60%', fontSize: '3.5rem' }}>📊</div>
        
        <div className="hero-content">
          <h1>Find Your Dream Job in Ethiopia</h1>
          <p>Discover thousands of opportunities across all industries</p>
          
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
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location"
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">Search Jobs</button>
          </form>
          
          <button 
            type="button" 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters ▲' : 'Advanced Search ▼'}
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Popular Categories</h2>
        <div className="categories-grid">
          {categories.slice(0, 8).map(category => (
            <Link 
              to={`/jobs?category=${category._id}`} 
              key={category._id} 
              className="category-card"
            >
              <h3>{category.name}</h3>
              <p>{category.jobCount || 0} jobs</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-section">
        <h2>Featured Jobs</h2>
        <div className="jobs-grid">
          {featuredJobs.map(job => (
            <Link to={`/jobs/${job._id}`} key={job._id} className="job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className={`job-type ${job.employmentType?.toLowerCase()}`}>
                  {getEmploymentTypeLabel(job.employmentType)}
                </span>
              </div>
              
              <div className="job-company">
                <h4>{job.company?.name}</h4>
              </div>
              
              <div className="job-location">
                <span>📍 {job.location?.city || 'Location not specified'}</span>
                {job.location?.remote && <span className="remote-badge">Remote</span>}
              </div>
              
              <div className="job-salary">
                {job.salary?.min && job.salary?.max ? (
                  <span>
                    {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                  </span>
                ) : job.salary?.min ? (
                  <span>From {job.salary.min.toLocaleString()} {job.salary.currency}</span>
                ) : (
                  <span>Salary not specified</span>
                )}
              </div>
              
              <div className="job-footer">
                <span>📅 {new Date(job.postedAt).toLocaleDateString()}</span>
                <span className="view-job">View Job →</span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="view-all">
          <Link to="/jobs" className="btn-secondary">View All Jobs</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;