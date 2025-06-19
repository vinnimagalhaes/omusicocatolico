/**
 * Favorite Model
 * Enterprise-level favorite management with proper relationships and validation
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Favorite model definition
 */
const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Unique favorite identifier'
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who favorited the chord'
  },
  
  chord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chords',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Favorited chord'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Notes cannot exceed 500 characters'
      }
    },
    comment: 'User notes about this favorite'
  },
  
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'User-specific tags for organization'
  },
  
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Priority cannot be negative'
      },
      max: {
        args: [10],
        msg: 'Priority cannot exceed 10'
      }
    },
    comment: 'User-defined priority (0-10)'
  },
  
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time user accessed this favorite'
  }
}, {
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'chord_id'],
      name: 'favorites_user_chord_unique_idx'
    },
    {
      fields: ['user_id'],
      name: 'favorites_user_id_idx'
    },
    {
      fields: ['chord_id'],
      name: 'favorites_chord_id_idx'
    },
    {
      fields: ['priority'],
      name: 'favorites_priority_idx'
    },
    {
      fields: ['created_at'],
      name: 'favorites_created_at_idx'
    }
  ],
  scopes: {
    byUser: (userId) => ({
      where: { user_id: userId }
    }),
    highPriority: {
      where: {
        priority: {
          [sequelize.Sequelize.Op.gte]: 5
        }
      }
    },
    recent: {
      order: [['created_at', 'DESC']]
    },
    byPriority: {
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    }
  }
});

/**
 * Instance Methods
 */

/**
 * Update last accessed timestamp
 */
Favorite.prototype.updateLastAccessed = async function() {
  return this.update({ last_accessed_at: new Date() });
};

/**
 * Set priority
 */
Favorite.prototype.setPriority = async function(priority) {
  if (priority < 0 || priority > 10) {
    throw new Error('Priority must be between 0 and 10');
  }
  return this.update({ priority });
};

/**
 * Add user tag
 */
Favorite.prototype.addTag = async function(tag) {
  if (!tag || typeof tag !== 'string') {
    throw new Error('Tag must be a non-empty string');
  }
  
  const currentTags = this.tags || [];
  const normalizedTag = tag.toLowerCase().trim();
  
  if (currentTags.includes(normalizedTag)) {
    return this; // Tag already exists
  }
  
  if (currentTags.length >= 10) {
    throw new Error('Cannot have more than 10 tags per favorite');
  }
  
  const updatedTags = [...currentTags, normalizedTag];
  return this.update({ tags: updatedTags });
};

/**
 * Remove user tag
 */
Favorite.prototype.removeTag = async function(tag) {
  if (!tag || typeof tag !== 'string') {
    throw new Error('Tag must be a non-empty string');
  }
  
  const currentTags = this.tags || [];
  const normalizedTag = tag.toLowerCase().trim();
  const updatedTags = currentTags.filter(t => t !== normalizedTag);
  
  return this.update({ tags: updatedTags });
};

/**
 * Model Hooks
 */

// Validate tags format before save
Favorite.beforeValidate((favorite) => {
  if (favorite.tags && !Array.isArray(favorite.tags)) {
    throw new Error('Tags must be an array');
  }
  
  if (favorite.tags && favorite.tags.length > 10) {
    throw new Error('Cannot have more than 10 tags per favorite');
  }
  
  if (favorite.tags) {
    favorite.tags = favorite.tags.map(tag => 
      typeof tag === 'string' ? tag.toLowerCase().trim() : tag
    ).filter(tag => tag && tag.length > 0);
  }
});

/**
 * Class Methods
 */

/**
 * Find user's favorites with chord data
 */
Favorite.findUserFavorites = function(userId, options = {}) {
  const { limit = 20, offset = 0, priority, tags } = options;
  
  const where = { user_id: userId };
  
  if (priority !== undefined) {
    where.priority = priority;
  }
  
  if (tags && tags.length > 0) {
    where.tags = {
      [sequelize.Sequelize.Op.overlap]: tags
    };
  }
  
  return this.findAndCountAll({
    where,
    limit,
    offset,
    include: [{
      model: require('./Chord'),
      as: 'chord'
    }],
    order: [['priority', 'DESC'], ['created_at', 'DESC']]
  });
};

/**
 * Check if user has favorited a chord
 */
Favorite.isUserFavorite = async function(userId, chordId) {
  const favorite = await this.findOne({
    where: { user_id: userId, chord_id: chordId }
  });
  return !!favorite;
};

/**
 * Toggle favorite status
 */
Favorite.toggleFavorite = async function(userId, chordId, options = {}) {
  const { notes, priority = 0 } = options;
  
  const existing = await this.findOne({
    where: { user_id: userId, chord_id: chordId }
  });
  
  if (existing) {
    await existing.destroy();
    return { action: 'removed', favorite: null };
  } else {
    const favorite = await this.create({
      user_id: userId,
      chord_id: chordId,
      notes,
      priority
    });
    return { action: 'added', favorite };
  }
};

/**
 * Get popular chords (most favorited)
 */
Favorite.getPopularChords = function(limit = 10) {
  return this.findAll({
    attributes: [
      'chord_id',
      [sequelize.fn('COUNT', sequelize.col('chord_id')), 'favorite_count']
    ],
    group: ['chord_id'],
    order: [[sequelize.literal('favorite_count'), 'DESC']],
    limit,
    include: [{
      model: require('./Chord'),
      as: 'chord',
      attributes: ['id', 'title', 'artist', 'category']
    }]
  });
};

module.exports = Favorite; 