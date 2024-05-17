const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/createTask', createTask);
router.post('/getTasks', getTasks);
router.put('/updateTask/:id', updateTask);
router.delete('/deleteTask', deleteTask);

module.exports = router;
