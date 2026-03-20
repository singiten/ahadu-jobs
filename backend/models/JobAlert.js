const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Alert name is required']
  },
  criteria: {
    keywords: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    location: String,
    employmentType: [String],
    experienceLevel: [String],
    salaryMin: Number,
    salaryMax: Number
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'instant'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSent: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobAlert', jobAlertSchema);