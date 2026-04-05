const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Planning', 'In Progress', 'Testing', 'Completed', 'Halted'],
    default: 'Planning'
  },
  progressPercentage: { type: Number, default: 0 },
  projectManager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links to your Employee/User model
    required: true 
  },
  timeline: {
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true }
  },
  guidelines: { type: String },
  documents: [{
    fileName: String,
    fileUrl: String, // URL from S3/Cloudinary
    uploadedAt: { type: Date, default: Date.now }
  }],
  sitePhotos: [{
    photoUrl: String,
    caption: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);