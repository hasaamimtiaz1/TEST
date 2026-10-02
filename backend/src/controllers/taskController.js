const Task = require('../models/Task');

async function getTasks(req, res) {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
}

async function getTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
}

async function createTask(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const task = await Task.create({ title, description });
  res.status(201).json(task);
}

async function updateTask(req, res) {
  const { title, description, completed } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { title, description, completed },
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
}

async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
