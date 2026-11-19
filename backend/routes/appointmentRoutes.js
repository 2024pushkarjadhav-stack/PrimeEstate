const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { appointmentValidation } = require('../middleware/validateMiddleware');

router
  .route('/')
  .get(protect, getAppointments)
  .post(appointmentValidation, createAppointment);

router.route('/:id').put(protect, updateAppointment);

module.exports = router;
