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
        count:count,
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
    const { id } = req.query;  
    const ids = Array.isArray(id) ? id : [id];  
    console.log('Delete request IDs:', ids);
  
    try {
      const tasks = await Task.find({ _id: { $in: ids }, user: req.user.id });
  
      if (tasks.length === 0) {
        return res.status(404).json({ error: 'No tasks found to delete' });
      }
  
       const unauthorized = tasks.some(task => task.user.toString() !== req.user.id);
      if (unauthorized) {
        return res.status(401).json({ error: 'Unauthorized to delete some tasks' });
      }
  
       const result = await Task.deleteMany({ _id: { $in: ids }, user: req.user.id });
  
      res.json({ message: 'Tasks deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
      logger.error('Failed to delete task(s)', { error: error.message });
      res.status(400).json({ error: 'Failed to delete task(s)' });
    }
  };
  
  
module.exports = { createTask, getTasks, updateTask, deleteTask };
