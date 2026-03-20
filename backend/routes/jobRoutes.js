const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

// ===== PUBLIC ROUTES =====

// GET all active jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      employmentType, 
      experienceLevel,
      location,
      minSalary,
      maxSalary,
      search,
      recruiter,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { status: 'active' };
    
    // Filter by recruiter if specified (for dashboard)
    if (recruiter && recruiter !== 'undefined' && recruiter !== 'null') {
      query.postedBy = recruiter;
      // Don't filter by status for recruiter's own jobs
      delete query.status;
    }
    
    // Apply filters - only if they have valid values
    if (category && category !== 'undefined' && category !== 'null') {
      query.category = category;
    }
    
    if (employmentType && employmentType !== 'undefined' && employmentType !== 'null') {
      query.employmentType = employmentType;
    }
    
    if (experienceLevel && experienceLevel !== 'undefined' && experienceLevel !== 'null') {
      query.experienceLevel = experienceLevel;
    }
    
    if (location && location !== 'undefined' && location !== 'null') {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    // Salary range filter - only if values are valid
    if ((minSalary && minSalary !== 'undefined' && minSalary !== 'null') || 
        (maxSalary && maxSalary !== 'undefined' && maxSalary !== 'null')) {
      
      query.salary = {};
      
      if (minSalary && minSalary !== 'undefined' && minSalary !== 'null') {
        query.salary.min = { $gte: parseInt(minSalary) };
      }
      
      if (maxSalary && maxSalary !== 'undefined' && maxSalary !== 'null') {
        query.salary.max = { $lte: parseInt(maxSalary) };
      }
    }
    
    // Text search - only if search has value
    if (search && search !== 'undefined' && search !== 'null') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Job query:', JSON.stringify(query, null, 2));
    
    const jobs = await Job.find(query)
      .populate('postedBy', 'name companyName companyLogo')
      .sort({ postedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalJobs: total
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name companyName companyLogo companyDescription companyWebsite');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Increment view count
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET jobs by recruiter
router.get('/recruiter/:recruiterId', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      postedBy: req.params.recruiterId,
      status: { $ne: 'expired' }
    }).sort({ postedAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== PROTECTED ROUTES =====

// POST create new job (recruiters only)
router.post('/', auth, allowRoles('recruiter', 'admin'), async (req, res) => {
  try {
    // Get recruiter's company info from their profile
    const recruiter = await User.findById(req.user.userId);
    
    // Prepare company data
    const companyData = {
      name: req.body.company?.name || recruiter.companyName,
      logo: req.body.company?.logo || recruiter.companyLogo,
      website: req.body.company?.website || recruiter.companyWebsite,
      description: req.body.company?.description || recruiter.companyDescription
    };
    
    const jobData = {
      ...req.body,
      company: companyData,
      postedBy: req.user.userId
    };
    
    const job = new Job(jobData);
    await job.save();
    
    // ✅ FIX: Update category job count
    try {
      await Category.findByIdAndUpdate(
        job.category,
        { $inc: { jobCount: 1 } }
      );
      console.log('✅ Category jobCount updated for job creation');
    } catch (categoryError) {
      console.log('⚠️ Category count update failed:', categoryError.message);
    }
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update job (recruiters can only update their own jobs)
router.put('/:id', auth, allowRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user owns this job or is admin
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own jobs' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE job (soft delete - set status to closed)
router.delete('/:id', auth, allowRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user owns this job or is admin
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own jobs' });
    }
    
    // Store category ID before updating
    const categoryId = job.category;
    
    job.status = 'closed';
    await job.save();
    
    // ✅ FIX: Decrement category count when job is closed
    try {
      await Category.findByIdAndUpdate(
        categoryId,
        { $inc: { jobCount: -1 } }
      );
      console.log('✅ Category jobCount decremented for job closure');
    } catch (categoryError) {
      console.log('⚠️ Category count update failed:', categoryError.message);
    }
    
    res.json({ message: 'Job closed successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;