const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const BeltTest = require('../models/BeltTest');
const path = require('path');
const fs = require('fs');

// Verify certificate by code
router.post('/verify', async (req, res) => {
  try {
    const { verificationCode } = req.body;
    
    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code is required'
      });
    }

    const code = verificationCode.trim().toUpperCase();
    console.log('🔍 Searching for certificate with code:', code);

    // Search in Certificate Management (main certificates table)
    const Certificate = require('../models/Certificate');
    const mainCertificate = await Certificate.findOne({
      verificationCode: { $regex: new RegExp(`^${code}$`, 'i') }
    });

    if (mainCertificate) {
      return res.json({
        status: 'success',
        data: {
          isValid: true,
          certificate: {
            id: mainCertificate._id,
            type: 'main_certificate',
            studentName: mainCertificate.studentName,
            achievementType: mainCertificate.achievementType,
            achievementDetails: mainCertificate.achievementDetails,
            issuedDate: mainCertificate.issuedDate,
            verificationCode: mainCertificate.verificationCode,
            status: mainCertificate.status || 'active',
            hasFile: !!mainCertificate.filePath,
            certificateFile: mainCertificate.filePath
          }
        }
      });
    }

    // Search in Student achievements (case-insensitive)
    const student = await Student.findOne({
      'achievements.typePrices.certificateCode': { $regex: new RegExp(`^${code}$`, 'i') }
    });

    if (student) {
      // Find the specific achievement with this certificate code
      let foundAchievement = null;
      let foundTypePriceIndex = -1;

      for (const achievement of student.achievements) {
        const index = achievement.typePrices.findIndex(tp => 
          tp.certificateCode && tp.certificateCode.toUpperCase() === code
        );
        if (index !== -1) {
          foundAchievement = achievement;
          foundTypePriceIndex = index;
          break;
        }
      }

      if (foundAchievement && foundTypePriceIndex !== -1) {
        const typePriceData = foundAchievement.typePrices[foundTypePriceIndex];
        
        return res.json({
          status: 'success',
          data: {
            isValid: true,
            certificate: {
              id: student._id,
              type: 'student_achievement',
              studentName: student.fullName,
              achievementType: 'special_achievement',
              achievementDetails: {
                title: typePriceData.type || 'Achievement',
                description: `Medal: ${typePriceData.price || 'N/A'}`,
                level: typePriceData.type,
                grade: typePriceData.price
              },
              issuedDate: foundAchievement.date || student.createdAt,
              verificationCode: typePriceData.certificateCode,
              status: 'active',
              hasFile: !!typePriceData.certificateFile,
              certificateFile: typePriceData.certificateFile,
              certificateIndex: foundTypePriceIndex,
              achievementId: foundAchievement._id
            }
          }
        });
      }
    }

    // Search in Belt Tests (case-insensitive)
    const beltTest = await BeltTest.findOne({ 
      certificateCode: { $regex: new RegExp(`^${code}$`, 'i') }
    });

    if (beltTest) {
      return res.json({
        status: 'success',
        data: {
          isValid: true,
          certificate: {
            id: beltTest._id,
            type: 'belt_test',
            studentName: beltTest.studentName,
            achievementType: 'belt_promotion',
            achievementDetails: {
              title: `Belt Test - ${beltTest.testingFor}`,
              description: `Promotion from ${beltTest.currentBelt} to ${beltTest.testingFor}`,
              level: beltTest.testingFor,
              examiner: 'Belt Test Examiner'
            },
            issuedDate: beltTest.testDate,
            verificationCode: beltTest.certificateCode,
            status: beltTest.status || 'active',
            hasFile: !!beltTest.certificateFile,
            certificateFile: beltTest.certificateFile
          }
        }
      });
    }

    // Certificate not found
    return res.json({
      status: 'success',
      data: {
        isValid: false,
        error: 'Certificate not found with the provided verification code'
      }
    });

  } catch (error) {
    console.error('❌ Error verifying certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
});

// Download certificate
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, achievementId, certificateIndex } = req.query;

    console.log('📥 Download request:', { id, type, achievementId, certificateIndex });

    let certificateFile = null;
    let studentName = '';
    let certificateCode = '';

    if (type === 'main_certificate') {
      const Certificate = require('../models/Certificate');
      const certificate = await Certificate.findById(id);
      if (!certificate) {
        return res.status(404).json({
          status: 'error',
          message: 'Certificate not found'
        });
      }

      if (!certificate.filePath) {
        return res.status(404).json({
          status: 'error',
          message: 'Certificate file not found'
        });
      }

      certificateFile = certificate.filePath;
      studentName = certificate.studentName;
      certificateCode = certificate.verificationCode;

    } else if (type === 'student_achievement') {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          status: 'error',
          message: 'Student not found'
        });
      }

      const achievement = student.achievements.id(achievementId);
      if (!achievement) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found'
        });
      }

      const typePriceData = achievement.typePrices[parseInt(certificateIndex)];
      if (!typePriceData || !typePriceData.certificateFile) {
        return res.status(404).json({
          status: 'error',
          message: 'Certificate file not found'
        });
      }

      certificateFile = typePriceData.certificateFile;
      studentName = student.fullName;
      certificateCode = typePriceData.certificateCode;

    } else if (type === 'belt_test') {
      const beltTest = await BeltTest.findById(id);
      if (!beltTest) {
        return res.status(404).json({
          status: 'error',
          message: 'Belt test not found'
        });
      }

      if (!beltTest.certificateFile) {
        return res.status(404).json({
          status: 'error',
          message: 'Certificate file not found'
        });
      }

      certificateFile = beltTest.certificateFile;
      studentName = beltTest.studentName;
      certificateCode = beltTest.certificateCode;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid certificate type'
      });
    }

    const filePath = path.join(__dirname, '..', certificateFile);
    
    console.log(`📥 Sending file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate file not found on server'
      });
    }
    
    // Get the actual file extension
    const ext = path.extname(certificateFile);
    const fileName = `certificate_${studentName.replace(/\s+/g, '_')}_${certificateCode || id}${ext}`;
    
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
});

// View certificate (for opening in browser)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, achievementId, certificateIndex } = req.query;

    let certificateFile = null;

    if (type === 'student_achievement') {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          status: 'error',
          message: 'Student not found'
        });
      }

      const achievement = student.achievements.id(achievementId);
      if (!achievement) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found'
        });
      }

      const typePriceData = achievement.typePrices[parseInt(certificateIndex)];
      if (!typePriceData || !typePriceData.certificateFile) {
        return res.status(404).json({
          status: 'error',
          message: 'Certificate file not found'
        });
      }

      certificateFile = typePriceData.certificateFile;

    } else if (type === 'belt_test') {
      const beltTest = await BeltTest.findById(id);
      if (!beltTest) {
        return res.status(404).json({
          status: 'error',
          message: 'Belt test not found'
        });
      }

      if (!beltTest.certificateFile) {
        return res.status(404).json({
          status: 'error',
          message: 'Certificate file not found'
        });
      }

      certificateFile = beltTest.certificateFile;
    }

    return res.json({
      status: 'success',
      data: {
        certificate: {
          imageUrl: certificateFile
        }
      }
    });

  } catch (error) {
    console.error('❌ Error viewing certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to view certificate',
      error: error.message
    });
  }
});

module.exports = router;
