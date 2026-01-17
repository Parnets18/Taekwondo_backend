const CertificateTemplate = require('../models/CertificateTemplate');
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

class TemplateService {
  constructor() {
    this.defaultTemplates = {
      belt_promotion: this.getDefaultBeltTemplate(),
      course_completion: this.getDefaultCourseTemplate(),
      special_achievement: this.getDefaultSpecialTemplate()
    };
  }

  /**
   * Create a new certificate template
   * @param {Object} templateData - Template data
   * @returns {Promise<string>} Template ID
   */
  async createTemplate(templateData) {
    try {
      const template = new CertificateTemplate(templateData);
      await template.save();
      return template._id.toString();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update an existing template
   * @param {string} templateId - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise<void>}
   */
  async updateTemplate(templateId, templateData) {
    try {
      const template = await CertificateTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      Object.keys(templateData).forEach(key => {
        if (templateData[key] !== undefined) {
          template[key] = templateData[key];
        }
      });

      await template.save();
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template
   */
  async getTemplate(templateId) {
    try {
      const template = await CertificateTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Generate preview of template with sample data
   * @param {string} templateId - Template ID
   * @param {Object} sampleData - Sample data for preview
   * @returns {Promise<Buffer>} PDF buffer
   */
  async previewTemplate(templateId, sampleData = null) {
    try {
      const template = await this.getTemplate(templateId);
      
      const defaultSampleData = {
        student: {
          fullName: 'John Doe',
          studentId: 'CW2024001'
        },
        achievement: {
          title: 'Sample Achievement',
          description: 'This is a sample achievement for preview purposes',
          level: 'Yellow Belt',
          grade: 'A+'
        },
        verificationCode: 'SAMPLE123456789',
        issuedDate: new Date()
      };

      const data = sampleData || defaultSampleData;
      return await this.renderCertificate(templateId, data);
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  }

  /**
   * Render certificate from template
   * @param {string} templateId - Template ID
   * @param {Object} data - Certificate data
   * @returns {Promise<Buffer>} PDF buffer
   */
  async renderCertificate(templateId, data) {
    try {
      const template = await this.getTemplate(templateId);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: [template.styling.dimensions.width, template.styling.dimensions.height],
        margins: template.styling.margins || { top: 50, left: 50, bottom: 50, right: 50 }
      });

      // Set background color
      if (template.styling.backgroundColor && template.styling.backgroundColor !== '#ffffff') {
        doc.rect(0, 0, template.styling.dimensions.width, template.styling.dimensions.height)
           .fill(template.styling.backgroundColor);
      }

      // Add background image if specified
      if (template.styling.backgroundImage) {
        try {
          doc.image(template.styling.backgroundImage, 0, 0, {
            width: template.styling.dimensions.width,
            height: template.styling.dimensions.height
          });
        } catch (imgError) {
          console.warn('Background image not found:', template.styling.backgroundImage);
        }
      }

      // Render template fields
      for (const field of template.fields) {
        await this.renderField(doc, field, data);
      }

      // Finalize PDF
      doc.end();

      // Convert to buffer
      return new Promise((resolve, reject) => {
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
      });
    } catch (error) {
      console.error('Error rendering certificate:', error);
      throw error;
    }
  }

  /**
   * Render individual field on PDF
   * @param {PDFDocument} doc - PDF document
   * @param {Object} field - Field configuration
   * @param {Object} data - Certificate data
   */
  async renderField(doc, field, data) {
    try {
      const value = this.getFieldValue(field, data);
      if (!value) return;

      // Set position
      const x = field.position.x;
      const y = field.position.y;

      // Apply styling
      if (field.style.fontSize) {
        doc.fontSize(field.style.fontSize);
      }
      if (field.style.fontFamily) {
        try {
          doc.font(field.style.fontFamily);
        } catch (fontError) {
          console.warn('Font not found, using default:', field.style.fontFamily);
          doc.font('Helvetica');
        }
      }

      switch (field.type) {
        case 'text':
          doc.fillColor(field.style.color || '#000000')
             .text(value, x, y, {
               width: field.size.width,
               height: field.size.height,
               align: field.style.textAlign || 'left'
             });
          break;

        case 'date':
          const dateValue = new Date(value).toLocaleDateString();
          doc.fillColor(field.style.color || '#000000')
             .text(dateValue, x, y, {
               width: field.size.width,
               height: field.size.height,
               align: field.style.textAlign || 'left'
             });
          break;

        case 'image':
          if (typeof value === 'string' && value.startsWith('http')) {
            // Handle URL images (would need additional implementation)
            console.warn('URL images not yet supported:', value);
          } else if (typeof value === 'string') {
            try {
              doc.image(value, x, y, {
                width: field.size.width,
                height: field.size.height
              });
            } catch (imgError) {
              console.warn('Image not found:', value);
            }
          }
          break;

        case 'signature':
          // For now, render as text. In production, this would handle signature images
          doc.fillColor(field.style.color || '#000000')
             .text(value, x, y, {
               width: field.size.width,
               height: field.size.height,
               align: field.style.textAlign || 'center'
             });
          break;
      }
    } catch (error) {
      console.error('Error rendering field:', field.name, error);
    }
  }

  /**
   * Get field value from data
   * @param {Object} field - Field configuration
   * @param {Object} data - Certificate data
   * @returns {string} Field value
   */
  getFieldValue(field, data) {
    // Map common field names to data paths
    const fieldMappings = {
      'studentName': data.student?.fullName,
      'student_name': data.student?.fullName,
      'achievementTitle': data.achievement?.title,
      'achievement_title': data.achievement?.title,
      'achievementDescription': data.achievement?.description,
      'achievement_description': data.achievement?.description,
      'level': data.achievement?.level,
      'belt_level': data.achievement?.level,
      'grade': data.achievement?.grade,
      'examiner': data.achievement?.examiner,
      'verificationCode': data.verificationCode,
      'verification_code': data.verificationCode,
      'issuedDate': data.issuedDate,
      'issued_date': data.issuedDate,
      'date': data.issuedDate,
      'institute_name': 'Combat Warrior Taekwon-Do Institute',
      'instituteName': 'Combat Warrior Taekwon-Do Institute'
    };

    // Try mapped value first
    if (fieldMappings[field.name]) {
      return fieldMappings[field.name];
    }

    // Try direct field name
    if (data[field.name]) {
      return data[field.name];
    }

    // Try nested paths
    const pathParts = field.name.split('.');
    let value = data;
    for (const part of pathParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        value = null;
        break;
      }
    }

    if (value) {
      return value;
    }

    // Return default value if specified
    return field.defaultValue || '';
  }

  /**
   * Get default belt promotion template
   */
  getDefaultBeltTemplate() {
    return {
      name: 'Default Belt Promotion Certificate',
      type: 'belt_promotion',
      description: 'Standard template for belt promotion certificates',
      styling: {
        dimensions: { width: 800, height: 600 },
        backgroundColor: '#ffffff',
        margins: { top: 50, left: 50, bottom: 50, right: 50 }
      },
      fields: [
        {
          name: 'institute_name',
          type: 'text',
          position: { x: 400, y: 50 },
          size: { width: 400, height: 40 },
          style: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'certificate_title',
          type: 'text',
          position: { x: 400, y: 120 },
          size: { width: 400, height: 30 },
          style: { fontSize: 20, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true,
          defaultValue: 'Certificate of Belt Promotion'
        },
        {
          name: 'studentName',
          type: 'text',
          position: { x: 400, y: 200 },
          size: { width: 400, height: 30 },
          style: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'belt_level',
          type: 'text',
          position: { x: 400, y: 280 },
          size: { width: 400, height: 30 },
          style: { fontSize: 16, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'issuedDate',
          type: 'date',
          position: { x: 400, y: 400 },
          size: { width: 200, height: 20 },
          style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'verificationCode',
          type: 'text',
          position: { x: 50, y: 550 },
          size: { width: 300, height: 20 },
          style: { fontSize: 10, fontFamily: 'Helvetica', color: '#666666', textAlign: 'left' },
          required: true
        }
      ]
    };
  }

  /**
   * Get default course completion template
   */
  getDefaultCourseTemplate() {
    return {
      name: 'Default Course Completion Certificate',
      type: 'course_completion',
      description: 'Standard template for course completion certificates',
      styling: {
        dimensions: { width: 800, height: 600 },
        backgroundColor: '#ffffff',
        margins: { top: 50, left: 50, bottom: 50, right: 50 }
      },
      fields: [
        {
          name: 'institute_name',
          type: 'text',
          position: { x: 400, y: 50 },
          size: { width: 400, height: 40 },
          style: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'certificate_title',
          type: 'text',
          position: { x: 400, y: 120 },
          size: { width: 400, height: 30 },
          style: { fontSize: 20, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true,
          defaultValue: 'Certificate of Course Completion'
        },
        {
          name: 'studentName',
          type: 'text',
          position: { x: 400, y: 200 },
          size: { width: 400, height: 30 },
          style: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'achievementTitle',
          type: 'text',
          position: { x: 400, y: 280 },
          size: { width: 400, height: 30 },
          style: { fontSize: 16, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'grade',
          type: 'text',
          position: { x: 400, y: 320 },
          size: { width: 200, height: 20 },
          style: { fontSize: 14, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: false
        },
        {
          name: 'issuedDate',
          type: 'date',
          position: { x: 400, y: 400 },
          size: { width: 200, height: 20 },
          style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'verificationCode',
          type: 'text',
          position: { x: 50, y: 550 },
          size: { width: 300, height: 20 },
          style: { fontSize: 10, fontFamily: 'Helvetica', color: '#666666', textAlign: 'left' },
          required: true
        }
      ]
    };
  }

  /**
   * Get default special achievement template
   */
  getDefaultSpecialTemplate() {
    return {
      name: 'Default Special Achievement Certificate',
      type: 'special_achievement',
      description: 'Standard template for special achievement certificates',
      styling: {
        dimensions: { width: 800, height: 600 },
        backgroundColor: '#ffffff',
        margins: { top: 50, left: 50, bottom: 50, right: 50 }
      },
      fields: [
        {
          name: 'institute_name',
          type: 'text',
          position: { x: 400, y: 50 },
          size: { width: 400, height: 40 },
          style: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'certificate_title',
          type: 'text',
          position: { x: 400, y: 120 },
          size: { width: 400, height: 30 },
          style: { fontSize: 20, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true,
          defaultValue: 'Certificate of Special Achievement'
        },
        {
          name: 'studentName',
          type: 'text',
          position: { x: 400, y: 200 },
          size: { width: 400, height: 30 },
          style: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'achievementTitle',
          type: 'text',
          position: { x: 400, y: 280 },
          size: { width: 400, height: 30 },
          style: { fontSize: 16, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'achievementDescription',
          type: 'text',
          position: { x: 400, y: 320 },
          size: { width: 500, height: 40 },
          style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'issuedDate',
          type: 'date',
          position: { x: 400, y: 400 },
          size: { width: 200, height: 20 },
          style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000', textAlign: 'center' },
          required: true
        },
        {
          name: 'verificationCode',
          type: 'text',
          position: { x: 50, y: 550 },
          size: { width: 300, height: 20 },
          style: { fontSize: 10, fontFamily: 'Helvetica', color: '#666666', textAlign: 'left' },
          required: true
        }
      ]
    };
  }

  /**
   * Initialize default templates in database
   */
  async initializeDefaultTemplates() {
    try {
      for (const [type, templateData] of Object.entries(this.defaultTemplates)) {
        const existingTemplate = await CertificateTemplate.findOne({ 
          name: templateData.name,
          type: type 
        });

        if (!existingTemplate) {
          const template = new CertificateTemplate({
            ...templateData,
            version: '1.0.0',
            createdBy: null, // System created
            isActive: true
          });
          await template.save();
          console.log(`Created default template: ${templateData.name}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  }
}

module.exports = TemplateService;