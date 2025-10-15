const mongoose = require('mongoose');
const Gym = require('../models/Gym');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

async function create(data) {
  const gym = await Gym.create(data);
  return gym.toObject();
}

async function addMachineToGym(gymId, machineId, { quantity = 1, lastServicedAt, areaNote } =  {}) {

  const setUpdates = {};
  if (lastServicedAt) setUpdates['machines.$.lastServicedAt'] = lastServicedAt;
  if (areaNote) setUpdates['machines.$.areaNote'] = areaNote;

  let updated = await Gym.findOneAndUpdate(
    { _id: gymId, 'machines.machine': machineId },
    {
      $inc: { 'machines.$.quantity': quantity },
      ...(Object.keys(setUpdates).length ? { $set: setUpdates } : {})
    },
    { new: true, runValidators: true }
  ).populate('machines.machine').lean();

  if (updated) return updated;

  updated = await Gym.findOneAndUpdate(
    { _id: gymId },
    {
      $push: {
        machines: {
          machine: machineId,
          quantity,
          ...(lastServicedAt ? { lastServicedAt } : {}),
          ...(areaNote ? { areaNote } : {})
        }
      }
    },
    { new: true, runValidators: true }
  ).populate('machines.machine').lean();

  return updated; 
}


async function getById(id) {
  const gym = await Gym.findById(id)
    .populate({ path: 'machines.machine', select: 'name brand type' })
    .populate({ path: 'trainers', select: 'headline ratingAvg ratingCount user' })
    .lean();
  return gym;
}

async function getAll() {
  const gyms = await Gym.find().lean();
  return gyms;
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

module.exports = { addMachineToGym, create, getById, update, remove, findByMachine, getAll };
