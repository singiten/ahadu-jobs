import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/api';
import { toast } from 'react-toastify';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
    companyName: '',
    companyDescription: '',
    companyWebsite: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Add company fields if recruiter
      if (formData.role === 'recruiter') {
        userData.companyName = formData.companyName;
        userData.companyDescription = formData.companyDescription;
        userData.companyWebsite = formData.companyWebsite;
      }

      const response = await register(userData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Registration successful!');
      
      // ✅ AUTO-REDIRECT TO HOME PAGE (not dashboard)
      navigate('/');
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>አሐዱ ሥራ</h2>
          <p>Ahadu Jobs</p>
          <h3>Create an Account</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selector">
            <label className={`role-option ${formData.role === 'seeker' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="seeker"
                checked={formData.role === 'seeker'}
                onChange={handleChange}
              />
              <span>Job Seeker</span>
            </label>
            <label className={`role-option ${formData.role === 'recruiter' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={formData.role === 'recruiter'}
                onChange={handleChange}
              />
              <span>Recruiter</span>
            </label>
          </div>

          {/* Common Fields */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {/* Recruiter Fields */}
          {formData.role === 'recruiter' && (
            <div className="recruiter-fields">
              <h4>Company Information</h4>
              
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={formData.role === 'recruiter'}
                  placeholder="Your company name"
                />
              </div>

              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  placeholder="Tell us about your company"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Company Website</label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;