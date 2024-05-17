const express = require('express');
const { register, login,verifyEmail } = require('../controllers/authController');
const {validateUserRegistration,validateLogin} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/register',validateUserRegistration, register);
router.post('/login',validateLogin, login);
router.get('/verify-email', verifyEmail);
module.exports = router;
