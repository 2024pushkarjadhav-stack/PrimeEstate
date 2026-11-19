const Appointment = require('../models/Appointment');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = asyncHandler(async (req, res, next) => {
  let filter = {};

  if (req.user.role === 'Agent') {
    filter.agent = req.user.id;
  } else {
    filter.$or = [
      { customer: req.user.id },
      { customerEmail: req.user.email },
    ];
  }

  const appointments = await Appointment.find(filter)
    .populate('property', 'title price location image type')
    .populate('agent', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Create new appointment / site visit booking
// @route   POST /api/appointments
// @access  Public / Buyer
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const { customerName, customerEmail, customerPhone, property: propertyId, date, time, notes } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${propertyId}`, 404));
  }

  const appointment = await Appointment.create({
    customer: req.user ? req.user.id : null,
    customerName,
    customerEmail,
    customerPhone,
    property: propertyId,
    agent: property.agent,
    date,
    time: time || '10:00 AM',
    notes: notes || '',
    status: 'Scheduled',
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('property', 'title price location image type')
    .populate('agent', 'name email phone');

  // Emit real-time notification to Agent
  try {
    const { emitToUser, emitToRole } = require('../socket');
    const newAppointmentNotif = {
      id: `notif_${Date.now()}`,
      type: 'appointment',
      title: 'New Site Visit Booked',
      message: `${customerName} booked a visit for "${property.title}" on ${date} at ${time || '10:00 AM'}.`,
      appointmentId: appointment._id,
      propertyId: propertyId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (property.agent) {
      emitToUser(property.agent.toString(), 'appointment:created', populatedAppointment);
      emitToUser(property.agent.toString(), 'notification:new', newAppointmentNotif);
    }
    emitToRole('Agent', 'appointment:created', populatedAppointment);
    emitToRole('Agent', 'notification:new', newAppointmentNotif);
  } catch (socketErr) {
    console.warn('[Socket Event Error]', socketErr.message);
  }

  res.status(201).json({
    success: true,
    data: populatedAppointment,
    message: 'Site visit booked successfully! Agent will confirm your schedule.',
  });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Agent or booked Buyer)
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Verify access (either the assigned agent or the customer)
  const isAgent = appointment.agent && appointment.agent.toString() === req.user.id;
  const isCustomer = appointment.customer && appointment.customer.toString() === req.user.id;
  const isCustomerEmail = appointment.customerEmail === req.user.email;

  if (!isAgent && !isCustomer && !isCustomerEmail && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to update this appointment', 403));
  }

  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, notes: req.body.notes || appointment.notes },
    { new: true, runValidators: true }
  )
    .populate('property', 'title price location image type')
    .populate('agent', 'name email phone');

  // Emit real-time update event to customer & agent
  try {
    const { emitToUser } = require('../socket');
    const updateNotif = {
      id: `notif_${Date.now()}`,
      type: 'appointment_update',
      title: `Site Visit ${req.body.status || 'Updated'}`,
      message: `Your visit for "${appointment.property?.title || 'Property'}" is now marked as ${req.body.status}.`,
      appointmentId: appointment._id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (appointment.customer) {
      emitToUser(appointment.customer.toString(), 'appointment:updated', appointment);
      emitToUser(appointment.customer.toString(), 'notification:new', updateNotif);
    }
    if (appointment.agent) {
      emitToUser(appointment.agent.toString(), 'appointment:updated', appointment);
    }
  } catch (socketErr) {
    console.warn('[Socket Event Error]', socketErr.message);
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});
