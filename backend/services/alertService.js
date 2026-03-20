const cron = require('node-cron');
const JobAlert = require('../models/JobAlert');
const Job = require('../models/Job');
const { sendEmail } = require('./emailService');

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🔍 Checking daily job alerts...');
  
  const alerts = await JobAlert.find({ 
    frequency: 'daily', 
    isActive: true 
  }).populate('user');
  
  for (const alert of alerts) {
    // Build query based on alert criteria
    const query = { status: 'active' };
    
    if (alert.criteria.keywords) {
      query.$or = [
        { title: { $regex: alert.criteria.keywords, $options: 'i' } },
        { description: { $regex: alert.criteria.keywords, $options: 'i' } }
      ];
    }
    
    if (alert.criteria.category) {
      query.category = alert.criteria.category;
    }
    
    if (alert.criteria.location) {
      query['location.city'] = { $regex: alert.criteria.location, $options: 'i' };
    }
    
    // Only get jobs posted since last alert
    if (alert.lastSent) {
      query.postedAt = { $gt: alert.lastSent };
    }
    
    const newJobs = await Job.find(query)
      .populate('company')
      .limit(10);
    
    if (newJobs.length > 0) {
      await sendEmail(
        alert.user.email,
        'newJobAlert',
        { jobs: newJobs }
      );
      
      alert.lastSent = new Date();
      await alert.save();
    }
  }
});

// Run every Monday at 9 AM for weekly alerts
cron.schedule('0 9 * * 1', async () => {
  // Similar logic for weekly alerts
});