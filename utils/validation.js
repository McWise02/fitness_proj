// utils/validate-request.js
const { validationResult } = require('express-validator');

module.exports = function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.param,
        msg: e.msg,
        value: e.value
      }))
    });
  }
  next();
};
