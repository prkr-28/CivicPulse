const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },

  description: {
    type: String,
    required: [true, 'Description is required']
  },

  category: {
    type: String,
    enum: ['Potholes', 'Streetlights', 'Garbage', 'Water leakage', 'Broken footpath', 'Open manholes', 'Fallen trees', 'Other'],
    required: [true, 'Category is required']
  },

  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'rejected'],
    default: 'open'
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },

  imageUrls: {
    type: [String],
    default: []
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  upvotes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },

  priorityScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },

  priorityLevel: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },

  priorityReason: {
    type: String,
    default: 'Awaiting priority assessment'
  },

  priorityCalculatedAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

issueSchema.index({ location: '2dsphere' });

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
