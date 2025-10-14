const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');

class ConflictError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ConflictError';
  }
}

/** Create one trainer profile per user (enforced by unique index on user) */
async function createForUser(userId, data) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user id');
  }
  const exists = await Trainer.findOne({ user: userId }).lean();
  if (exists) throw new ConflictError('User already has a trainer profile');

  const doc = await Trainer.create({
    user: userId,
    headline: data.headline,
    yearsExperience: data.yearsExperience,
    certifications: data.certifications,
    specialties: data.specialties,
    hourlyRate: data.hourlyRate,
    trainingModes: data.trainingModes,
    languages: data.languages,
    baseCity: data.baseCity,
    baseCountry: data.baseCountry,
    gymAffiliations: data.gymAffiliations,
    isVerified: false, // default; you can change via admin flow
  });

  return await Trainer.findById(doc._id)
    .populate({ path: 'user', select: 'firstName lastName city country avatarUrl' })
    .populate({ path: 'gymAffiliations', select: 'name city country ratingAvg' })
    .lean();
}

async function deleteById(id) {
  // Returns the deleted doc (or null if not found)
  return Trainer.findByIdAndDelete(id);
}

/** Get a trainer profile by the owning user id */
async function getByUserId(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  return await Trainer.findOne({ user: userId })
    .populate({ path: 'user', select: 'firstName lastName city country avatarUrl' })
    .populate({ path: 'gymAffiliations', select: 'name city country ratingAvg' })
    .lean();
}

/** Update the trainer profile for the owning user */
async function updateForUser(userId, updates) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const opts = { new: true, runValidators: true };
  return await Trainer.findOneAndUpdate({ user: userId }, updates, opts)
    .populate({ path: 'user', select: 'firstName lastName city country avatarUrl' })
    .populate({ path: 'gymAffiliations', select: 'name city country ratingAvg' })
    .lean();
}

/**
 * List trainers by city (optional: country, minRating, specialties[])
 * specialties is matched if any overlap (OR).
 */
async function listByCity({ city, country, minRating, specialties }) {
  const query = {};
  if (city) query.baseCity = city;
  if (country) query.baseCountry = country;
  if (typeof minRating === 'number') query.ratingAvg = { $gte: minRating };
  if (Array.isArray(specialties) && specialties.length) {
    query.specialties = { $in: specialties };
  }

  return await Trainer.find(query)
    .select('headline yearsExperience specialties hourlyRate trainingModes languages ratingAvg ratingCount baseCity baseCountry isVerified user gymAffiliations')
    .populate({ path: 'user', select: 'firstName lastName avatarUrl' })
    .populate({ path: 'gymAffiliations', select: 'name city country ratingAvg' })
    .sort({ ratingAvg: -1, ratingCount: -1, yearsExperience: -1 })
    .lean();
}

module.exports = {
  createForUser,
  deleteById,
  getByUserId,
  updateForUser,
  listByCity,
  ConflictError,
};
