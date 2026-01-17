const mongoose = require('mongoose');

const templateFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'date', 'image', 'signature']
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  size: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  style: {
    fontSize: Number,
    fontFamily: String,
    fontWeight: String,
    color: String,
    textAlign: String,
    backgroundColor: String,
    border: String
  },
  required: {
    type: Boolean,
    default: true
  },
  defaultValue: String
});

const certificateTemplateSchema = new mongoose.Schema({
  // Basic Information
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['belt_promotion', 'course_completion', 'special_achievement']
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  description: {
    type: String,
    required: true
  },
  
  // Template Files
  templateFile: {
    type: String,
    required: true // Path to the template file (PDF, HTML, etc.)
  },
  previewImage: {
    type: String,
    required: true // Path to preview image
  },
  
  // Template Configuration
  fields: [templateFieldSchema],
  styling: {
    backgroundColor: String,
    backgroundImage: String,
    dimensions: {
      width: {
        type: Number,
        required: true,
        default: 800
      },
      height: {
        type: Number,
        required: true,
        default: 600
      }
    },
    margins: {
      top: Number,
      right: Number,
      bottom: Number,
      left: Number
    }
  },
  
  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Version History
  versionHistory: [{
    version: String,
    changes: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt and add to version history before saving
certificateTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Add to version history if this is an update (not initial creation)
  if (!this.isNew && this.isModified()) {
    this.versionHistory.push({
      version: this.version,
      changes: 'Template updated',
      modifiedBy: this.createdBy, // This should be set by the calling code
      modifiedAt: new Date()
    });
  }
  
  next();
});

// Indexes
certificateTemplateSchema.index({ type: 1 });
certificateTemplateSchema.index({ isActive: 1 });
certificateTemplateSchema.index({ createdBy: 1 });

// Method to create new version
certificateTemplateSchema.methods.createNewVersion = function(changes, modifiedBy) {
  const versionParts = this.version.split('.');
  versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
  this.version = versionParts.join('.');
  
  this.versionHistory.push({
    version: this.version,
    changes: changes,
    modifiedBy: modifiedBy,
    modifiedAt: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);