/**
 * Favorites Routes
 * Handle user favorite chord management and organization
 */

const express = require('express');
const router = express.Router();

// Controllers
const favoritesController = require('../controllers/favorites');

// Middleware
const { authenticate } = require('../middleware/auth');

// All favorites routes require authentication
router.use(authenticate);

// Get user's favorites with filtering
router.get('/', 
  favoritesController.getFavorites
);

// Get favorite tags
router.get('/tags', 
  favoritesController.getFavoriteTags
);

// Get favorites statistics
router.get('/statistics', 
  favoritesController.getFavoriteStats
);

// Get specific favorite
router.get('/:id', 
  favoritesController.getFavorite
);

// Add chord to favorites
router.post('/:chordId', 
  favoritesController.addFavorite
);

// Update favorite
router.put('/:id', 
  favoritesController.updateFavorite
);

// Remove favorite
router.delete('/:chordId', 
  favoritesController.removeFavorite
);

module.exports = router; 