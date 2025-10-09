const mongoose = require('mongoose');

const GymMachineSubSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    quantity: { type: Number, min: 0, default: 1 },
    lastServicedAt: { type: Date },
    areaNote: { type: String, trim: true, maxlength: 200 }, // e.g., "Strength zone 2"
  },
  { _id: false }
);

const OpeningHoursSubSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['mon','tue','wed','thu','fri','sat','sun'], required: true },
    open: { type: String, required: true },  
    close: { type: String, required: true },
  },
  { _id: false }
);

const GymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },


    street: { type: String, trim: true, maxlength: 120 },
    city: { type: String, trim: true, maxlength: 80, index: true },
    state: { type: String, trim: true, maxlength: 80 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, maxlength: 80, index: true },

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    amenities: [{
      type: String,
      enum: [
        'sauna', 'steam_room', 'pool', 'spa', 'showers', 'lockers', 'towels',
        'parking', 'childcare', 'cafe', 'wheelchair_access', 'wifi', 'classes',
        'climbing_wall', 'boxing_ring', 'basketball_court', 'open_24_7'
      ],
      index: true,
    }],

    openingHours: [OpeningHoursSubSchema],

    phone: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    website: { type: String, trim: true },
    priceTier: { type: String, enum: ['$', '$$', '$$$'], default: '$$' },

    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },

    machines: [GymMachineSubSchema],

    trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', index: true }],
  },
  { timestamps: true, collection: 'Gym' }
);

// Indexes
GymSchema.index({ location: '2dsphere' });
GymSchema.index({ name: 'text', city: 'text', country: 'text', amenities: 'text' });

module.exports = mongoose.model('Gym', GymSchema);
