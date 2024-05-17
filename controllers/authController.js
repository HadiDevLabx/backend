const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const crypto = require('crypto');

const sendVerificationEmail = require('../services/emailService');

dotenv.config();

const register = async (req, res) => {
    const { firstName, lastName, password, email } = req.body;
  
   
    try {
      let user = await User.findOne({ email });
  
      if (user) {
        if (!user.emailVerified) {
          const verificationToken = user.generateEmailVerificationToken();
          await user.save();
          await sendVerificationEmail(user.email, verificationToken);
          return res.status(400).json({ message: 'Email is already registered but not verified. A new verification email has been sent.' });
        } else {
          return res.status(400).json({ message: 'Email is already registered.' });
        }
      }
  
      user = await User.create({ firstName, lastName, password, email });
  
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();
  
      await sendVerificationEmail(user.email, verificationToken);
  
      logger.info('User registered successfully', { firstName });
      res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error) {
      logger.error('User registration failed', { error: error.message });
      res.status(400).json({ error: 'User registration failed' });
    }
  };

  const verifyEmail = async (req, res) => {
    const { token } = req.query;
  
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ error: 'Token is invalid or has expired' });
      }
  
      user.verifyEmail();
      await user.save();
  
      logger.info('Email verified successfully', { email: user.email });
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      logger.error('Email verification failed', { error: error.message });
      res.status(500).json({ error: 'Email verification failed' });
    }
  };
  
  const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        logger.warn('Invalid credentials', { email });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
      logger.info('User logged in successfully', { email });
      res.json({ 
        user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            token:token
          },
      });
    } catch (error) {
      logger.error('User login failed', { error: error.message });
      res.status(400).json({ error: 'User login failed' });
    }
  };
  

module.exports = { register, login,verifyEmail };
