/**
 * Users Routes
 * Handle user management and administration
 */

const express = require('express');
const router = express.Router();

// Controllers
const usersController = require('../controllers/users');

// Middleware
const { authenticate, authorize } = require('../middleware/auth');

// Public statistics
router.get('/platform/statistics', 
  authenticate,
  authorize('admin'),
  usersController.getPlatformStats
);

// Admin only routes
router.get('/', 
  authenticate,
  authorize('admin'),
  usersController.getUsers
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  usersController.updateUser
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  usersController.deleteUser
);

// User profile routes (self or admin)
router.get('/:id', 
  authenticate,
  usersController.getUser
);

router.get('/:id/statistics', 
  authenticate,
  usersController.getUserStats
);

module.exports = router; 