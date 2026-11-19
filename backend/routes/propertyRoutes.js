const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { propertyValidation } = require('../middleware/validateMiddleware');

router
  .route('/')
  .get(getProperties)
  .post(protect, authorize('Agent'), propertyValidation, createProperty);

router
  .route('/:id')
  .get(getProperty)
  .put(protect, authorize('Agent'), updateProperty)
  .patch(protect, authorize('Agent'), updateProperty)
  .delete(protect, authorize('Agent'), deleteProperty);

module.exports = router;
