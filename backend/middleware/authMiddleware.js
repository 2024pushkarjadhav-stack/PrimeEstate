const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes - JWT verification
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route. Token missing.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'primeestate_super_secret_jwt_key_2026_secure'
    );

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User associated with this token no longer exists.', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route. Invalid or expired token.', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to perform this action.`,
          403
        )
      );
    }
    next();
  };
};
