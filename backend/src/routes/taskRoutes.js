const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', wrap(getTasks));
router.get('/:id', wrap(getTask));
router.post('/', wrap(createTask));
router.put('/:id', wrap(updateTask));
router.delete('/:id', wrap(deleteTask));

module.exports = router;
