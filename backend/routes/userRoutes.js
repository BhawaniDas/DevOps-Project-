const router = require('express').Router();
const { getUsers, updateRole, updateStatus, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const { userRules, validate } = require('../middleware/validate');

// All user management routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/',                              getUsers);
router.patch('/:id/role',   userRules.role,   validate, updateRole);
router.patch('/:id/status', userRules.status, validate, updateStatus);
router.delete('/:id',                        deleteUser);

module.exports = router;
