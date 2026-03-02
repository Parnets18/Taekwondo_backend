const BeltTest = require('../../models/BeltTest');

// Get all belt tests
const getBeltTests = async (req, res) => {
  try {
    console.log('📋 Fetching belt tests...');
    const { page = 1, limit = 10, status, studentName, upcoming } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (studentName) {
      filter.studentName = { $regex: studentName, $options: 'i' };
    }
    if (upcoming === 'true') {
      filter.testDate = { $gte: new Date() };
      filter.status = 'scheduled';
    }

    const skip = (page - 1) * limit;

    const tests = await BeltTest.find(filter)
      .sort({ testDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await BeltTest.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Found ${tests.length} belt tests`);

    res.json({
      status: 'success',
      data: {
        tests,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching belt tests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt tests',
      error: error.message
    });
  }
};

// Get belt test by ID
const getBeltTestById = async (req, res) => {
  try {
    console.log(`📋 Fetching belt test: ${req.params.id}`);
    const test = await BeltTest.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt test not found'
      });
    }

    console.log(`✅ Found belt test for: ${test.studentName}`);

    res.json({
      status: 'success',
      data: { test }
    });
  } catch (error) {
    console.error('❌ Error fetching belt test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt test',
      error: error.message
    });
  }
};

// Create belt test
const createBeltTest = async (req, res) => {
  try {
    console.log('➕ Creating new belt test...');
    const { studentName, studentId, currentBelt, testingFor, testDate, readiness, notes, certificateCode } = req.body;

    const test = new BeltTest({
      studentName,
      studentId,
      currentBelt,
      testingFor,
      testDate,
      readiness: readiness || 0,
      notes,
      certificateCode,
      certificateFile: req.file ? `/uploads/belt-exams/${req.file.filename}` : null,
      createdBy: req.user?.id
    });

    await test.save();

    const populatedTest = await BeltTest.findById(test._id)
      .populate('createdBy', 'name email');

    console.log(`✅ Created belt test for: ${test.studentName}`);

    res.status(201).json({
      status: 'success',
      message: 'Belt test scheduled successfully',
      data: { test: populatedTest }
    });
  } catch (error) {
    console.error('❌ Error creating belt test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to schedule belt test',
      error: error.message
    });
  }
};

// Update belt test
const updateBeltTest = async (req, res) => {
  try {
    console.log(`✏️ Updating belt test: ${req.params.id}`);
    const { studentName, currentBelt, testingFor, testDate, readiness, status, testResult, notes, certificateCode } = req.body;

    const test = await BeltTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt test not found'
      });
    }

    // Update fields
    if (studentName !== undefined) test.studentName = studentName;
    if (currentBelt !== undefined) test.currentBelt = currentBelt;
    if (testingFor !== undefined) test.testingFor = testingFor;
    if (testDate !== undefined) test.testDate = testDate;
    if (readiness !== undefined) test.readiness = readiness;
    if (status !== undefined) test.status = status;
    if (testResult !== undefined) test.testResult = testResult;
    if (notes !== undefined) test.notes = notes;
    if (certificateCode !== undefined) test.certificateCode = certificateCode;
    if (req.file) test.certificateFile = `/uploads/belt-exams/${req.file.filename}`;

    await test.save();

    console.log(`✅ Updated belt test for: ${test.studentName}`);

    res.json({
      status: 'success',
      message: 'Belt test updated successfully',
      data: { test }
    });
  } catch (error) {
    console.error('❌ Error updating belt test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update belt test',
      error: error.message
    });
  }
};

// Delete belt test
const deleteBeltTest = async (req, res) => {
  try {
    console.log(`🗑️ Deleting belt test: ${req.params.id}`);
    const test = await BeltTest.findByIdAndDelete(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt test not found'
      });
    }

    console.log(`✅ Deleted belt test for: ${test.studentName}`);

    res.json({
      status: 'success',
      message: 'Belt test deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting belt test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete belt test',
      error: error.message
    });
  }
};

// Get belt test statistics
const getBeltTestStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching belt test statistics...');
    
    const upcomingTests = await BeltTest.countDocuments({
      testDate: { $gte: new Date() },
      status: 'scheduled'
    });

    const totalTests = await BeltTest.countDocuments();
    const completedTests = await BeltTest.countDocuments({ status: 'completed' });
    const passedTests = await BeltTest.countDocuments({ status: 'passed' });

    console.log('✅ Belt test statistics fetched successfully');

    res.json({
      status: 'success',
      data: {
        upcomingTests,
        totalTests,
        completedTests,
        passedTests
      }
    });
  } catch (error) {
    console.error('❌ Error fetching belt test statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt test statistics',
      error: error.message
    });
  }
};

// Download certificate
const downloadCertificate = async (req, res) => {
  try {
    console.log(`📥 Downloading certificate for test: ${req.params.id}`);
    const test = await BeltTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt test not found'
      });
    }

    if (!test.certificateFile) {
      return res.status(404).json({
        status: 'error',
        message: 'No certificate file found for this test'
      });
    }

    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../..', test.certificateFile);
    
    console.log(`📥 Sending file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate file not found on server'
      });
    }
    
    // Get the actual file extension
    const ext = path.extname(test.certificateFile);
    const fileName = `certificate_${test.studentName.replace(/\s+/g, '_')}_${test.certificateCode || test._id}${ext}`;
    
    // Set appropriate content type based on file extension
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    }
    
    // Set headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('❌ Error streaming certificate:', err);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to download certificate',
          error: err.message
        });
      }
    });
  } catch (error) {
    console.error('❌ Error downloading certificate:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to download certificate',
        error: error.message
      });
    }
  }
};

module.exports = {
  getBeltTests,
  getBeltTestById,
  createBeltTest,
  updateBeltTest,
  deleteBeltTest,
  getBeltTestStatistics,
  downloadCertificate
};
