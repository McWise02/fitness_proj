const trainerDb = require('../database/trainerDb');


exports.registerAsTrainer = async (req, res) => {
  try {
    const userId = req.session.userId; 
    const payload = req.body || {};

    const trainer = await trainerDb.createForUser(userId, payload);
    res.status(201).json({ message: 'Registered as trainer', trainer });
  } catch (err) {
    const code = err.name === 'ConflictError' ? 409 : 500;
    res.status(code).json({ message: 'Failed to register as trainer', error: err.message });
  }
};

exports.deleteTrainerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid trainer id' });
    }

    const deleted = await trainerDb.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    return res.status(200).json({ message: 'Trainer deleted', id });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting trainer', error: err.message });
  }
};

exports.listByCity = async (req, res) => {
  try {
    const { city, country, minRating, specialties } = req.query;
    const specs = (specialties || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const list = await trainerDb.listByCity({
      city,
      country,
      minRating: minRating ? Number(minRating) : undefined,
      specialties: specs.length ? specs : undefined,
    });

    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trainers', error: err.message });
  }
};


exports.getMyTrainerProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const trainer = await trainerDb.getByUserId(userId);
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });
    res.status(200).json(trainer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trainer', error: err.message });
  }
};


exports.updateMyTrainerProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const updates = req.body || {};
    const updated = await trainerDb.updateForUser(userId, updates);
    if (!updated) return res.status(404).json({ message: 'Trainer profile not found' });
    res.status(200).json({ message: 'Trainer updated', trainer: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating trainer', error: err.message });
  }
};
