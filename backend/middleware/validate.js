const { body, validationResult } = require('express-validator');

// ── Run accumulated validators and short-circuit on failure ──────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// ── Reusable rule sets ────────────────────────────────────────────────────────
const authRules = {
  register: [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'member']),
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
};

const taskRules = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
    body('status').optional().isIn(['todo', 'in-progress', 'code-review', 'testing', 'deployed', 'failed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
  update: [
    body('title').optional().trim().notEmpty().isLength({ max: 120 }),
    body('status').optional().isIn(['todo', 'in-progress', 'code-review', 'testing', 'deployed', 'failed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
};

const userRules = {
  role:   [body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')],
  status: [body('isActive').isBoolean().withMessage('isActive must be boolean')],
};

module.exports = { validate, authRules, taskRules, userRules };
