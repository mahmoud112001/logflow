const mongoose = require('mongoose');
const { LOG_LEVELS } = require('../config/constants');

const logSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: LOG_LEVELS,
    },
    count: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Links this log to its parent application
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // First occurrence — never changes after creation
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    // Last occurrence — bumped manually on every count increment
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Compound unique index — enforces upsert identity at DB level
logSchema.index({ message: 1, level: 1, application: 1 }, { unique: true });

module.exports = mongoose.model('Log', logSchema);
