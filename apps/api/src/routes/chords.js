/**
 * Chords Routes
 * Handle chord management, search, and statistics
 */

const express = require('express');
const router = express.Router();

// Controllers
const chordsController = require('../controllers/chords');

// Middleware
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');

// Validators
const {
  validateCreateChord,
  validateUpdateChord,
  validateSearchChords,
  validateChordId,
  validateChordExists
} = require('../validators/chords');

// Public routes
router.get('/', 
  validateSearchChords,
  optionalAuth,
  chordsController.getChords
);

router.get('/featured', 
  chordsController.getFeaturedChords
);

router.get('/popular', 
  chordsController.getPopularChords
);

router.get('/recent', 
  chordsController.getRecentChords
);

router.get('/categories', 
  chordsController.getCategories
);

router.get('/statistics', 
  chordsController.getStatistics
);

router.get('/:id', 
  validateChordId,
  optionalAuth,
  chordsController.getChord
);

// Protected routes
router.post('/', 
  authenticate,
  validateCreateChord,
  chordsController.createChord
);

router.put('/:id', 
  authenticate,
  validateChordId,
  validateUpdateChord,
  validateChordExists,
  chordsController.updateChord
);

router.delete('/:id', 
  authenticate,
  validateChordId,
  validateChordExists,
  chordsController.deleteChord
);

module.exports = router; 