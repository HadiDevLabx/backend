const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

   if (!token) {
    return res
       .status(401)
       .json({ error: "Unauthorized: Token not provided" });
 }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    logger.error('Token verification failed', { error: error.message });
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
