const router        = require('express').Router();
const rateLimit     = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect }   = require('../middleware/auth');
const { authRules, validate } = require('../middleware/validate');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts — try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', limiter, authRules.register, validate, register);
router.post('/login',    limiter, authRules.login,    validate, login);
router.get('/me',        protect, getMe);

module.exports = router;
