const { checkSchema, param, query } = require('express-validator');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const isObjectId = (v) => objectIdRegex.test(String(v));

const MACHINE_TYPES = ['cardio','strength','mobility','functional','accessory'];
const MUSCLE_GROUPS = [
  'full_body','chest','back','shoulders','biceps','triceps',
  'core','glutes','quads','hamstrings','calves'
];

function makeAllOptional(schemaObj) {
  const clone = JSON.parse(JSON.stringify(schemaObj));
  for (const key of Object.keys(clone)) {
    delete clone[key].exists;
    clone[key].optional = true;
  }
  return clone;
}

const MACHINE_CREATE_SCHEMA = {
  name: {
    in: ['body'],
    exists: { errorMessage: 'name is required' },
    isString: { errorMessage: 'name must be a string' },
    trim: true,
    isLength: { options: { max: 100 }, errorMessage: 'name max length is 100' }
  },
  brand: { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 100 } } },
  type: {
    in: ['body'],
    exists: { errorMessage: 'type is required' },
    isIn: { options: [MACHINE_TYPES], errorMessage: 'invalid type' }
  },
  primaryMuscleGroups: { in: ['body'], optional: true, isArray: { errorMessage: 'primaryMuscleGroups must be an array' } },
  'primaryMuscleGroups.*': { in: ['body'], optional: true, isIn: { options: [MUSCLE_GROUPS], errorMessage: 'invalid muscle group' } },
  modelNumber: { in: ['body'], optional: true, isString: true, trim: true },
  isPlateLoaded: { in: ['body'], optional: true, isBoolean: true, toBoolean: true },
  maintenanceIntervalDays: { in: ['body'], optional: true, isInt: { options: { min: 0 } }, toInt: true },
  notes: { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 1000 } } }
};

const machineRulesCreate = checkSchema(MACHINE_CREATE_SCHEMA);
const machineRulesUpdate = checkSchema({
  id: { in: ['params'], custom: { options: isObjectId }, errorMessage: 'Invalid machine id' },
  ...makeAllOptional(MACHINE_CREATE_SCHEMA)
});

const machineListQuery = [
  query('name').optional().isString().trim(),
  query('type').optional().isIn(MACHINE_TYPES).withMessage('invalid type'),
  query('brand').optional().isString().trim(),
];

const machineIdParam = [ param('id').custom(isObjectId).withMessage('Invalid machine id') ];

module.exports = {
  machineRulesCreate,
  machineRulesUpdate,
  machineListQuery,
  machineIdParam,
};
