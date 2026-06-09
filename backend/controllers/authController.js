const { sendAdminApprovalEmail } = require('../utils/emailService');
const User         = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ── Helper: sign token and send response ─────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    token,
    user: {
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      initials: user.initials,
      isActive: user.isActive,
    },
  });
};

// ── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.findOne({ email })) {
    throw new AppError('An account with that email already exists', 409);
  }

  // First user ever → auto-admin
  const count        = await User.countDocuments();
  let assignedRole = count === 0 ? 'admin' : (role || 'member');
  let assignedStatus = count === 0 ? 'approved' : (role === 'admin' ? 'pending' : 'approved');
  
  const user = await User.create({ 
    name, 
    email, 
    password, 
    role: assignedRole,
    status: assignedStatus 
  });

  console.log(`✅ [Auth] Register: ${email} (${assignedRole}) - Status: ${assignedStatus}`);

  if (assignedStatus === 'pending') {
    await sendAdminApprovalEmail(user);
    
    return res.status(201).json({ 
      success: true, 
      message: "Registration successful! Your admin access request is pending approval." 
    });
  }

  sendToken(user, 201, res);
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // NEW: Check for pending status
  if (user.status === 'pending') {
    throw new AppError('Your account is awaiting admin approval', 403);
  }

  if (!user.isActive) throw new AppError('Account deactivated', 403);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  console.log(`✅ [Auth] Login: ${email}`);
  sendToken(user, 200, res);
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});
