/**
 * Favorites Controller
 * Enterprise-level favorites management with organization features
 */

const { Favorite, Chord, User } = require('../models');
const { AppError } = require('../middleware/error-handler');
const { Op } = require('sequelize');

/**
 * Get user's favorites with filtering and sorting
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      category, difficulty, key, tags, priority, notes,
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    // Build where clause for favorites
    const favoritesWhere = { userId };

    // Build where clause for chords
    const chordsWhere = {};
    if (category) chordsWhere.category = category;
    if (difficulty) chordsWhere.difficulty = difficulty;
    if (key) chordsWhere.key = key;

    // Tags filter
    if (tags && tags.length > 0) {
      chordsWhere.tags = { [Op.overlap]: tags };
    }

    // Favorites specific filters
    if (priority) favoritesWhere.priority = priority;
    if (notes) favoritesWhere.notes = { [Op.iLike]: `%${notes}%` };

    // Pagination
    const offset = (page - 1) * limit;

    // Sorting
    const validSortFields = ['createdAt', 'priority', 'title', 'artist'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    let order;
    if (sortField === 'title' || sortField === 'artist') {
      order = [[{ model: Chord, as: 'chord' }, sortField, sortOrder.toUpperCase()]];
    } else {
      order = [[sortField, sortOrder.toUpperCase()]];
    }

    // Execute query
    const { count, rows: favorites } = await Favorite.findAndCountAll({
      where: favoritesWhere,
      include: [
        {
          model: Chord,
          as: 'chord',
          where: chordsWhere,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    req.logger.info('Favorites retrieved successfully', {
      userId,
      count,
      page,
      limit,
      filters: { category, difficulty, key, tags, priority, notes }
    });

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve favorites', {
      error: error.message,
      userId: req.user?.id,
      query: req.query
    });
    next(error);
  }
};

/**
 * Add chord to favorites
 */
const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chordId } = req.params;
    const { tags = [], priority = 'medium', notes = '' } = req.body;

    // Check if chord exists
    const chord = await Chord.findByPk(chordId);
    if (!chord) {
      throw new AppError('Chord not found', 404, 'CHORD_NOT_FOUND');
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: { userId, chordId }
    });

    if (existingFavorite) {
      throw new AppError('Chord is already in favorites', 409, 'ALREADY_FAVORITED');
    }

    // Create favorite
    const favorite = await Favorite.create({
      userId,
      chordId,
      tags,
      priority,
      notes
    });

    // Increment favorite count on chord
    await chord.increment('favoriteCount');

    // Load favorite with chord details
    const createdFavorite = await Favorite.findByPk(favorite.id, {
      include: [
        {
          model: Chord,
          as: 'chord',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    req.logger.info('Chord added to favorites', {
      userId,
      chordId,
      favoriteId: favorite.id,
      priority,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Chord added to favorites successfully',
      data: {
        favorite: createdFavorite
      }
    });

  } catch (error) {
    req.logger.error('Failed to add favorite', {
      error: error.message,
      userId: req.user?.id,
      chordId: req.params.chordId,
      data: req.body
    });
    next(error);
  }
};

/**
 * Update favorite
 */
const updateFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const favorite = await Favorite.findOne({
      where: { id, userId }
    });

    if (!favorite) {
      throw new AppError('Favorite not found', 404, 'FAVORITE_NOT_FOUND');
    }

    // Update favorite
    await favorite.update(updateData);

    // Load updated favorite with chord details
    const updatedFavorite = await Favorite.findByPk(id, {
      include: [
        {
          model: Chord,
          as: 'chord',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    req.logger.info('Favorite updated successfully', {
      userId,
      favoriteId: id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Favorite updated successfully',
      data: {
        favorite: updatedFavorite
      }
    });

  } catch (error) {
    req.logger.error('Failed to update favorite', {
      error: error.message,
      userId: req.user?.id,
      favoriteId: req.params.id,
      data: req.body
    });
    next(error);
  }
};

/**
 * Remove favorite
 */
const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chordId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, chordId }
    });

    if (!favorite) {
      throw new AppError('Favorite not found', 404, 'FAVORITE_NOT_FOUND');
    }

    // Remove favorite
    await favorite.destroy();

    // Decrement favorite count on chord
    const chord = await Chord.findByPk(chordId);
    if (chord) {
      await chord.decrement('favoriteCount');
    }

    req.logger.info('Favorite removed successfully', {
      userId,
      chordId,
      favoriteId: favorite.id
    });

    res.json({
      success: true,
      message: 'Favorite removed successfully'
    });

  } catch (error) {
    req.logger.error('Failed to remove favorite', {
      error: error.message,
      userId: req.user?.id,
      chordId: req.params.chordId
    });
    next(error);
  }
};

/**
 * Get favorite by ID
 */
const getFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const favorite = await Favorite.findOne({
      where: { id, userId },
      include: [
        {
          model: Chord,
          as: 'chord',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!favorite) {
      throw new AppError('Favorite not found', 404, 'FAVORITE_NOT_FOUND');
    }

    req.logger.info('Favorite retrieved successfully', {
      userId,
      favoriteId: id
    });

    res.json({
      success: true,
      data: {
        favorite
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve favorite', {
      error: error.message,
      userId: req.user?.id,
      favoriteId: req.params.id
    });
    next(error);
  }
};

/**
 * Get favorite tags
 */
const getFavoriteTags = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      attributes: ['tags']
    });

    // Extract all unique tags
    const allTags = favorites.reduce((acc, favorite) => {
      if (favorite.tags && Array.isArray(favorite.tags)) {
        acc.push(...favorite.tags);
      }
      return acc;
    }, []);

    const uniqueTags = [...new Set(allTags)];

    // Count occurrences
    const tagsWithCount = uniqueTags.map(tag => ({
      tag,
      count: allTags.filter(t => t === tag).length
    }));

    // Sort by count descending
    tagsWithCount.sort((a, b) => b.count - a.count);

    req.logger.info('Favorite tags retrieved', {
      userId,
      uniqueTagsCount: uniqueTags.length,
      totalTags: allTags.length
    });

    res.json({
      success: true,
      data: {
        tags: tagsWithCount
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve favorite tags', {
      error: error.message,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Get favorites statistics
 */
const getFavoriteStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Promise.all([
      // Total favorites
      Favorite.count({ where: { userId } }),
      
      // Favorites by priority
      Favorite.findAll({
        where: { userId },
        attributes: [
          'priority',
          [Favorite.sequelize.fn('COUNT', Favorite.sequelize.col('priority')), 'count']
        ],
        group: ['priority']
      }),
      
      // Favorites by category (through chord)
      Favorite.findAll({
        where: { userId },
        include: [
          {
            model: Chord,
            as: 'chord',
            attributes: []
          }
        ],
        attributes: [
          [Favorite.sequelize.col('chord.category'), 'category'],
          [Favorite.sequelize.fn('COUNT', Favorite.sequelize.col('chord.category')), 'count']
        ],
        group: ['chord.category'],
        raw: true
      }),
      
      // Recent favorites (last 7 days)
      Favorite.count({
        where: {
          userId,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const [
      totalFavorites,
      priorityDistribution,
      categoryDistribution,
      recentFavorites
    ] = stats;

    const statistics = {
      total: totalFavorites,
      recent: recentFavorites,
      distributions: {
        priority: priorityDistribution,
        category: categoryDistribution
      }
    };

    req.logger.info('Favorite statistics retrieved', {
      userId,
      totalFavorites,
      recentFavorites
    });

    res.json({
      success: true,
      data: {
        statistics
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve favorite statistics', {
      error: error.message,
      userId: req.user?.id
    });
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  updateFavorite,
  removeFavorite,
  getFavorite,
  getFavoriteTags,
  getFavoriteStats
}; 