const mongoose = require('mongoose');
const gymDb = require('../database/gymDb');


const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

exports.createGym = async (req, res) => {
  try {
    const payload = req.body;
 
    if (!payload?.name) {
      return res.status(400).json({ message: 'name is required' });
    }
    const gym = await gymDb.create(payload);
    res.status(201).json({ message: 'Gym created', gym });
  } catch (err) {
    res.status(500).json({ message: 'Error creating gym', error: err.message });
  }
};

exports.getGymById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const gym = await gymDb.getById(id);
    if (!gym) return res.status(404).json({ message: 'Gym not found' });

    res.status(200).json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gym', error: err.message });
  }
};

exports.getAllGyms = async (_req, res) => {
  try {
    const gyms = await gymDb.getAll();
    return res.status(200).json(gyms); // [] is fine
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching gym', error: err.message });
  }
};

exports.updateGym = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const updates = req.body || {};
    const updated = await gymDb.update(id, updates);
    if (!updated) return res.status(404).json({ message: 'Gym not found' });

    res.status(200).json({ message: 'Gym updated', gym: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating gym', error: err.message });
  }
};

exports.deleteGym = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const deleted = await gymDb.remove(id);
    if (!deleted) return res.status(404).json({ message: 'Gym not found' });

    res.status(200).json({ message: 'Gym deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting gym', error: err.message });
  }
};

exports.getGymsByMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { city, country } = req.query;

    if (!isObjectId(machineId)) {
      return res.status(400).json({ message: 'Invalid machineId' });
    }

    const gyms = await gymDb.findByMachine(machineId, { city, country });
    res.status(200).json(gyms);
  } catch (err) {
    res.status(500).json({ message: 'Error searching gyms by machine', error: err.message });
  }

  exports.linkMachineToGym = async (req, res) => {
  try {
    const { gymId, machineId } = req.body || {};


    // Ensure the machine exists (optional but recommended)
    const machineExists = await Machine.exists({ _id: machineId });
    if (!machineExists) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const updatedGym = await gymDb.addMachineToGym(gymId, machineId);
    if (!updatedGym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    return res.status(200).json({
      message: 'Machine linked to gym',
      gym: updatedGym
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error linking machine to gym', error: err.message });
  }
};
};
