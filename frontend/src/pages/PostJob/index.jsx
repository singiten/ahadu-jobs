import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCategories, createJob } from '../../services/api';
import { toast } from 'react-toastify';
import './PostJob.css';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: {
      city: '',
      remote: false,
      address: ''
    },
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: '',
      max: '',
      currency: 'ETB',
      isNegotiable: false
    },
    category: '',
    tags: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: updated
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const updated = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        [field]: updated
      }));
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty requirements/responsibilities
      const jobData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        salary: {
          ...formData.salary,
          min: formData.salary.min ? parseInt(formData.salary.min) : null,
          max: formData.salary.max ? parseInt(formData.salary.max) : null
        }
      };

      await createJob(jobData);
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error(error.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-card">
        <h1>Post a New Job</h1>
        <p>Fill in the details below to create a job listing</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Senior React Developer"
              />
            </div>

            <div className="form-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Describe the role, responsibilities, and ideal candidate..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Employment Type *</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience Level *</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="form-section">
            <h2>Requirements</h2>
            {formData.requirements.map((req, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  placeholder={`Requirement ${index + 1}`}
                />
                <div className="array-actions">
                  {formData.requirements.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      ✕
                    </button>
                  )}
                  {index === formData.requirements.length - 1 && (
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={() => addArrayItem('requirements')}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Responsibilities */}
          <div className="form-section">
            <h2>Responsibilities</h2>
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                  placeholder={`Responsibility ${index + 1}`}
                />
                <div className="array-actions">
                  {formData.responsibilities.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeArrayItem('responsibilities', index)}
                    >
                      ✕
                    </button>
                  )}
                  {index === formData.responsibilities.length - 1 && (
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={() => addArrayItem('responsibilities')}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="form-section">
            <h2>Location</h2>
            
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                required
                placeholder="e.g., Addis Ababa"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                placeholder="Street address (optional)"
              />
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="location.remote"
                  checked={formData.location.remote}
                  onChange={handleInputChange}
                />
                <span>Remote position</span>
              </label>
            </div>
          </div>

          {/* Salary */}
          <div className="form-section">
            <h2>Salary</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Minimum (Birr)</label>
                <input
                  type="number"
                  name="salary.min"
                  value={formData.salary.min}
                  onChange={handleInputChange}
                  placeholder="e.g., 30000"
                />
              </div>

              <div className="form-group">
                <label>Maximum (Birr)</label>
                <input
                  type="number"
                  name="salary.max"
                  value={formData.salary.max}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleInputChange}
                >
                  <option value="ETB">ETB</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="salary.isNegotiable"
                  checked={formData.salary.isNegotiable}
                  onChange={handleInputChange}
                />
                <span>Salary is negotiable</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <h2>Tags</h2>
            <div className="form-group">
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="react, node, javascript, ..."
              />
              <p className="help-text">Separate tags with commas</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;