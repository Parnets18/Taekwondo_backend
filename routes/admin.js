const express = require('express');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');

const router = express.Router();

// Health check route (no auth required)
router.get('/health', (req, res) => {
  console.log('🏥 Health endpoint called - no auth required');
  res.json({ status: 'success', message: 'Admin routes working' });
});

// Dashboard route (with auth)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const mockStats = {
      admissions: { total: 45, pending: 8, approved: 32, thisMonth: 12 },
      students: { total: 156, active: 142, newThisMonth: 18 },
      contacts: { total: 89, new: 5, thisMonth: 23 },
      courses: { total: 4 },
      beltDistribution: [
        { _id: 'white', count: 45 },
        { _id: 'yellow', count: 38 },
        { _id: 'green', count: 32 },
        { _id: 'blue', count: 25 },
        { _id: 'black-1st', count: 16 }
      ],
      admissionTrends: [
        { _id: { year: 2024, month: 8 }, count: 8 },
        { _id: { year: 2024, month: 9 }, count: 12 },
        { _id: { year: 2024, month: 10 }, count: 15 },
        { _id: { year: 2024, month: 11 }, count: 18 },
        { _id: { year: 2024, month: 12 }, count: 22 },
        { _id: { year: 2025, month: 1 }, count: 12 }
      ]
    };

    res.status(200).json({
      status: 'success',
      data: mockStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
});

// Admissions route (with auth)
router.get('/admissions', protect, async (req, res) => {
  try {
    const mockAdmissions = [
      {
        id: 'mock-1',
        fullName: 'Vikram Reddy',
        email: 'vikram.reddy@email.com',
        phone: '+91 9876543214',
        dateOfBirth: '2008-03-15',
        gender: 'male',
        courseLevel: 'intermediate',
        preferredSchedule: 'evening',
        status: 'pending',
        submittedAt: '2025-01-15T10:30:00Z'
      },
      {
        id: 'mock-2',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 9876543216',
        dateOfBirth: '2010-07-22',
        gender: 'female',
        courseLevel: 'beginner',
        preferredSchedule: 'morning',
        status: 'approved',
        submittedAt: '2025-01-10T14:20:00Z',
        studentId: 'CW20250001'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        admissions: mockAdmissions,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockAdmissions.length,
          itemsPerPage: 10
        }
      }
    });
  } catch (error) {
    console.error('Admissions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admissions'
    });
  }
});

module.exports = router;