import axios from 'axios';
export const saveJob = (jobId) => API.post(`/saved-jobs/${jobId}`);
export const checkSavedStatus = (jobId) => API.get(`/saved-jobs/check/${jobId}`);
export const getMyApplications = () => API.get('/applications/my-applications');
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`);
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (userData) => API.post('/auth/register', userData);
export const getJob = (id) => API.get(`/jobs/${id}`);
export const createJob = (jobData) => API.post('/jobs', jobData);
export const updateJob = (id, jobData) => API.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);// Add to your existing exports
export const getSavedJobs = () => API.get('/saved-jobs');
export const removeSavedJob = (jobId) => API.delete(`/saved-jobs/${jobId}`);
// Add to your existing exports
export const updateApplicationStatus = (applicationId, status) => 
  API.put(`/applications/${applicationId}/status`, { status });


const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs



// Job APIs
export const getJobs = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/jobs${queryString ? `?${queryString}` : ''}`);
};



// Category APIs
export const getCategories = () => API.get('/categories');

// Application APIs
export const applyToJob = (formData) => {
  return API.post('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};





export default API;