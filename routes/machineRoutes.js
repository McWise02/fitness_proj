const express = require('express');
const router = new express.Router();
const machineController = require('../controllers/machineController');
const validate = require('../utils/validation');
const ensureAuthed = require('../utils/ensureAuthed'); 
const {
  machineRulesCreate,
  machineRulesUpdate,
  machineListQuery,
  machineIdParam
} = require('../utils/machineValidator');


router.post('/', ensureAuthed,  machineRulesCreate, validate, machineController.createMachine);
router.get('/:id',ensureAuthed ,  machineIdParam, validate, machineController.getMachineById);
router.put('/:id', ensureAuthed, machineRulesUpdate, validate, machineController.updateMachine);
router.delete('/:id', ensureAuthed, machineIdParam, validate, machineController.deleteMachine);


router.get('/', ensureAuthed, machineListQuery, validate, machineController.listMachines);

module.exports = router;
