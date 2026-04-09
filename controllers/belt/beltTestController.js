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
    console.log('📦 Request body:', req.body);
    console.log('📎 Request file:', req.file);
    
    const { studentName, studentId, currentBelt, testingFor, testDate, readiness, notes, certificateCode } = req.body;

    // Log file upload details
    if (req.file) {
      console.log('✅ File uploaded successfully:');
      console.log('  - Original name:', req.file.originalname);
      console.log('  - Saved as:', req.file.filename);
      console.log('  - Path:', req.file.path);
      console.log('  - Size:', req.file.size, 'bytes');
    } else {
      console.log('⚠️ No file uploaded');
    }

    // Determine certificate file path
    let certificateFilePath = null;
    if (req.file) {
      console.log('📎 File object details:', {
        path: req.file.path,
        filename: req.file.filename,
        fieldname: req.file.fieldname,
        mimetype: req.file.mimetype
      });
      certificateFilePath = `uploads/belt-exams/${req.file.filename}`;
      console.log('📁 Certificate uploaded locally:', certificateFilePath);
    }

    const test = new BeltTest({
      studentName,
      studentId,
      currentBelt,
      testingFor,
      testDate,
      readiness: readiness || 0,
      notes,
      certificateCode,
      certificateFile: certificateFilePath,
      createdBy: req.user?.id
    });

    await test.save();

    const populatedTest = await BeltTest.findById(test._id)
      .populate('createdBy', 'name email');

    console.log(`✅ Created belt test for: ${test.studentName}`);
    if (test.certificateFile) {
      console.log(`📄 Certificate file: ${test.certificateFile}`);
    }

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
    console.log('📦 Request body:', req.body);
    console.log('📎 Request file:', req.file);
    
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
    
    if (req.file) {
      console.log('✅ New file uploaded:');
      console.log('  - Original name:', req.file.originalname);
      console.log('  - Saved as:', req.file.filename);
      console.log('  - Path:', req.file.path);
      console.log('  - Size:', req.file.size, 'bytes');
      
      // Determine certificate file path
      test.certificateFile = `uploads/belt-exams/${req.file.filename}`;
      console.log('📁 Certificate uploaded locally:', test.certificateFile);
    } else {
      console.log('⚠️ No new file uploaded');
    }

    await test.save();

    console.log(`✅ Updated belt test for: ${test.studentName}`);
    if (test.certificateFile) {
      console.log(`📄 Certificate file: ${test.certificateFile}`);
    }

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

    console.log(`📥 Certificate file path: ${test.certificateFile}`);

    // Local file
    const path = require('path');
    const fs = require('fs');
    
    // Remove leading slash if present
    let cleanPath = test.certificateFile.startsWith('/') 
      ? test.certificateFile.substring(1) 
      : test.certificateFile;
    
    const filePath = path.join(__dirname, '../..', cleanPath);
    console.log(`📁 Checking local file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return res.status(404).json({
        status: 'error',
        message: 'Certificate file not found. Please ask the administrator to re-upload the certificate.',
        filePath: test.certificateFile
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
    
    // FORCE DOWNLOAD - Set headers to force download instead of opening
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    console.log(`✅ Forcing download with filename: ${fileName}`);
    
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
    
    fileStream.on('end', () => {
      console.log('✅ Certificate download completed');
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
