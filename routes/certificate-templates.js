const express = require('express');
const router = express.Router();
const CertificateTemplate = require('../models/CertificateTemplate');
const TemplateService = require('../services/TemplateService');
const { protect, adminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const templateService = new TemplateService();

// Get all templates
router.get('/', protect, async (req, res) => {
  try {
    const templates = await CertificateTemplate.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new template (Admin only)
router.post('/', [
  adminOnly,
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').isIn(['belt_promotion', 'course_completion', 'special_achievement']).withMessage('Invalid template type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('styling.dimensions.width').isInt({ min: 100 }).withMessage('Width must be at least 100'),
  body('styling.dimensions.height').isInt({ min: 100 }).withMessage('Height must be at least 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const templateData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      styling: req.body.styling,
      fields: req.body.fields || [],
      createdBy: req.user.id,
      version: '1.0.0'
    };

    const templateId = await templateService.createTemplate(templateData);
    const template = await CertificateTemplate.findById(templateId).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create template' 
    });
  }
});

// Get template by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await templateService.getTemplate(req.params.id);
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(404).json({ message: 'Template not found' });
  }
});

// Update template (Admin only)
router.put('/:id', [
  adminOnly,
  body('name').optional().notEmpty().withMessage('Template name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('styling.dimensions.width').optional().isInt({ min: 100 }).withMessage('Width must be at least 100'),
  body('styling.dimensions.height').optional().isInt({ min: 100 }).withMessage('Height must be at least 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await templateService.updateTemplate(req.params.id, req.body);
    const template = await templateService.getTemplate(req.params.id);

    res.json({
      success: true,
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to update template' 
    });
  }
});

// Generate template preview
router.get('/:id/preview', protect, async (req, res) => {
  try {
    const pdfBuffer = await templateService.previewTemplate(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="template-preview.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ message: 'Failed to generate preview' });
  }
});

// Toggle template active status (Admin only)
router.put('/:id/toggle', adminOnly, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.json({
      success: true,
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      template
    });
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get templates by type
router.get('/type/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['belt_promotion', 'course_completion', 'special_achievement'].includes(type)) {
      return res.status(400).json({ message: 'Invalid template type' });
    }

    const templates = await CertificateTemplate.find({ 
      type: type,
      isActive: true 
    }).populate('createdBy', 'name email');

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete template (Admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if template is being used by any certificates
    const Certificate = require('../models/Certificate');
    const certificateCount = await Certificate.countDocuments({ templateId: req.params.id });
    
    if (certificateCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete template. It is being used by ${certificateCount} certificate(s).` 
      });
    }

    await CertificateTemplate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default templates (Admin only)
router.post('/initialize-defaults', adminOnly, async (req, res) => {
  try {
    await templateService.initializeDefaultTemplates();

    res.json({
      success: true,
      message: 'Default templates initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing default templates:', error);
    res.status(500).json({ message: 'Failed to initialize default templates' });
  }
});

module.exports = router;