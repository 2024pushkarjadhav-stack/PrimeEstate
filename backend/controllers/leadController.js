const Lead = require('../models/Lead');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get leads / inquiries
// @route   GET /api/leads
// @access  Private
exports.getLeads = asyncHandler(async (req, res, next) => {
  let filter = {};

  if (req.user.role === 'Agent') {
    filter.agent = req.user.id;
  } else {
    // If buyer, show inquiries matching their email
    filter.customerEmail = req.user.email;
  }

  const leads = await Lead.find(filter)
    .populate('property', 'title price location image type')
    .populate('agent', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: leads.length,
    data: leads,
  });
});

// @desc    Create new lead / inquiry
// @route   POST /api/leads
// @access  Public / Buyer
exports.createLead = asyncHandler(async (req, res, next) => {
  const { customerName, customerEmail, customerPhone, property: propertyId, message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${propertyId}`, 404));
  }

  const lead = await Lead.create({
    customerName,
    customerEmail,
    customerPhone,
    property: propertyId,
    agent: property.agent,
    message,
    status: 'New',
  });

  const populatedLead = await Lead.findById(lead._id)
    .populate('property', 'title price location image type')
    .populate('agent', 'name email phone');

  // Emit real-time notification to Agent (Exp 8)
  try {
    const { emitToUser, emitToRole } = require('../socket');
    const newLeadNotif = {
      id: `notif_${Date.now()}`,
      type: 'lead',
      title: 'New Customer Inquiry',
      message: `${customerName} enquired about "${property.title}": "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
      leadId: lead._id,
      propertyId: propertyId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (property.agent) {
      emitToUser(property.agent.toString(), 'lead:created', populatedLead);
      emitToUser(property.agent.toString(), 'notification:new', newLeadNotif);
    }
    emitToRole('Agent', 'lead:created', populatedLead);
    emitToRole('Agent', 'notification:new', newLeadNotif);
  } catch (socketErr) {
    console.warn('[Socket Event Error]', socketErr.message);
  }

  res.status(201).json({
    success: true,
    data: populatedLead,
    message: 'Inquiry submitted successfully! The agent will contact you soon.',
  });
});

// @desc    Update lead status
// @route   PUT /api/leads/:id
// @access  Private (Agent only)
exports.updateLead = asyncHandler(async (req, res, next) => {
  let lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404));
  }

  // Ensure agent owns this lead
  if (lead.agent.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse(`Not authorized to update this lead inquiry`, 403));
  }

  lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  )
    .populate('property', 'title price location image type')
    .populate('agent', 'name email phone');

  res.status(200).json({
    success: true,
    data: lead,
  });
});
