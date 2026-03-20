const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    remote: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      default: ''
    }
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    required: [true, 'Employment type is required']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    required: [true, 'Experience level is required']
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD'],
      default: 'ETB'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
 savedJobs: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Job'
}],
category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  required: [true, 'Job category is required']
},
  tags: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'closed'],
    default: 'active'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
});

// ✅ PRE-SAVE HOOK COMMENTED OUT FOR TESTING
/*
jobSchema.pre('save', function(next) {
  try {
    // Check if job is expired
    if (this.expiresAt && this.expiresAt < new Date()) {
      this.status = 'expired';
    }
    next();
  } catch (error) {
    next(error);
  }
});
*/
// SIMPLE PRE-SAVE HOOK - JUST FOR TESTING
/*
jobSchema.pre('save', function(next) {
  console.log('🔥 Saving job:', this.title);
  next();
});
*/

module.exports = mongoose.model('Job', jobSchema);