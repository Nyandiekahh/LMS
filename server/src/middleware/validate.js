// src/middleware/validate.js
const { validationResult, check } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

const registerValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  check('firstName', 'First name is required').notEmpty(),
  check('lastName', 'Last name is required').notEmpty(),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  check('schoolCode').optional()
];

const schoolValidation = [
  ...registerValidation,
  check('schoolName', 'School name is required').notEmpty(),
  check('address', 'Address is required').notEmpty(),
  check('city', 'City is required').notEmpty(),
  check('country', 'Country is required').notEmpty(),
  check('phoneNumber', 'Valid phone number is required')
    .matches(/^[0-9+\-() ]+$/)
    .notEmpty(),
  check('numberOfTeachers', 'Number of teachers must be between 1 and 1000')
    .isInt({ min: 1, max: 1000 })
];

module.exports = { 
  validate, 
  registerValidation, 
  loginValidation, 
  schoolValidation 
};