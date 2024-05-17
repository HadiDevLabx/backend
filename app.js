const express = require('express');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
dotenv.config();


 
connectDB();



app.use(cors());
app.use(express.json());

 
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
