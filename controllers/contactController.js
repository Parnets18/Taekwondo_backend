const Contact = require('../models/Contact');
const { sendContactConfirmation, sendAdminNotification } = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const contactData = req.body;

    // Create contact message
    const contact = await Contact.create(contactData);

    // Send confirmation email to user
    try {
      await sendContactConfirmation(contactData);
    } catch (emailError) {
      console.error('Contact confirmation email failed:', emailError);
    }

    // Send notification to admin
    try {
      await sendAdminNotification('contact', contactData);
    } catch (emailError) {
      console.error('Admin notification failed:', emailError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully. We will get back to you within 24 hours.',
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          inquiryType: contact.inquiryType,
          status: contact.status,
          submittedAt: contact.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact/admin
// @access  Private (Admin)
const getAllContacts = async (req, res) => {
  try {
    // Check if database is available
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'disabled') {
      // Return empty data when database is disabled
      return res.status(200).json({
        status: 'success',
        data: {
          contacts: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const inquiryType = req.query.inquiryType;
    const priority = req.query.priority;
    const search = req.query.search;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (inquiryType && inquiryType !== 'all') filter.inquiryType = inquiryType;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name email')
      .populate('respondedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contacts'
    });
  }
};

// @desc    Get contact by ID (Admin)
// @route   GET /api/contact/admin/:id
// @access  Private (Admin)
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('respondedBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { contact }
    });

  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contact'
    });
  }
};

// @desc    Update contact status/response (Admin)
// @route   PUT /api/contact/admin/:id
// @access  Private (Admin)
const updateContact = async (req, res) => {
  try {
    const { status, priority, adminNotes, responseMessage, assignedTo } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo) updateData.assignedTo = assignedTo;
    
    if (responseMessage) {
      updateData.responseMessage = responseMessage;
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.user?.id; // Assuming auth middleware sets req.user
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('respondedBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact updated successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating contact'
    });
  }
};

// @desc    Delete contact (Admin)
// @route   DELETE /api/contact/admin/:id
// @access  Private (Admin)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting contact'
    });
  }
};

// @desc    Get contact statistics (Admin)
// @route   GET /api/contact/admin/stats
// @access  Private (Admin)
const getContactStats = async (req, res) => {
  try {
    // Check if database is available
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'disabled') {
      // Return mock stats when database is disabled
      return res.status(200).json({
        status: 'success',
        data: {
          totalContacts: 0,
          newContacts: 0,
          inProgressContacts: 0,
          resolvedContacts: 0,
          thisMonthContacts: 0,
          recentActivity: 0,
          inquiryTypeBreakdown: [],
          priorityBreakdown: []
        }
      });
    }

    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });

    // This month's contacts
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthContacts = await Contact.countDocuments({
      submittedAt: { $gte: thisMonth }
    });

    // Inquiry type breakdown
    const inquiryTypeStats = await Contact.aggregate([
      {
        $group: {
          _id: '$inquiryType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority breakdown
    const priorityStats = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentActivity = await Contact.countDocuments({
      submittedAt: { $gte: lastWeek }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalContacts,
        newContacts,
        inProgressContacts,
        resolvedContacts,
        thisMonthContacts,
        recentActivity,
        inquiryTypeBreakdown: inquiryTypeStats,
        priorityBreakdown: priorityStats
      }
    });

  } catch (error) {
    console.error('Contact stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contact statistics'
    });
  }
};

// @desc    Get contact message status (Public)
// @route   GET /api/contact/status/:email
// @access  Public
const getContactStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const contacts = await Contact.find({ email })
      .select('name email inquiryType status submittedAt respondedAt responseMessage')
      .sort({ submittedAt: -1 })
      .limit(5);

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No messages found for this email'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contacts: contacts.map(contact => ({
          id: contact._id,
          name: contact.name,
          email: contact.email,
          inquiryType: contact.inquiryType,
          status: contact.status,
          submittedAt: contact.submittedAt,
          respondedAt: contact.respondedAt,
          responseMessage: contact.responseMessage
        }))
      }
    });

  } catch (error) {
    console.error('Contact status check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking message status'
    });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats,
  getContactStatus
};