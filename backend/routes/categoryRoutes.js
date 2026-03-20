const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

// ===== PUBLIC ROUTES =====

// GET all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN ONLY ROUTES =====

// POST create category (admin only)
router.post('/', auth, allowRoles('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const category = new Category({
      name,
      slug,
      description
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update category (admin only)
router.put('/:id', auth, allowRoles('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Remove icon if it exists (since we removed it from schema)
    delete updateData.icon;
    
    // If name is being updated, update slug too
    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE category (soft delete - admin only)
router.delete('/:id', auth, allowRoles('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating category:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;