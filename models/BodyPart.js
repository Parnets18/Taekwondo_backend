const mongoose = require('mongoose');

const bodyPartSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  korean:      { type: String, default: '', trim: true },
  category:    { type: String, enum: ['attacking', 'blocking', 'vital', 'levels'], required: true },
  title:       { type: String, default: '', trim: true },
  subtitle:    { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  image:       { type: String, default: '' },
  images:      { type: [String], default: [] },
  // Blocking tools - legacy format (maintained for backward compatibility)
  directions:  { type: [String], default: [] },
  parts:       { type: mongoose.Schema.Types.Mixed, default: [] },
  // Blocking tools - new hierarchical format
  hierarchicalData: { type: mongoose.Schema.Types.Mixed, default: [] },
  // Vital points
  points:      { type: mongoose.Schema.Types.Mixed, default: [] },
  // Levels tab
  tab:         { type: String, default: '' },
  order:       { type: Number, default: 0, min: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for hierarchical data statistics
bodyPartSchema.virtual('hierarchicalStats').get(function() {
  if (this.category !== 'blocking' || !this.hierarchicalData || this.hierarchicalData.length === 0) {
    return null;
  }
  
  return {
    totalDirections: this.hierarchicalData.length,
    totalParts: this.hierarchicalData.reduce((sum, d) => sum + (d.parts ? d.parts.length : 0), 0),
    totalMethods: this.hierarchicalData.reduce((sum, d) => 
      sum + (d.parts ? d.parts.reduce((pSum, p) => pSum + (p.methods ? p.methods.length : 0), 0) : 0), 0),
    totalTools: this.hierarchicalData.reduce((sum, d) => 
      sum + (d.parts ? d.parts.reduce((pSum, p) => 
        pSum + (p.methods ? p.methods.reduce((mSum, m) => mSum + (m.tools ? m.tools.length : 0), 0) : 0), 0) : 0), 0)
  };
});

// Pre-save middleware to ensure data consistency
bodyPartSchema.pre('save', function(next) {
  // Ensure order is set
  if (this.order === undefined || this.order === null) {
    this.order = 0;
  }
  
  next();
});

module.exports = mongoose.model('BodyPart', bodyPartSchema);
