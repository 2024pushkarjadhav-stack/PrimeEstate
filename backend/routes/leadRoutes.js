const express = require('express');
const router = express.Router();
const {
  getLeads,
  createLead,
  updateLead,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { leadValidation } = require('../middleware/validateMiddleware');

router
  .route('/')
  .get(protect, getLeads)
  .post(leadValidation, createLead);

router.route('/:id').put(protect, authorize('Agent'), updateLead);

module.exports = router;
