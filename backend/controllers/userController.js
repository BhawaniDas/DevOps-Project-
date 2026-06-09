const User         = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ── GET /api/users ────────────────────────────────────────────────────────────
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

// ── PATCH /api/users/:id/role ─────────────────────────────────────────────────
exports.updateRole = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  user.role = req.body.role;
  await user.save({ validateBeforeSave: false });

  console.log(`🔄 [Admin] ${req.user.email} → ${user.email} role set to ${user.role}`);
  res.json({ message: `Role updated to ${user.role}`, user });
});

// ── PATCH /api/users/:id/status ───────────────────────────────────────────────
exports.updateStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot deactivate yourself', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  user.isActive = req.body.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  console.log(`🗑️  [Admin] ${req.user.email} deleted user: ${user.email}`);
  res.json({ message: 'User deleted', id: req.params.id });
});
