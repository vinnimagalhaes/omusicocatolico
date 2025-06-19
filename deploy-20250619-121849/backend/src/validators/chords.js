/**
 * Chord Validators
 * Enterprise-level request validation for chord endpoints
 */

const Joi = require('joi');
const { AppError } = require('../middleware/error-handler');

/**
 * Chord categories
 */
const validCategories = [
  'adoracao', 'louvor', 'comunhao', 'entrada', 'ofertorio', 
  'comunhao_eucaristica', 'acao_gracas', 'final', 'natal', 
  'pascoa', 'quaresma', 'pentecostes', 'advento', 'diversos'
];

/**
 * Chord difficulties
 */
const validDifficulties = ['beginner', 'intermediate', 'advanced'];

/**
 * Chord keys
 */
const validKeys = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 
  'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

/**
 * Time signatures
 */
const validTimeSignatures = ['2/4', '3/4', '4/4', '6/8', '12/8'];

/**
 * Create chord validation
 */
const createChordSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'string.empty': 'Title is required'
    }),
  
  artist: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Artist must be at least 2 characters long',
      'string.max': 'Artist cannot exceed 100 characters',
      'string.empty': 'Artist is required'
    }),
  
  lyrics: Joi.string()
    .min(10)
    .max(50000)
    .required()
    .messages({
      'string.min': 'Lyrics must be at least 10 characters long',
      'string.max': 'Lyrics cannot exceed 50,000 characters',
      'string.empty': 'Lyrics are required'
    }),
  
  chords: Joi.string()
    .min(5)
    .max(20000)
    .required()
    .messages({
      'string.min': 'Chords must be at least 5 characters long',
      'string.max': 'Chords cannot exceed 20,000 characters',
      'string.empty': 'Chords are required'
    }),
  
  category: Joi.string()
    .valid(...validCategories)
    .required()
    .messages({
      'any.only': `Category must be one of: ${validCategories.join(', ')}`,
      'string.empty': 'Category is required'
    }),
  
  difficulty: Joi.string()
    .valid(...validDifficulties)
    .default('intermediate')
    .messages({
      'any.only': `Difficulty must be one of: ${validDifficulties.join(', ')}`
    }),
  
  key: Joi.string()
    .valid(...validKeys)
    .messages({
      'any.only': `Key must be one of: ${validKeys.join(', ')}`
    }),
  
  capo: Joi.number()
    .integer()
    .min(0)
    .max(12)
    .messages({
      'number.base': 'Capo must be a number',
      'number.integer': 'Capo must be an integer',
      'number.min': 'Capo cannot be negative',
      'number.max': 'Capo cannot exceed 12'
    }),
  
  timeSignature: Joi.string()
    .valid(...validTimeSignatures)
    .messages({
      'any.only': `Time signature must be one of: ${validTimeSignatures.join(', ')}`
    }),
  
  tempo: Joi.number()
    .integer()
    .min(40)
    .max(200)
    .messages({
      'number.base': 'Tempo must be a number',
      'number.integer': 'Tempo must be an integer',
      'number.min': 'Tempo must be at least 40 BPM',
      'number.max': 'Tempo cannot exceed 200 BPM'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().min(2).max(30))
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.min': 'Each tag must be at least 2 characters long',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  
  youtubeUrl: Joi.string()
    .uri()
    .pattern(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/)
    .messages({
      'string.uri': 'YouTube URL must be a valid URL',
      'string.pattern.base': 'Must be a valid YouTube URL'
    }),
  
  spotifyUrl: Joi.string()
    .uri()
    .pattern(/^https?:\/\/open\.spotify\.com/)
    .messages({
      'string.uri': 'Spotify URL must be a valid URL',
      'string.pattern.base': 'Must be a valid Spotify URL'
    }),
  
  notes: Joi.string()
    .max(1000)
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    })
});

/**
 * Update chord validation
 */
const updateChordSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .messages({
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  artist: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Artist must be at least 2 characters long',
      'string.max': 'Artist cannot exceed 100 characters'
    }),
  
  lyrics: Joi.string()
    .min(10)
    .max(50000)
    .messages({
      'string.min': 'Lyrics must be at least 10 characters long',
      'string.max': 'Lyrics cannot exceed 50,000 characters'
    }),
  
  chords: Joi.string()
    .min(5)
    .max(20000)
    .messages({
      'string.min': 'Chords must be at least 5 characters long',
      'string.max': 'Chords cannot exceed 20,000 characters'
    }),
  
  category: Joi.string()
    .valid(...validCategories)
    .messages({
      'any.only': `Category must be one of: ${validCategories.join(', ')}`
    }),
  
  difficulty: Joi.string()
    .valid(...validDifficulties)
    .messages({
      'any.only': `Difficulty must be one of: ${validDifficulties.join(', ')}`
    }),
  
  key: Joi.string()
    .valid(...validKeys)
    .messages({
      'any.only': `Key must be one of: ${validKeys.join(', ')}`
    }),
  
  capo: Joi.number()
    .integer()
    .min(0)
    .max(12)
    .messages({
      'number.base': 'Capo must be a number',
      'number.integer': 'Capo must be an integer',
      'number.min': 'Capo cannot be negative',
      'number.max': 'Capo cannot exceed 12'
    }),
  
  timeSignature: Joi.string()
    .valid(...validTimeSignatures)
    .messages({
      'any.only': `Time signature must be one of: ${validTimeSignatures.join(', ')}`
    }),
  
  tempo: Joi.number()
    .integer()
    .min(40)
    .max(200)
    .messages({
      'number.base': 'Tempo must be a number',
      'number.integer': 'Tempo must be an integer',
      'number.min': 'Tempo must be at least 40 BPM',
      'number.max': 'Tempo cannot exceed 200 BPM'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().min(2).max(30))
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.min': 'Each tag must be at least 2 characters long',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  
  youtubeUrl: Joi.string()
    .uri()
    .pattern(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/)
    .allow('')
    .messages({
      'string.uri': 'YouTube URL must be a valid URL',
      'string.pattern.base': 'Must be a valid YouTube URL'
    }),
  
  spotifyUrl: Joi.string()
    .uri()
    .pattern(/^https?:\/\/open\.spotify\.com/)
    .allow('')
    .messages({
      'string.uri': 'Spotify URL must be a valid URL',
      'string.pattern.base': 'Must be a valid Spotify URL'
    }),
  
  notes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .messages({
      'any.only': 'Status must be draft, published, or archived'
    })
});

/**
 * Search chords validation
 */
const searchChordsSchema = Joi.object({
  q: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 100 characters'
    }),
  
  category: Joi.string()
    .valid(...validCategories)
    .messages({
      'any.only': `Category must be one of: ${validCategories.join(', ')}`
    }),
  
  difficulty: Joi.string()
    .valid(...validDifficulties)
    .messages({
      'any.only': `Difficulty must be one of: ${validDifficulties.join(', ')}`
    }),
  
  key: Joi.string()
    .valid(...validKeys)
    .messages({
      'any.only': `Key must be one of: ${validKeys.join(', ')}`
    }),
  
  artist: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Artist must be at least 2 characters long',
      'string.max': 'Artist cannot exceed 100 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().min(2).max(30))
    .max(5)
    .messages({
      'array.max': 'Cannot filter by more than 5 tags',
      'string.min': 'Each tag must be at least 2 characters long',
      'string.max': 'Each tag cannot exceed 30 characters'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  sortBy: Joi.string()
    .valid('title', 'artist', 'createdAt', 'updatedAt', 'viewCount', 'favoriteCount')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: title, artist, createdAt, updatedAt, viewCount, favoriteCount'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be asc or desc'
    }),
  
  featured: Joi.boolean()
    .messages({
      'boolean.base': 'Featured must be true or false'
    }),
  
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('published')
    .messages({
      'any.only': 'Status must be draft, published, or archived'
    })
});

/**
 * Chord review validation
 */
const reviewChordSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  
  comment: Joi.string()
    .max(500)
    .trim()
    .messages({
      'string.max': 'Comment cannot exceed 500 characters'
    })
});

/**
 * Chord ID validation
 */
const chordIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Chord ID must be a number',
      'number.integer': 'Chord ID must be an integer',
      'number.positive': 'Chord ID must be positive',
      'any.required': 'Chord ID is required'
    })
});

/**
 * Generic validator middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      req.logger.warn('Validation failed', {
        errors,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
    }

    req[property] = value;
    next();
  };
};

/**
 * Specific validator middlewares
 */
const validateCreateChord = validate(createChordSchema);
const validateUpdateChord = validate(updateChordSchema);
const validateSearchChords = validate(searchChordsSchema, 'query');
const validateReviewChord = validate(reviewChordSchema);
const validateChordId = validate(chordIdSchema, 'params');

/**
 * Validate chord exists middleware
 */
const validateChordExists = async (req, res, next) => {
  try {
    const { Chord } = require('../models');
    const { id } = req.params;

    const chord = await Chord.findByPk(id);
    
    if (!chord) {
      return next(new AppError('Chord not found', 404, 'CHORD_NOT_FOUND'));
    }

    req.chord = chord;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCreateChord,
  validateUpdateChord,
  validateSearchChords,
  validateReviewChord,
  validateChordId,
  validateChordExists,
  validate,
  schemas: {
    createChordSchema,
    updateChordSchema,
    searchChordsSchema,
    reviewChordSchema,
    chordIdSchema
  },
  constants: {
    validCategories,
    validDifficulties,
    validKeys,
    validTimeSignatures
  }
}; 