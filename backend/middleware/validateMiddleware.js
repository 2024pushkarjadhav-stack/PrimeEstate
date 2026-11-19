const { check, validationResult } = require('express-validator');

// Validation error handler middleware
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
      error: errors.array()[0].msg, // primary error message
    });
  }
  next();
};

// User Registration Validation Rules
const registerValidation = [
  check('name', 'Name is required and must not be empty').trim().notEmpty(),
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role must be either Buyer or Agent').optional().isIn(['Buyer', 'Agent']),
  validateResult,
];

// User Login Validation Rules
const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
  validateResult,
];

// Property Create/Update Validation Rules
const propertyValidation = [
  check('title', 'Property title is required').trim().notEmpty(),
  check('location', 'Location is required').trim().notEmpty(),
  check('price', 'Price is required and must be a positive number').isFloat({ min: 0 }),
  check('type', 'Type must be For Sale or For Rent').isIn(['For Sale', 'For Rent']),
  check('bedrooms', 'Bedrooms must be a non-negative integer').isInt({ min: 0 }),
  check('bathrooms', 'Bathrooms must be a non-negative integer').isInt({ min: 0 }),
  check('area', 'Area must be at least 10 sq ft').isFloat({ min: 10 }),
  check('description', 'Description is required').trim().notEmpty(),
  validateResult,
];

// Lead / Inquiry Validation Rules
const leadValidation = [
  check('customerName', 'Customer name is required').trim().notEmpty(),
  check('customerEmail', 'Valid email is required').isEmail().normalizeEmail(),
  check('customerPhone', 'Phone number is required').trim().notEmpty(),
  check('property', 'Valid property ID is required').notEmpty(),
  check('message', 'Message is required').trim().notEmpty(),
  validateResult,
];

// Appointment Validation Rules
const appointmentValidation = [
  check('customerName', 'Customer name is required').trim().notEmpty(),
  check('customerEmail', 'Valid email is required').isEmail().normalizeEmail(),
  check('customerPhone', 'Phone number is required').trim().notEmpty(),
  check('property', 'Property ID is required').notEmpty(),
  check('date', 'Appointment date is required').trim().notEmpty(),
  validateResult,
];

module.exports = {
  registerValidation,
  loginValidation,
  propertyValidation,
  leadValidation,
  appointmentValidation,
};
