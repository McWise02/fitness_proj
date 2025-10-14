const mongoose = require('mongoose');
const Gym = require('../models/Gym');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

async function create(data) {
  const gym = await Gym.create(data);
  return gym.toObject();
}

async function getById(id) {
  const gym = await Gym.findById(id)
    .populate({ path: 'machines.machine', select: 'name brand type' })
    .populate({ path: 'trainers', select: 'headline ratingAvg ratingCount user' })
    .lean();
  return gym;
}

async function getAll() {
  // Add .select(...) if you want to trim fields
  const gyms = await Gym.find().lean();
  return gyms; // [] when no gyms
}

async function update(id, updates) {
  const opts = { new: true, runValidators: true };
  const gym = await Gym.findByIdAndUpdate(id, updates, opts)
    .populate({ path: 'machines.machine', select: 'name brand type' })
    .populate({ path: 'trainers', select: 'headline ratingAvg ratingCount user' })
    .lean();
  return gym;
}

async function remove(id) {
  const result = await Gym.findByIdAndDelete(id).lean();
  return !!result;
}

/**
 * Find gyms that have a specific machine in their inventory.
 * Optional filters: { city, country }
 */
async function findByMachine(machineId, filters = {}) {
  const query = {
    'machines.machine': toObjectId(machineId),
  };

  if (filters.city) query.city = filters.city;
  if (filters.country) query.country = filters.country;

  return await Gym.find(query)
    .select('name city country ratingAvg ratingCount amenities machines')
    .populate({ path: 'machines.machine', select: 'name brand type' })
    .lean();
}

module.exports = { create, getById, update, remove, findByMachine, getAll };
