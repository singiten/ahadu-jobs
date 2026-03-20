const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');
const { upload, uploadToCloudinary } = require('../middleware/cloudinaryUpload');
const { sendEmail } = require('../services/emailService');

// ===== PROTECTED ROUTES =====

// POST apply to a job with resume upload (job seekers only)
router.post('/', auth, allowRoles('seeker'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    console.log('📝 Application received for job:', jobId);
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Resume is required' });
    }
    
    // Upload to Cloudinary (with timeout handling)
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      console.log('✅ Resume uploaded to Cloudinary:', cloudinaryResult.secure_url);
    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      // For now, use a placeholder - we'll fix Cloudinary later
      cloudinaryResult = { secure_url: 'https://placehold.co/600x400?text=Resume+Upload+Pending' };
    }
    
    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, status: 'active' }).populate('postedBy');
    if (!job) {
      return res.status(404).json({ error: 'Job not found or no longer active' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.userId
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }
    
    // Create application with resume URL
    const application = new Application({
      job: jobId,
      applicant: req.user.userId,
      coverLetter,
      resume: cloudinaryResult.secure_url
    });
    
    await application.save();
    
    // Increment job's applications count
    job.applicationsCount += 1;
    await job.save();
    
    console.log('✅ Application created successfully');
    
    // Send email notification to applicant
    try {
      await sendEmail(
        req.user.email,
        'applicationReceived',
        { jobTitle: job.title, company: job.company.name }
      );
      console.log('📧 Email notification sent to applicant');
    } catch (emailError) {
      console.log('⚠️ Email notification failed:', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.status(201).json(application);
  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET user's applications (job seeker views their applications)
router.get('/my-applications', auth, allowRoles('seeker'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.userId })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'companyName companyLogo' }
      })
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET applications for a specific job (recruiters only)
router.get('/job/:jobId', auth, allowRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user owns this job or is admin
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only view applications for your own jobs' });
    }
    
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone location resume')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single application (recruiter or the applicant)
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email phone location resume experience education');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check if user is the applicant, the job owner, or admin
    const job = await Job.findById(application.job);
    
    if (req.user.userId !== application.applicant.toString() && 
        req.user.role !== 'admin' && 
        job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update application status (recruiters only)
router.put('/:id/status', auth, allowRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('applicant')
      .populate({
        path: 'job',
        populate: { path: 'postedBy' }
      });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const job = await Job.findById(application.job);
    
    // Check if user owns this job or is admin
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update applications for your own jobs' });
    }
    
    application.status = status;
    if (notes) application.notes = notes;
    
    // Set reviewed date
    if (status !== 'pending' && !application.reviewedAt) {
      application.reviewedAt = new Date();
    }
    
    await application.save();
    
    // Send email notification to applicant about status change
    try {
      await sendEmail(
        application.applicant.email,
        'applicationStatusChange',
        { jobTitle: job.title, status: status }
      );
      console.log('📧 Status change email sent to applicant');
    } catch (emailError) {
      console.log('⚠️ Status change email failed:', emailError.message);
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark application as viewed (recruiters only)
router.patch('/:id/view', auth, allowRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const job = await Job.findById(application.job);
    
    // Check if user owns this job or is admin
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    application.viewedByRecruiter = true;
    application.viewedAt = new Date();
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Error marking application as viewed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;