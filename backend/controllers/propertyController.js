const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all properties (with search & filter query params)
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
  const { search, type, status, minPrice, maxPrice, bedrooms, agent } = req.query;

  const filter = {};

  if (type && type !== 'All') {
    filter.type = type;
  }

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (bedrooms && bedrooms !== 'All') {
    const bedNum = parseInt(bedrooms, 10);
    if (!isNaN(bedNum)) {
      filter.bedrooms = bedNum >= 4 ? { $gte: 4 } : bedNum;
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (agent) {
    filter.agent = agent;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const properties = await Property.find(filter)
    .populate('agent', 'name email phone role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate(
    'agent',
    'name email phone role'
  );

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: property,
  });
});

const { emitToAll } = require('../socket');

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Agent only)
exports.createProperty = asyncHandler(async (req, res, next) => {
  // Add agent to req.body
  req.body.agent = req.user.id;

  const property = await Property.create(req.body);
  const populatedProperty = await Property.findById(property._id).populate(
    'agent',
    'name email phone role'
  );

  // Emit real-time event to all connected clients & agents
  try {
    emitToAll('property:created', populatedProperty);
    emitToAll('notification:new', {
      id: `notif_${Date.now()}`,
      type: 'property',
      title: 'New Luxury Property Listed',
      message: `"${populatedProperty.title}" in ${populatedProperty.location} ($${Number(populatedProperty.price).toLocaleString()}) was just listed!`,
      propertyId: populatedProperty._id,
      timestamp: new Date().toISOString(),
      read: false,
    });
  } catch (socketErr) {
    console.warn('[Socket Event Error]', socketErr.message);
  }

  res.status(201).json({
    success: true,
    data: populatedProperty,
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent only - owner)
exports.updateProperty = asyncHandler(async (req, res, next) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is property agent
  if (property.agent.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this property`,
        403
      )
    );
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('agent', 'name email phone role');

  // Emit real-time update event
  try {
    emitToAll('property:updated', property);
  } catch (socketErr) {
    console.warn('[Socket Event Error]', socketErr.message);
  }

  res.status(200).json({
    success: true,
    data: property,
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent only - owner)
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is property agent
  if (property.agent.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this property`,
        403
      )
    );
  }

  await Property.findByIdAndDelete(req.params.id);

  // Emit real-time delete event
  try {
    emitToAll('property:deleted', req.params.id);
  } catch (socketErr) {
    console.warn('[Socket Event Error]', socketErr.message);
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Property deleted successfully',
  });
});
