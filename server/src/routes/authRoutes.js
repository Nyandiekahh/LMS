// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');

// Register routes
router.post('/register/teacher', validate(registerValidation), authController.registerTeacher);
router.post('/register/school', authController.registerSchool);

// Login route
router.post('/login', validate(loginValidation), authController.login);

// Get current user route
router.get('/me', (req, res) => {
  authController.getMe(req, res);
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working' });
});

module.exports = router;