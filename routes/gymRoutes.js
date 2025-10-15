const express = require('express');
const router = new express.Router();
const gymController = require('../controllers/gymController');

const validate = require('../utils/validation');
const {
  gymRulesCreate,
  gymRulesUpdate,
  gymIdParam,
  gymByMachineQuery
} = require('../utils/gymValidator');

// Gyms
router.post('/', gymRulesCreate, validate, gymController.createGym);                       // Create
router.get('/:id', gymIdParam, validate, gymController.getGymById);                    // Read (single)
router.get('/',  validate, gymController.getAllGyms); 
router.put('/:id', gymRulesUpdate, validate, gymController.updateGym);                     // Update
router.delete('/:id', gymIdParam, validate, gymController.deleteGym);                  // Delete
router.post('/link-machine', ensureOAuth, gymController.linkMachineToGym);
// Search gyms that have a specific machine in inventory
router.get('/by-machine/:machineId', gymByMachineQuery, gymController.getGymsByMachine);

module.exports = router;
