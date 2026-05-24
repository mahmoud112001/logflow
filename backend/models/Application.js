const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => /^\S+$/.test(value),
        message: 'Application name must not contain whitespace',
      },
    },
    // Reference to the Developer who owns this application
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Developer',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
