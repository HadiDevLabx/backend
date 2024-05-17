const Task = require('../models/Task');

const createTask = async (req, res) => {
    const { title, description, dueDate } = req.body;
   
    const [day, month, year] = dueDate.split('/');
    const formattedDueDate = new Date(`${year}-${month}-${day}`);
  
    try {
      if (isNaN(formattedDueDate.getTime())) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
  
      const task = await Task.create({
        title,
        description,
        dueDate: formattedDueDate,
        user: req.user.id
      });
  
      res.status(201).json(task);
    } catch (error) {
      logger.error('Failed to create task', { error: error.message });
      res.status(400).json({ error: 'Failed to create task' });
    }
 
};

const getTasks = async (req, res) => {
    const { page = 1, limit = 10, status } = req.body;
  
     const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }
  
    try {
      const tasks = await Task.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
  
      const count = await Task.countDocuments(query);
  
      res.json({
        tasks,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      logger.error('Failed to retrieve tasks', { error: error.message });
      res.status(400).json({ error: 'Failed to retrieve tasks' });
    }
  };
  
  

  const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;
  
     let formattedDueDate;
    if (dueDate) {
      const [day, month, year] = dueDate.split('/');
      formattedDueDate = new Date(`${year}-${month}-${day}`);
      if (isNaN(formattedDueDate.getTime())) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
    }
  
    try {
      const task = await Task.findById(id);
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      if (task.user.toString() !== req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = formattedDueDate || task.dueDate;
      task.status = status || task.status;
  
      const updatedTask = await task.save();
  
      res.json(updatedTask);
    } catch (error) {
      logger.error('Failed to update task', { error: error.message });
      res.status(400).json({ error: 'Failed to update task' });
    }
  };
  

  const deleteTask = async (req, res) => {
    const { id } = req.body;
  
    try {
      if (Array.isArray(id)) {
        const tasks = await Task.deleteMany({ _id: { $in: id }, user: req.user.id });
        if (tasks.deletedCount === 0) {
          return res.status(404).json({ error: 'No tasks found to delete' });
        }
        res.json({ message: 'Tasks deleted successfully' });
      } else {
        const task = await Task.findById(id);
  
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
  
        if (task.user.toString() !== req.user.id) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
  
        await Task.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully' });
      }
    } catch (error) {
      logger.error('Failed to delete task', { error: error.message });
      res.status(400).json({ error: 'Failed to delete task' });
    }
  };
  
module.exports = { createTask, getTasks, updateTask, deleteTask };
