const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['seeker', 'recruiter', 'admin'],
    default: 'seeker'
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  // For Job Seekers only
  resume: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  experience: [{
    title: String,
    company: String,
    from: Date,
    to: Date,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  // For Recruiters only
  companyName: {
    type: String,
    default: ''
  },
  companyLogo: {
    type: String,
    default: ''
  },
  companyWebsite: {
    type: String,
    default: ''
  },
  companyDescription: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);