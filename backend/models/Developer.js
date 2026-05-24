const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const developerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    // Auto-generated on first save, never overwritten
    apiKey: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Hash password if modified; generate apiKey only if absent
developerSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  if (!this.apiKey) {
    this.apiKey = uuidv4();
  }
});

// Compare a candidate password against the stored hash
developerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Developer', developerSchema);
