const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Send certificate notification email
   * @param {Object} certificate - Certificate object
   * @param {Object} student - Student object
   * @returns {Promise<void>}
   */
  async sendCertificateNotification(certificate, student) {
    try {
      const emailContent = this.generateCertificateEmailContent(certificate, student);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `🏆 Congratulations! Your ${this.formatAchievementType(certificate.achievementType)} Certificate`,
        html: emailContent,
        attachments: [
          {
            filename: `certificate_${certificate.verificationCode}.pdf`,
            path: certificate.filePath
          }
        ]
      };

      // Also send to parent if parent email exists
      if (student.emergencyContact && student.emergencyContact.email) {
        mailOptions.cc = student.emergencyContact.email;
      }

      await this.transporter.sendMail(mailOptions);
      
      // Log successful email delivery
      console.log(`Certificate email sent successfully to ${student.email} for certificate ${certificate.verificationCode}`);
      
    } catch (error) {
      console.error('Failed to send certificate email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email content for certificate notification
   * @param {Object} certificate - Certificate object
   * @param {Object} student - Student object
   * @returns {string} HTML email content
   */
  generateCertificateEmailContent(certificate, student) {
    const achievementTitle = this.formatAchievementType(certificate.achievementType);
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificate.verificationCode}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .achievement-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .verification-box { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Congratulations, ${student.fullName}!</h1>
            <p>You've earned a new certificate from Combat Warrior Taekwon-Do Institute</p>
          </div>
          
          <div class="content">
            <div class="achievement-box">
              <h2>${achievementTitle}</h2>
              <p><strong>Achievement:</strong> ${certificate.achievementDetails.title}</p>
              <p><strong>Description:</strong> ${certificate.achievementDetails.description}</p>
              ${certificate.achievementDetails.level ? `<p><strong>Level:</strong> ${certificate.achievementDetails.level}</p>` : ''}
              ${certificate.achievementDetails.grade ? `<p><strong>Grade:</strong> ${certificate.achievementDetails.grade}</p>` : ''}
              <p><strong>Date Issued:</strong> ${new Date(certificate.issuedDate).toLocaleDateString()}</p>
            </div>

            <div class="verification-box">
              <h3>Certificate Verification</h3>
              <p>Your certificate verification code is:</p>
              <h2 style="color: #667eea; font-family: monospace;">${certificate.verificationCode}</h2>
              <p>Anyone can verify this certificate at:</p>
              <a href="${verificationUrl}" class="btn">Verify Certificate</a>
            </div>

            <p>Your certificate is attached to this email. You can also download it anytime from your student portal.</p>
            
            <p>This achievement represents your dedication and hard work in martial arts. Keep up the excellent progress!</p>

            <div class="footer">
              <p><strong>Combat Warrior Taekwon-Do Institute</strong></p>
              <p>Building Champions Through Discipline and Excellence</p>
              <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format achievement type for display
   * @param {string} achievementType - Achievement type
   * @returns {string} Formatted achievement type
   */
  formatAchievementType(achievementType) {
    const typeMap = {
      'belt_promotion': 'Belt Promotion',
      'course_completion': 'Course Completion',
      'special_achievement': 'Special Achievement'
    };
    return typeMap[achievementType] || achievementType;
  }

  /**
   * Send email delivery retry
   * @param {Object} certificate - Certificate object
   * @param {Object} student - Student object
   * @param {number} retryCount - Current retry count
   * @returns {Promise<void>}
   */
  async retryCertificateEmail(certificate, student, retryCount = 1) {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff

    if (retryCount > maxRetries) {
      throw new Error(`Failed to send certificate email after ${maxRetries} retries`);
    }

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      await this.sendCertificateNotification(certificate, student);
    } catch (error) {
      console.error(`Email retry ${retryCount} failed:`, error);
      return await this.retryCertificateEmail(certificate, student, retryCount + 1);
    }
  }

  /**
   * Send achievement notification
   * @param {Object} achievement - Achievement object
   * @param {Object} student - Student object
   * @returns {Promise<void>}
   */
  async sendAchievementNotification(achievement, student) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `🎉 New Achievement Unlocked: ${achievement.title}`,
        html: this.generateAchievementEmailContent(achievement, student)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Achievement email sent successfully to ${student.email} for achievement ${achievement.title}`);
      
    } catch (error) {
      console.error('Failed to send achievement email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email content for achievement notification
   * @param {Object} achievement - Achievement object
   * @param {Object} student - Student object
   * @returns {string} HTML email content
   */
  generateAchievementEmailContent(achievement, student) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .achievement-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
          .points-badge { background: #f5576c; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Achievement Unlocked!</h1>
            <p>Congratulations, ${student.fullName}!</p>
          </div>
          
          <div class="content">
            <div class="achievement-box">
              <h2>${achievement.title}</h2>
              <p>${achievement.description}</p>
              <p><strong>Category:</strong> ${achievement.category.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Date Achieved:</strong> ${new Date(achievement.dateAchieved).toLocaleDateString()}</p>
              <p><strong>Points Earned:</strong> <span class="points-badge">${achievement.points} pts</span></p>
            </div>

            <p>Keep up the excellent work! Every achievement brings you closer to mastering the art of Taekwon-Do.</p>
            
            <p>View all your achievements in your student portal.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = NotificationService;