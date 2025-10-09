const Machine = require('../models/Machine');

async function create(data) {
  const machine = await Machine.create(data);
  return machine.toObject();
}

async function getById(id) {
  return await Machine.findById(id).lean();
}

async function update(id, updates) {
  const opts = { new: true, runValidators: true };
  return await Machine.findByIdAndUpdate(id, updates, opts).lean();
}

async function remove(id) {
  const result = await Machine.findByIdAndDelete(id).lean();
  return !!result;
}

async function list(filters = {}) {
  const query = {};
  if (filters.name) {
    // Text-ish search by name (case-insensitive)
    query.name = { $regex: filters.name, $options: 'i' };
  }
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.brand) {
    query.brand = { $regex: filters.brand, $options: 'i' };
  }

  return await Machine.find(query)
    .select('name brand type primaryMuscleGroups isPlateLoaded')
    .lean();
}

module.exports = { create, getById, update, remove, list };
