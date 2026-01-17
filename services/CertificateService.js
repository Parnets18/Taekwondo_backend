const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const Student = require('../models/Student');
const NotificationService = require('./NotificationService');
const TemplateService = require('./TemplateService');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class CertificateService {
  constructor() {
    this.notificationService = new NotificationService();
    this.templateService = new TemplateService();
  }

  /**
   * Generate a new certificate
   * @param {Object} request - Certificate generation request
   * @param {string} request.studentId - Student ID
   * @param {string} request.achievementType - Type of achievement
   * @param {Object} request.achievementDetails - Achievement details
   * @param {string} request.templateId - Template ID to use
   * @param {string} request.issuedBy - User ID of issuer
   * @returns {Promise<Object>} Generated certificate
   */
  async generateCertificate(request) {
    try {
      // Validate input
      if (!request.studentId || !request.achievementType || !request.templateId || !request.issuedBy) {
        throw new Error('Missing required fields for certificate generation');
      }

      // Get student information
      const student = await Student.findById(request.studentId).populate('userId');
      if (!student) {
        throw new Error('Student not found');
      }

      // Get template
      const template = await CertificateTemplate.findById(request.templateId);
      if (!template || !template.isActive) {
        throw new Error('Template not found or inactive');
      }

      // Validate achievement type matches template type
      if (template.type !== request.achievementType) {
        throw new Error('Achievement type does not match template type');
      }

      // Generate unique verification code
      const verificationCode = this.generateVerificationCode();

      // Prepare certificate data
      const certificateData = {
        studentId: request.studentId,
        studentName: student.fullName,
        achievementType: request.achievementType,
        achievementDetails: request.achievementDetails,
        templateId: request.templateId,
        issuedBy: request.issuedBy,
        verificationCode: verificationCode,
        metadata: {
          templateVersion: template.version,
          generationMethod: 'automated'
        }
      };

      // Generate certificate file
      const certificateFile = await this.templateService.renderCertificate(
        request.templateId, 
        {
          student: student,
          achievement: request.achievementDetails,
          verificationCode: verificationCode,
          issuedDate: new Date()
        }
      );

      // Save certificate file
      const fileName = `certificate_${verificationCode}.pdf`;
      const filePath = path.join('uploads', 'certificates', fileName);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, certificateFile);

      // Calculate file hash
      const fileHash = crypto.createHash('sha256').update(certificateFile).digest('hex');

      // Update certificate data with file information
      certificateData.filePath = filePath;
      certificateData.fileHash = fileHash;
      certificateData.metadata.fileSize = certificateFile.length;

      // Create certificate record
      const certificate = new Certificate(certificateData);
      await certificate.save();

      // Send notification email
      try {
        await this.notificationService.sendCertificateNotification(certificate, student);
        certificate.metadata.emailSent = true;
        await certificate.save();
      } catch (emailError) {
        console.error('Failed to send certificate email:', emailError);
        // Don't fail the entire operation if email fails
      }

      return certificate;
    } catch (error) {
      console.error('Certificate generation failed:', error);
      throw error;
    }
  }

  /**
   * Get certificate by ID
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Object>} Certificate
   */
  async getCertificate(certificateId) {
    const certificate = await Certificate.findById(certificateId)
      .populate('studentId')
      .populate('templateId')
      .populate('issuedBy', 'name email');
    
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return certificate;
  }

  /**
   * Get certificates by student ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} Array of certificates
   */
  async getCertificatesByStudent(studentId) {
    const certificates = await Certificate.find({ studentId })
      .populate('templateId')
      .populate('issuedBy', 'name email')
      .sort({ issuedDate: -1 });

    return certificates;
  }

  /**
   * Verify certificate by verification code
   * @param {string} verificationCode - Verification code
   * @returns {Promise<Object>} Verification result
   */
  async verifyCertificate(verificationCode) {
    try {
      const certificate = await Certificate.findOne({ 
        verificationCode: verificationCode.toUpperCase(),
        status: 'active'
      });

      if (!certificate) {
        return {
          isValid: false,
          error: 'Certificate not found or invalid verification code'
        };
      }

      // Return public certificate information (no sensitive data)
      return {
        isValid: true,
        certificate: {
          id: certificate._id,
          studentName: certificate.studentName,
          achievementType: certificate.achievementType,
          achievementDetails: certificate.achievementDetails,
          issuedDate: certificate.issuedDate,
          verificationCode: certificate.verificationCode,
          status: certificate.status,
          hasFile: !!certificate.filePath
        }
      };
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return {
        isValid: false,
        error: 'Verification service temporarily unavailable'
      };
    }
  }

  /**
   * Regenerate certificate (for updates or corrections)
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Object>} Updated certificate
   */
  async regenerateCertificate(certificateId) {
    const existingCertificate = await Certificate.findById(certificateId);
    if (!existingCertificate) {
      throw new Error('Certificate not found');
    }

    // Create new certificate with same data but new verification code
    const request = {
      studentId: existingCertificate.studentId,
      achievementType: existingCertificate.achievementType,
      achievementDetails: existingCertificate.achievementDetails,
      templateId: existingCertificate.templateId,
      issuedBy: existingCertificate.issuedBy
    };

    // Mark old certificate as revoked
    existingCertificate.status = 'revoked';
    await existingCertificate.save();

    // Generate new certificate
    return await this.generateCertificate(request);
  }

  /**
   * Generate cryptographically secure verification code
   * @returns {string} Verification code
   */
  generateVerificationCode() {
    // Generate a secure random verification code
    const randomBytes = crypto.randomBytes(16);
    return randomBytes.toString('hex').toUpperCase();
  }

  /**
   * Get certificate statistics
   * @returns {Promise<Object>} Certificate statistics
   */
  async getCertificateStats() {
    const stats = await Certificate.aggregate([
      {
        $group: {
          _id: '$achievementType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCertificates = await Certificate.countDocuments();
    const activeCertificates = await Certificate.countDocuments({ status: 'active' });
    const revokedCertificates = await Certificate.countDocuments({ status: 'revoked' });

    // Convert stats array to object for easier access
    const byType = {};
    stats.forEach(stat => {
      byType[stat._id] = stat.count;
    });

    return {
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      byType
    };
  }
}

module.exports = CertificateService;