const express = require('express');
const router = express.Router();

// In-memory storage
let tasks = [
  { _id: '1', title: 'Sample Task', description: 'This is a sample task', status: 'pending' }
];
let nextId = 2;

// GET all tasks
router.get('/', (req, res) => {
  console.log('GET request received for all tasks');
  console.log('Current tasks:', tasks);
  res.status(200).json(tasks);
});

// GET one task
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t._id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// CREATE task
router.post("/", (req, res) => {
  console.log('POST request received:', req.body);
  const { title, description, status } = req.body;

  if (!title) {
    console.log('Title validation failed');
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    _id: String(nextId++),
    title,
    description,
    status: status || 'pending'
  };

  console.log('Creating new task:', newTask);
  tasks.push(newTask);
  console.log('Total tasks now:', tasks.length);
  res.status(201).json(newTask);
});

// UPDATE task
router.put('/:id', (req, res) => {
  try {
    console.log('PUT request received for task ID:', req.params.id);
    console.log('Update data:', req.body);
    console.log('Current tasks before update:', tasks);
    
    const { title, description, status } = req.body;
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    console.log('Task index found:', taskIndex);
    
    if (taskIndex === -1) {
      console.log('Task not found for update');
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldTask = tasks[taskIndex];
    tasks[taskIndex] = { ...tasks[taskIndex], title, description, status };
    console.log('Task updated successfully:', tasks[taskIndex]);
    console.log('Previous task data:', oldTask);
    
    res.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error in UPDATE route:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', (req, res) => {
  try {
    console.log('DELETE request received for task ID:', req.params.id);
    console.log('Current tasks before delete:', tasks);
    
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    console.log('Task index found:', taskIndex);
    
    if (taskIndex === -1) {
      console.log('Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }

    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    console.log('Task deleted successfully:', deletedTask);
    console.log('Remaining tasks:', tasks.length);
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error in DELETE route:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;