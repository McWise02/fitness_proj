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

async function getAll({ page = 1, limit = 100 } = {}) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Machine.find({})
      .select('name brand type primaryMuscleGroups isPlateLoaded maintenanceIntervalDays modelNumber notes createdAt updatedAt')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Machine.countDocuments({})
  ]);

  return { items, total };
}


module.exports = { create, getById, update, remove, list, getAll };
