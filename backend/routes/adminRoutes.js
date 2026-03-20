const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

// Get platform statistics
router.get('/stats', auth, allowRoles('admin'), async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        seekers: await User.countDocuments({ role: 'seeker' }),
        recruiters: await User.countDocuments({ role: 'recruiter' }),
        newThisMonth: await User.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        })
      },
      jobs: {
        total: await Job.countDocuments(),
        active: await Job.countDocuments({ status: 'active' }),
        expired: await Job.countDocuments({ status: 'expired' }),
        byCategory: await Job.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
      },
      applications: {
        total: await Application.countDocuments(),
        pending: await Application.countDocuments({ status: 'pending' }),
        shortlisted: await Application.countDocuments({ status: 'shortlisted' }),
        hired: await Application.countDocuments({ status: 'hired' })
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', auth, allowRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', auth, allowRoles('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate user (admin only)
router.put('/users/:id/deactivate', auth, allowRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    // Also deactivate their jobs if recruiter
    if (user.role === 'recruiter') {
      await Job.updateMany(
        { postedBy: req.params.id },
        { status: 'closed' }
      );
    }
    
    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;