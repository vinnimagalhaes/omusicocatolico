/**
 * Chord Model
 * Enterprise-level chord/song management with comprehensive validation and features
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Chord model definition
 */
const Chord = sequelize.define('Chord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Unique chord identifier'
  },
  
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: {
        args: [1, 200],
        msg: 'Title must be between 1 and 200 characters'
      },
      notEmpty: {
        msg: 'Title is required'
      }
    },
    comment: 'Song title'
  },
  
  artist: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [1, 100],
        msg: 'Artist must be between 1 and 100 characters'
      },
      notEmpty: {
        msg: 'Artist is required'
      }
    },
    comment: 'Song artist/performer'
  },
  
  composer: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Composer cannot exceed 100 characters'
      }
    },
    comment: 'Song composer'
  },
  
  key: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: {
        args: [1, 10],
        msg: 'Key must be between 1 and 10 characters'
      },
      notEmpty: {
        msg: 'Key is required'
      },
      is: {
        args: /^[A-G][#b]?[m]?$/,
        msg: 'Key must be a valid musical key (e.g., C, Am, F#, Bb)'
      }
    },
    comment: 'Musical key of the song'
  },
  
  category: {
    type: DataTypes.ENUM(
      'entrance', 'gloria', 'psalm', 'alleluia', 'offertory', 
      'sanctus', 'communion', 'final', 'adoration', 'marian', 
      'christmas', 'easter', 'other'
    ),
    allowNull: false,
    defaultValue: 'other',
    validate: {
      isIn: {
        args: [[
          'entrance', 'gloria', 'psalm', 'alleluia', 'offertory',
          'sanctus', 'communion', 'final', 'adoration', 'marian',
          'christmas', 'easter', 'other'
        ]],
        msg: 'Category must be a valid liturgical category'
      }
    },
    comment: 'Liturgical category of the song'
  },
  
  lyrics: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Lyrics are required'
      },
      len: {
        args: [10, 50000],
        msg: 'Lyrics must be between 10 and 50000 characters'
      }
    },
    comment: 'Song lyrics with chords'
  },
  
  original_lyrics: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Original lyrics without chord annotations'
  },
  
  duration: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: {
        args: /^([0-9]|[1-5][0-9]):([0-5][0-9])$/,
        msg: 'Duration must be in MM:SS format'
      }
    },
    comment: 'Song duration in MM:SS format'
  },
  
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Views cannot be negative'
      }
    },
    comment: 'Number of times the chord was viewed'
  },
  
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of tags for search and categorization'
  },
  
  youtube_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'YouTube URL must be a valid URL'
      },
      is: {
        args: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
        msg: 'Must be a valid YouTube URL'
      }
    },
    comment: 'YouTube video URL'
  },
  
  spotify_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Spotify URL must be a valid URL'
      },
      is: {
        args: /^https?:\/\/open\.spotify\.com\/.+/,
        msg: 'Must be a valid Spotify URL'
      }
    },
    comment: 'Spotify track URL'
  },
  
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['easy', 'medium', 'hard']],
        msg: 'Difficulty must be easy, medium, or hard'
      }
    },
    comment: 'Playing difficulty level'
  },
  
  bpm: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [40],
        msg: 'BPM must be at least 40'
      },
      max: {
        args: [300],
        msg: 'BPM cannot exceed 300'
      }
    },
    comment: 'Beats per minute (tempo)'
  },
  
  capo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Capo cannot be negative'
      },
      max: {
        args: [12],
        msg: 'Capo cannot exceed 12th fret'
      }
    },
    comment: 'Capo position (fret number)'
  },
  
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'draft']],
        msg: 'Status must be active, inactive, or draft'
      }
    },
    comment: 'Chord publication status'
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who created this chord'
  },
  
  review_status: {
    type: DataTypes.ENUM('private', 'pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'private',
    validate: {
      isIn: {
        args: [['private', 'pending', 'approved', 'rejected']],
        msg: 'Review status must be private, pending, approved, or rejected'
      }
    },
    comment: 'Moderation review status'
  },
  
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when submitted for review'
  },
  
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when review was completed'
  },
  
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Review notes cannot exceed 1000 characters'
      }
    },
    comment: 'Moderator notes about the review'
  },
  
  source_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Source URL must be a valid URL'
      }
    },
    comment: 'Original source URL if imported'
  },
  
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this chord is featured'
  },
  
  language: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: 'pt',
    validate: {
      len: {
        args: [2, 5],
        msg: 'Language must be 2-5 characters'
      }
    },
    comment: 'Language code (ISO 639-1)'
  },
  
  search_vector: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full-text search vector (computed)'
  }
}, {
  tableName: 'chords',
  paranoid: true, // Soft deletes
  indexes: [
    {
      fields: ['title'],
      name: 'chords_title_idx'
    },
    {
      fields: ['artist'],
      name: 'chords_artist_idx'
    },
    {
      fields: ['category'],
      name: 'chords_category_idx'
    },
    {
      fields: ['key'],
      name: 'chords_key_idx'
    },
    {
      fields: ['difficulty'],
      name: 'chords_difficulty_idx'
    },
    {
      fields: ['views'],
      name: 'chords_views_idx'
    },
    {
      fields: ['user_id'],
      name: 'chords_user_id_idx'
    },
    {
      fields: ['review_status'],
      name: 'chords_review_status_idx'
    },
    {
      fields: ['status'],
      name: 'chords_status_idx'
    },
    {
      fields: ['featured'],
      name: 'chords_featured_idx'
    },
    {
      fields: ['created_at'],
      name: 'chords_created_at_idx'
    }
  ],
  defaultScope: {
    where: {
      status: 'active'
    }
  },
  scopes: {
    withInactive: {
      where: {}
    },
    public: {
      where: {
        review_status: 'approved',
        status: 'active'
      }
    },
    featured: {
      where: {
        featured: true,
        status: 'active',
        review_status: 'approved'
      }
    },
    byCategory: (category) => ({
      where: { category }
    }),
    byDifficulty: (difficulty) => ({
      where: { difficulty }
    }),
    byKey: (key) => ({
      where: { key }
    })
  }
});

/**
 * Instance Methods
 */

/**
 * Increment views counter
 */
Chord.prototype.incrementViews = async function() {
  this.views += 1;
  await this.save({ fields: ['views'] });
  return this;
};

/**
 * Format views for display
 */
Chord.prototype.getFormattedViews = function() {
  if (this.views >= 1000000) {
    return Math.floor(this.views / 1000000) + 'M';
  } else if (this.views >= 1000) {
    return Math.floor(this.views / 1000) + 'k';
  }
  return this.views.toString();
};

/**
 * Check if chord is public
 */
Chord.prototype.isPublic = function() {
  return this.review_status === 'approved' && this.status === 'active';
};

/**
 * Get search-friendly data
 */
Chord.prototype.getSearchData = function() {
  return {
    title: this.title,
    artist: this.artist,
    composer: this.composer,
    tags: this.tags || [],
    category: this.category,
    key: this.key
  };
};

/**
 * Submit for review
 */
Chord.prototype.submitForReview = async function() {
  if (this.review_status !== 'private') {
    throw new Error('Chord is not in private status');
  }
  
  return this.update({
    review_status: 'pending',
    submitted_at: new Date()
  });
};

/**
 * Approve chord
 */
Chord.prototype.approve = async function(reviewNotes = null) {
  return this.update({
    review_status: 'approved',
    reviewed_at: new Date(),
    review_notes: reviewNotes
  });
};

/**
 * Reject chord
 */
Chord.prototype.reject = async function(reviewNotes) {
  if (!reviewNotes) {
    throw new Error('Review notes are required for rejection');
  }
  
  return this.update({
    review_status: 'rejected',
    reviewed_at: new Date(),
    review_notes: reviewNotes
  });
};

/**
 * Model Hooks
 */

// Update search vector before save
Chord.beforeSave((chord) => {
  if (chord.changed('title') || chord.changed('artist') || chord.changed('tags')) {
    const searchTerms = [
      chord.title,
      chord.artist,
      chord.composer,
      ...(chord.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    chord.search_vector = searchTerms;
  }
});

// Validate tags format
Chord.beforeValidate((chord) => {
  if (chord.tags && !Array.isArray(chord.tags)) {
    throw new Error('Tags must be an array');
  }
  
  if (chord.tags && chord.tags.length > 20) {
    throw new Error('Cannot have more than 20 tags');
  }
  
  if (chord.tags) {
    chord.tags = chord.tags.map(tag => 
      typeof tag === 'string' ? tag.toLowerCase().trim() : tag
    ).filter(tag => tag && tag.length > 0);
  }
});

/**
 * Class Methods
 */

/**
 * Search chords
 */
Chord.search = function(query, options = {}) {
  const { limit = 20, offset = 0, category, difficulty, key } = options;
  
  const where = {
    [sequelize.Sequelize.Op.or]: [
      { title: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
      { artist: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
      { composer: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
      { search_vector: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } }
    ]
  };
  
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (key) where.key = key;
  
  return this.scope('public').findAndCountAll({
    where,
    limit,
    offset,
    order: [['views', 'DESC'], ['created_at', 'DESC']]
  });
};

/**
 * Get trending chords
 */
Chord.getTrending = function(limit = 10) {
  return this.scope('public').findAll({
    limit,
    order: [['views', 'DESC']],
    where: {
      created_at: {
        [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });
};

/**
 * Get featured chords
 */
Chord.getFeatured = function(limit = 5) {
  return this.scope('featured').findAll({
    limit,
    order: [['created_at', 'DESC']]
  });
};

module.exports = Chord; 