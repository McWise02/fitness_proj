const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    // Store a hash, not raw passwords
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ['user', 'trainer', 'admin'],
      default: 'user',
      index: true,
    },

    // Optional profile fields
    avatarUrl: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },

    // Simple location info for search/filter
    city: { type: String, trim: true, index: true },
    country: { type: String, trim: true, index: true },

    // Fitness preferences
    goals: [{ type: String, trim: true }],
    preferredWorkoutTimes: [{ type: String, enum: ['morning', 'afternoon', 'evening'] }],
  },
  { timestamps: true }
);

UserSchema.index({ firstName: 'text', lastName: 'text', city: 'text', country: 'text' });

module.exports = mongoose.model('User', UserSchema);
