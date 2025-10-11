const mongoose = require('mongoose');
const machineDb = require('../database/machineDb');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

exports.createMachine = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.name || !payload.type) {
      return res.status(400).json({ message: 'name and type are required' });
    }
    const machine = await machineDb.create(payload);
    res.status(201).json({ message: 'Machine created', machine });
  } catch (err) {
    res.status(500).json({ message: 'Error creating machine', error: err.message });
  }
};

exports.getMachineById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const machine = await machineDb.getById(id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    res.status(200).json(machine);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching machine', error: err.message });
  }
};

exports.updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const updates = req.body || {};
    const updated = await machineDb.update(id, updates);
    if (!updated) return res.status(404).json({ message: 'Machine not found' });

    res.status(200).json({ message: 'Machine updated', machine: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating machine', error: err.message });
  }
};

exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const deleted = await machineDb.remove(id);
    if (!deleted) return res.status(404).json({ message: 'Machine not found' });

    res.status(200).json({ message: 'Machine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting machine', error: err.message });
  }
};

exports.listMachines = async (req, res) => {
  try {
    const { name, type, brand } = req.query;
    const items = await machineDb.list({ name, type, brand });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error listing machines', error: err.message });
  }
};

exports.getAllMachines = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '100', 10), 1);

    const { items, total } = await machineDb.getAll({ page, limit });

    res.status(200).json({
      total,
      page,
      pageSize: items.length,
      items
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching machines', error: err.message });
  }
};
