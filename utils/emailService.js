const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send admission confirmation email
const sendAdmissionConfirmation = async (admissionData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Combat Warrior Taekwon-do" <${process.env.EMAIL_USER}>`,
      to: admissionData.email,
      subject: 'Admission Application Received - Combat Warrior Taekwon-do',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Combat Warrior Taekwon-do</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Association of Karnataka</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Application Received Successfully!</h2>
            
            <p>Dear ${admissionData.fullName},</p>
            
            <p>Thank you for your interest in joining Combat Warrior Taekwon-do Academy. We have successfully received your admission application.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #1e293b;">Application Details:</h3>
              <p><strong>Name:</strong> ${admissionData.fullName}</p>
              <p><strong>Course Level:</strong> ${admissionData.courseLevel.charAt(0).toUpperCase() + admissionData.courseLevel.slice(1)}</p>
              <p><strong>Preferred Schedule:</strong> ${admissionData.preferredSchedule || 'Not specified'}</p>
              <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3 style="color: #1e293b;">What's Next?</h3>
            <ul style="color: #4b5563;">
              <li>Our admissions team will review your application within 24-48 hours</li>
              <li>We will contact you via phone or email to schedule an interview</li>
              <li>You may be invited for a trial class to assess your fitness level</li>
              <li>Upon approval, we'll guide you through the enrollment process</li>
            </ul>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Please keep your phone accessible as we may call you for additional information or to schedule your interview.</p>
            </div>
            
            <p>If you have any questions, feel free to contact us:</p>
            <p>📞 Phone: +91 9019157225<br>
            📧 Email: hello@parnetsgroup.com</p>
            
            <p>We look forward to welcoming you to our martial arts family!</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>Combat Warrior Taekwon-do Academy</strong><br>
              Karnataka, India
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2025 Combat Warrior Taekwon-do Association of Karnataka. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Admission confirmation email sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending admission confirmation email:', error);
    throw error;
  }
};

// Send contact form confirmation email
const sendContactConfirmation = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Combat Warrior Taekwon-do" <${process.env.EMAIL_USER}>`,
      to: contactData.email,
      subject: 'Message Received - Combat Warrior Taekwon-do',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Combat Warrior Taekwon-do</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Association of Karnataka</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Thank You for Contacting Us!</h2>
            
            <p>Dear ${contactData.name},</p>
            
            <p>We have received your message and appreciate your interest in Combat Warrior Taekwon-do Academy.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #1e293b;">Your Message:</h3>
              <p><strong>Inquiry Type:</strong> ${contactData.inquiryType.charAt(0).toUpperCase() + contactData.inquiryType.slice(1)}</p>
              <p><strong>Message:</strong> ${contactData.message}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Our team will review your inquiry and respond within 24 hours. For urgent matters, please call us directly at +91 9019157225.</p>
            
            <p>Thank you for your patience!</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>Combat Warrior Taekwon-do Academy</strong><br>
              Karnataka, India
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2025 Combat Warrior Taekwon-do Association of Karnataka. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Contact confirmation email sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending contact confirmation email:', error);
    throw error;
  }
};

// Send admin notification email
const sendAdminNotification = async (type, data) => {
  try {
    const transporter = createTransporter();
    
    let subject, content;
    
    if (type === 'admission') {
      subject = 'New Admission Application Received';
      content = `
        <h2>New Admission Application</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Course Level:</strong> ${data.courseLevel}</p>
        <p><strong>Age:</strong> ${data.age || 'Not calculated'}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        
        <p><a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/admissions" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Application</a></p>
      `;
    } else if (type === 'contact') {
      subject = 'New Contact Form Submission';
      content = `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Inquiry Type:</strong> ${data.inquiryType}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        
        <p><a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/contacts" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Message</a></p>
      `;
    }
    
    const mailOptions = {
      from: `"Combat Warrior System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'admin@combatwarrior.com',
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e293b; color: white; padding: 20px;">
            <h1 style="margin: 0;">Combat Warrior Admin Panel</h1>
          </div>
          <div style="padding: 20px; background: #f8fafc;">
            ${content}
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    // Don't throw error for admin notifications to avoid breaking user flow
  }
};

module.exports = {
  sendAdmissionConfirmation,
  sendContactConfirmation,
  sendAdminNotification
};