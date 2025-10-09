const { checkSchema, param, query } = require('express-validator');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const isObjectId = (v) => objectIdRegex.test(String(v));

const AMENITIES = [
  'sauna','steam_room','pool','spa','showers','lockers','towels',
  'parking','childcare','cafe','wheelchair_access','wifi','classes',
  'climbing_wall','boxing_ring','basketball_court','open_24_7'
];
const WEEK_DAYS = ['mon','tue','wed','thu','fri','sat','sun'];

const isTime = (v) => typeof v === 'string' && /^\d{2}:\d{2}$/.test(v);
const isLngLat = (arr) =>
  Array.isArray(arr) && arr.length === 2 &&
  typeof arr[0] === 'number' && typeof arr[1] === 'number' &&
  arr[0] >= -180 && arr[0] <= 180 && arr[1] >= -90 && arr[1] <= 90;

/** Helper: make all fields optional & drop `exists` from a schema object */
function makeAllOptional(schemaObj) {
  const clone = JSON.parse(JSON.stringify(schemaObj));
  for (const key of Object.keys(clone)) {
    delete clone[key].exists;
    clone[key].optional = true;
  }
  return clone;
}

/** Base CREATE schema as a plain object */
const GYM_CREATE_SCHEMA = {
  name: {
    in: ['body'],
    exists: { errorMessage: 'name is required' },
    isString: { errorMessage: 'name must be a string' },
    trim: true,
    isLength: { options: { max: 120 }, errorMessage: 'name max length is 120' },
  },
  street: { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 120 } } },
  city:   { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 80 } } },
  state:  { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 80 } } },
  postalCode: { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 20 } } },
  country: { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 80 } } },

  'location.type': {
    in: ['body'], optional: true,
    isIn: { options: [['Point']], errorMessage: 'location.type must be "Point"' }
  },
  'location.coordinates': {
    in: ['body'], optional: true,
    custom: { options: (v) => v === undefined || isLngLat(v), errorMessage: 'location.coordinates must be [lng, lat]' }
  },

  amenities: { in: ['body'], optional: true, isArray: { errorMessage: 'amenities must be an array' } },
  'amenities.*': { in: ['body'], optional: true, isIn: { options: [AMENITIES], errorMessage: 'invalid amenity' } },

  openingHours: { in: ['body'], optional: true, isArray: { errorMessage: 'openingHours must be an array' } },
  'openingHours.*.day': { in: ['body'], optional: true, isIn: { options: [WEEK_DAYS], errorMessage: 'invalid day' } },
  'openingHours.*.open': { in: ['body'], optional: true, custom: { options: (v) => v === undefined || isTime(v) }, errorMessage: 'open must be HH:MM' },
  'openingHours.*.close': { in: ['body'], optional: true, custom: { options: (v) => v === undefined || isTime(v) }, errorMessage: 'close must be HH:MM' },

  phone: { in: ['body'], optional: true, isString: true, trim: true },
  email: { in: ['body'], optional: true, isEmail: { errorMessage: 'invalid email' }, normalizeEmail: true },
  website: { in: ['body'], optional: true, isString: true, trim: true },
  priceTier: { in: ['body'], optional: true, isIn: { options: [['$', '$$', '$$$']], errorMessage: 'priceTier must be $, $$, or $$$' } },

  ratingAvg: { in: ['body'], optional: true, isFloat: { options: { min: 0, max: 5 } }, toFloat: true },
  ratingCount: { in: ['body'], optional: true, isInt: { options: { min: 0 } }, toInt: true },

  machines: { in: ['body'], optional: true, isArray: { errorMessage: 'machines must be an array' } },
  'machines.*.machine': { in: ['body'], optional: true, custom: { options: (v) => v === undefined || isObjectId(v) }, errorMessage: 'invalid machine id' },
  'machines.*.quantity': { in: ['body'], optional: true, isInt: { options: { min: 0 } }, toInt: true },
  'machines.*.lastServicedAt': { in: ['body'], optional: true, isISO8601: { errorMessage: 'must be ISO date' }, toDate: true },
  'machines.*.areaNote': { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 200 } } },

  trainers: { in: ['body'], optional: true, isArray: { errorMessage: 'trainers must be an array' } },
  'trainers.*': { in: ['body'], optional: true, custom: { options: (v) => v === undefined || isObjectId(v) }, errorMessage: 'invalid trainer id' },
};

const gymRulesCreate = checkSchema(GYM_CREATE_SCHEMA);
const gymRulesUpdate = checkSchema({
  id: { in: ['params'], custom: { options: isObjectId }, errorMessage: 'Invalid gym id' },
  ...makeAllOptional(GYM_CREATE_SCHEMA)
});

const gymIdParam = [ param('id').custom(isObjectId).withMessage('Invalid gym id') ];

const gymByMachineQuery = [
  param('machineId').custom(isObjectId).withMessage('Invalid machineId'),
  query('city').optional().isString().trim(),
  query('country').optional().isString().trim(),
];

module.exports = {
  gymRulesCreate,
  gymRulesUpdate,
  gymIdParam,
  gymByMachineQuery,
};
