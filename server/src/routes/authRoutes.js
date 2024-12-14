// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');

// Register routes
router.post('/register/teacher', validate(registerValidation), authController.registerTeacher);

// Login route
router.post('/login', validate(loginValidation), authController.login);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

module.exports = router;