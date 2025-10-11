const express = require('express');
const router = new express.Router();

const ensureAuthed = require('../utils/ensureAuthed');     // GitHub session present
const ensureAppUser = require('../utils/ensureAppUser');   // req.session.userId present

const trainerCtrl = require('../controllers/trainerController');
const validate = require('../utils/validate-request');
const { registerRules, updateRules, listByCityQuery } = require('../utils/trainerValidator');

// Register as a trainer (one profile per user)
router.post(
  '/register',
  ensureAuthed,
  ensureAppUser,
  registerRules,
  validate,
  trainerCtrl.registerAsTrainer
);

// Get all trainers in a city (?city=Frankfurt&country=Germany&minRating=4)
router.get(
  '/',
  ensureAuthed,
  listByCityQuery,
  validate,
  trainerCtrl.listByCity
);

// Get your own trainer profile
router.get(
  '/me',
  ensureAuthed,
  ensureAppUser,
  trainerCtrl.getMyTrainerProfile
);

// Update your own trainer profile
router.put(
  '/me',
  ensureAuthed,
  ensureAppUser,
  updateRules,
  validate,
  trainerCtrl.updateMyTrainerProfile
);

module.exports = router;
