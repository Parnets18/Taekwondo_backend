const mongoose = require('mongoose');

const beltSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  color: {
    type: String,
    required: true,
    enum: ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black']
  },
  hex: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  students: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
beltSchema.index({ level: 1 });
beltSchema.index({ color: 1 });
beltSchema.index({ isActive: 1 });

// Static method to get belt statistics
beltSchema.statics.getStatistics = async function() {
  const totalStudents = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$students' } } }
  ]);

  const blackBelts = await this.aggregate([
    { $match: { color: 'black', isActive: true } },
    { $group: { _id: null, total: { $sum: '$students' } } }
  ]);

  return {
    totalStudents: totalStudents[0]?.total || 0,
    blackBelts: blackBelts[0]?.total || 0,
    totalBeltLevels: await this.countDocuments({ isActive: true })
  };
};

module.exports = mongoose.model('Belt', beltSchema);
