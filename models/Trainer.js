const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema(
  {
    // Link to the base user (must be unique: one trainer profile per user)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },

    // Required profile data for discoverability
    headline: { type: String, trim: true, maxlength: 120 }, // e.g., "Strength & Conditioning Coach"
    yearsExperience: { type: Number, min: 0, max: 60, default: 0 },
    certifications: [{ type: String, trim: true }],          // e.g., "NASM CPT", "CSCS"
    specialties: [{
      type: String,
      enum: [
        'strength', 'hypertrophy', 'weight_loss', 'powerlifting',
        'olympic_lifting', 'mobility', 'rehab', 'endurance',
        'functional', 'prenatal', 'senior_fitness', 'sports_performance'
      ],
      index: true,
    }],
    hourlyRate: { type: Number, min: 0 },                     // currency handled by UI or separate field
    trainingModes: [{ type: String, enum: ['in_person', 'online', 'hybrid'] }], // list of modes offered
    languages: [{ type: String, trim: true }],

    // Ratings for ranking/search
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },

    // Where they train (primary area)
    baseCity: { type: String, trim: true, index: true },
    baseCountry: { type: String, trim: true, index: true },

    // Which gyms they’re affiliated with
    gymAffiliations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym', index: true }],

    // Verification status
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index to improve trainer search
TrainerSchema.index({
  headline: 'text',
  baseCity: 'text',
  baseCountry: 'text',
  certifications: 'text',
});

module.exports = mongoose.model('Trainer', TrainerSchema);
