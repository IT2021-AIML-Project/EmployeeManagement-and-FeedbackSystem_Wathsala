const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Change password route
router.post('/change-password', authController.changePassword);

// Get all users (for testing/admin purposes)
router.get('/users', authController.getAllUsers);

module.exports = router;
