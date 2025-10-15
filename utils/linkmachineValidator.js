// utils/linkMachineValidator.js
const { body } = require('express-validator');

const linkMachineBody = [
  body('gymId')
    .exists({ checkFalsy: true }).withMessage('gymId is required'),

  body('machineId')
    .exists({ checkFalsy: true }).withMessage('machineId is required'),

  body('quantity')
    .optional({ nullable: true })
    .toInt()
    .isInt({ min: 1 }).withMessage('quantity must be an integer ≥ 1'),

  body('lastServicedAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('lastServicedAt must be an ISO-8601 date string')
    .toDate(), // converts to JS Date

  body('areaNote')
    .optional({ nullable: true })
    .isString().withMessage('areaNote must be a string')
    .trim()
    .isLength({ max: 200 }).withMessage('areaNote must be ≤ 200 characters')
];

module.exports = { linkMachineBody };
