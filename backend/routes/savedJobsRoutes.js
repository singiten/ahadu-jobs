const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

// Save a job
router.post('/:jobId', auth, allowRoles('seeker'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Check if job exists
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if already saved
    if (user.savedJobs && user.savedJobs.includes(req.params.jobId)) {
      return res.status(400).json({ error: 'Job already saved' });
    }
    
    // Initialize savedJobs array if it doesn't exist
    if (!user.savedJobs) {
      user.savedJobs = [];
    }
    
    user.savedJobs.push(req.params.jobId);
    await user.save();
    
    res.json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove saved job
router.delete('/:jobId', auth, allowRoles('seeker'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.savedJobs) {
      user.savedJobs = [];
    }
    
    user.savedJobs = user.savedJobs.filter(
      id => id.toString() !== req.params.jobId
    );
    
    await user.save();
    res.json({ message: 'Job removed from saved' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all saved jobs
router.get('/', auth, allowRoles('seeker'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'savedJobs',
        populate: { path: 'postedBy', select: 'companyName' }
      });
    
    res.json(user.savedJobs || []);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if a job is saved
router.get('/check/:jobId', auth, allowRoles('seeker'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const isSaved = user.savedJobs && user.savedJobs.includes(req.params.jobId);
    res.json({ isSaved: !!isSaved });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;