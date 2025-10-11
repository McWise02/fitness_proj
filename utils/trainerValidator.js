// utils/trainerValidator.js
const { checkSchema, query } = require('express-validator');

const SPECIALTIES = [
  'strength','hypertrophy','weight_loss','powerlifting',
  'olympic_lifting','mobility','rehab','endurance',
  'functional','prenatal','senior_fitness','sports_performance'
];
const MODES = ['in_person','online','hybrid'];

const registerRules = checkSchema({
  headline: { in: ['body'], optional: true, isString: true, trim: true, isLength: { options: { max: 120 } } },
  yearsExperience: { in: ['body'], optional: true, isInt: { options: { min: 0, max: 60 } }, toInt: true },
  certifications: { in: ['body'], optional: true, isArray: true },
  'certifications.*': { in: ['body'], optional: true, isString: true, trim: true },
  specialties: { in: ['body'], optional: true, isArray: true },
  'specialties.*': { in: ['body'], optional: true, isIn: { options: [SPECIALTIES], errorMessage: 'invalid specialty' } },
  hourlyRate: { in: ['body'], optional: true, isFloat: { options: { min: 0 } }, toFloat: true },
  trainingModes: { in: ['body'], optional: true, isArray: true },
  'trainingModes.*': { in: ['body'], optional: true, isIn: { options: [MODES], errorMessage: 'invalid training mode' } },
  languages: { in: ['body'], optional: true, isArray: true },
  'languages.*': { in: ['body'], optional: true, isString: true, trim: true },
  baseCity: { in: ['body'], optional: true, isString: true, trim: true },
  baseCountry: { in: ['body'], optional: true, isString: true, trim: true },
  gymAffiliations: { in: ['body'], optional: true, isArray: true },
  'gymAffiliations.*': { in: ['body'], optional: true, isString: true, isLength: { options: { min: 24, max: 24 } }, errorMessage: 'invalid gym id' },
});

const updateRules = registerRules; // same shape; all fields optional

const listByCityQuery = [
  query('city').notEmpty().withMessage('city is required').isString().trim(),
  query('country').optional().isString().trim(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('specialties').optional().isString().trim(), // comma-separated
];

module.exports = { registerRules, updateRules, listByCityQuery };
