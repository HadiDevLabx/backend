const express = require('express');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
const xss = require("xss-clean");
const compression = require('compression');
const app = express();
dotenv.config();

connectDB();

app.use(cors());
app.use(express.json());
app.use(xss());
app.use(compression());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = normalizePort(process.env.PORT || 3050);
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}
