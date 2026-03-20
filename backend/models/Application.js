const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
  },
  resume: {
    type: String,  // URL to uploaded resume
    required: [true, 'Resume is required']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String,  // Private notes for recruiters
    trim: true
  },
  viewedByRecruiter: {
    type: Boolean,
    default: false
  },
  viewedAt: {
    type: Date
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  }
});

// Ensure one user can't apply twice to the same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);