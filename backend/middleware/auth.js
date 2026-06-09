const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'taskdash_dev_secret_change_in_production';

// ── Verify JWT and attach req.user ───────────────────────────────────────────
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { id } = jwt.verify(auth.split(' ')[1], SECRET);
    const user   = await User.findById(id).select('-password');

    if (!user)          return res.status(401).json({ error: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: msg });
  }
};

// ── Admin-only guard ─────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ── Sign and return JWT ──────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports = { protect, adminOnly, generateToken };
