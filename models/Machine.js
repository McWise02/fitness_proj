const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 }, // e.g., "Lat Pulldown"
    brand: { type: String, trim: true, maxlength: 100 },                // e.g., "TechnoGym"
    type: {
      type: String,
      enum: ['cardio', 'strength', 'mobility', 'functional', 'accessory'],
      required: true,
      index: true,
    },
    primaryMuscleGroups: [{
      type: String,
      enum: [
        'full_body', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
        'core', 'glutes', 'quads', 'hamstrings', 'calves'
      ],
      index: true,
    }],
    modelNumber: { type: String, trim: true },
    isPlateLoaded: { type: Boolean, default: false },
    maintenanceIntervalDays: { type: Number, min: 0, default: 180 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true, collection: 'Machine' }
);

MachineSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Machine', MachineSchema);
