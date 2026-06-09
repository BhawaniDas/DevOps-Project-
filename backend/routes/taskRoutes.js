const router = require('express').Router();
const {
  getStats, getTasks, getTask,
  createTask, updateTask, patchTask,
  deleteTask, bulkDelete, seedTasks,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');
const { taskRules, validate } = require('../middleware/validate');

// All task routes require auth
router.use(protect);

router.get('/stats',        getStats);
router.post('/seed',        adminOnly, seedTasks);

router.route('/')
  .get(getTasks)
  .post(taskRules.create, validate, createTask)
  .delete(adminOnly, bulkDelete);

router.route('/:id')
  .get(getTask)
  .put(taskRules.update, validate, updateTask)
  .patch(patchTask)
  .delete(deleteTask);

module.exports = router;
