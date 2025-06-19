/**
 * Chords Controller
 * Enterprise-level chord management with advanced search and features
 */

const { Chord, User, Favorite } = require('../models');
const { AppError } = require('../middleware/error-handler');
const { Op } = require('sequelize');

/**
 * Get all chords with advanced filtering
 */
const getChords = async (req, res, next) => {
  try {
    const {
      q, category, difficulty, key, artist, tags, featured, status,
      page, limit, sortBy, sortOrder
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    // Search query
    if (q) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { artist: { [Op.iLike]: `%${q}%` } },
        { lyrics: { [Op.iLike]: `%${q}%` } }
      ];
    }
    
    // Filters
    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;
    if (key) whereClause.key = key;
    if (artist) whereClause.artist = { [Op.iLike]: `%${artist}%` };
    if (featured !== undefined) whereClause.featured = featured;
    if (status) whereClause.status = status;
    
    // Tags filter
    if (tags && tags.length > 0) {
      whereClause.tags = { [Op.overlap]: tags };
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Sorting
    const validSortFields = ['title', 'artist', 'createdAt', 'updatedAt', 'viewCount', 'favoriteCount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder.toUpperCase()]];

    // Execute query
    const { count, rows: chords } = await Chord.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
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

    req.logger.info('Chords retrieved successfully', {
      count,
      page,
      limit,
      filters: { q, category, difficulty, key, artist, tags, featured, status }
    });

    res.json({
      success: true,
      data: {
        chords,
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
    req.logger.error('Failed to retrieve chords', {
      error: error.message,
      query: req.query
    });
    next(error);
  }
};

/**
 * Get single chord by ID
 */
const getChord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const chord = await Chord.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!chord) {
      throw new AppError('Chord not found', 404, 'CHORD_NOT_FOUND');
    }

    // Check if user can view this chord
    if (chord.status !== 'published' && chord.userId !== userId && !req.user?.hasRole('admin')) {
      throw new AppError('Chord not found', 404, 'CHORD_NOT_FOUND');
    }

    // Increment view count
    await chord.increment('viewCount');

    // Check if user has favorited this chord
    let isFavorited = false;
    if (userId) {
      const favorite = await Favorite.findOne({
        where: { userId, chordId: id }
      });
      isFavorited = !!favorite;
    }

    req.logger.info('Chord retrieved successfully', {
      chordId: chord.id,
      title: chord.title,
      userId: userId || 'anonymous'
    });

    res.json({
      success: true,
      data: {
        chord: {
          ...chord.toJSON(),
          isFavorited
        }
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve chord', {
      error: error.message,
      chordId: req.params.id,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Create new chord
 */
const createChord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chordData = {
      ...req.body,
      userId,
      status: 'published' // Default to published for now
    };

    const chord = await Chord.create(chordData);

    // Load the chord with author information
    const createdChord = await Chord.findByPk(chord.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    req.logger.info('Chord created successfully', {
      chordId: chord.id,
      title: chord.title,
      userId,
      category: chord.category
    });

    res.status(201).json({
      success: true,
      message: 'Chord created successfully',
      data: {
        chord: createdChord
      }
    });

  } catch (error) {
    req.logger.error('Failed to create chord', {
      error: error.message,
      userId: req.user?.id,
      data: req.body
    });
    next(error);
  }
};

/**
 * Update chord
 */
const updateChord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const chord = await Chord.findByPk(id);

    if (!chord) {
      throw new AppError('Chord not found', 404, 'CHORD_NOT_FOUND');
    }

    // Check permissions
    if (chord.userId !== userId && !req.user.hasRole('admin')) {
      throw new AppError('You can only update your own chords', 403, 'UNAUTHORIZED_UPDATE');
    }

    // Update chord
    await chord.update(updateData);

    // Load updated chord with author information
    const updatedChord = await Chord.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    req.logger.info('Chord updated successfully', {
      chordId: chord.id,
      title: chord.title,
      userId,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Chord updated successfully',
      data: {
        chord: updatedChord
      }
    });

  } catch (error) {
    req.logger.error('Failed to update chord', {
      error: error.message,
      chordId: req.params.id,
      userId: req.user?.id,
      data: req.body
    });
    next(error);
  }
};

/**
 * Delete chord
 */
const deleteChord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chord = await Chord.findByPk(id);

    if (!chord) {
      throw new AppError('Chord not found', 404, 'CHORD_NOT_FOUND');
    }

    // Check permissions
    if (chord.userId !== userId && !req.user.hasRole('admin')) {
      throw new AppError('You can only delete your own chords', 403, 'UNAUTHORIZED_DELETE');
    }

    // Delete chord
    await chord.destroy();

    req.logger.info('Chord deleted successfully', {
      chordId: chord.id,
      title: chord.title,
      userId
    });

    res.json({
      success: true,
      message: 'Chord deleted successfully'
    });

  } catch (error) {
    req.logger.error('Failed to delete chord', {
      error: error.message,
      chordId: req.params.id,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Get featured chords
 */
const getFeaturedChords = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const chords = await Chord.findAll({
      where: {
        featured: true,
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    req.logger.info('Featured chords retrieved', {
      count: chords.length,
      limit
    });

    res.json({
      success: true,
      data: {
        chords
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve featured chords', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Get popular chords
 */
const getPopularChords = async (req, res, next) => {
  try {
    const { limit = 10, period = 'all' } = req.query;

    let whereClause = { status: 'published' };

    // Filter by time period
    if (period !== 'all') {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        whereClause.createdAt = { [Op.gte]: startDate };
      }
    }

    const chords = await Chord.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [
        ['viewCount', 'DESC'],
        ['favoriteCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit)
    });

    req.logger.info('Popular chords retrieved', {
      count: chords.length,
      period,
      limit
    });

    res.json({
      success: true,
      data: {
        chords
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve popular chords', {
      error: error.message,
      period: req.query.period
    });
    next(error);
  }
};

/**
 * Get recent chords
 */
const getRecentChords = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const chords = await Chord.findAll({
      where: { status: 'published' },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    req.logger.info('Recent chords retrieved', {
      count: chords.length,
      limit
    });

    res.json({
      success: true,
      data: {
        chords
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve recent chords', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Get chord categories with counts
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Chord.findAll({
      where: { status: 'published' },
      attributes: [
        'category',
        [Chord.sequelize.fn('COUNT', Chord.sequelize.col('category')), 'count']
      ],
      group: ['category'],
      order: [[Chord.sequelize.fn('COUNT', Chord.sequelize.col('category')), 'DESC']]
    });

    req.logger.info('Chord categories retrieved', {
      categoriesCount: categories.length
    });

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve chord categories', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Get chord statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Total chords
      Chord.count({ where: { status: 'published' } }),
      
      // Total artists
      Chord.count({
        where: { status: 'published' },
        distinct: true,
        col: 'artist'
      }),
      
      // Total views
      Chord.sum('viewCount', { where: { status: 'published' } }),
      
      // Total favorites
      Chord.sum('favoriteCount', { where: { status: 'published' } }),
      
      // Categories distribution
      Chord.findAll({
        where: { status: 'published' },
        attributes: [
          'category',
          [Chord.sequelize.fn('COUNT', Chord.sequelize.col('category')), 'count']
        ],
        group: ['category'],
        order: [[Chord.sequelize.fn('COUNT', Chord.sequelize.col('category')), 'DESC']]
      }),
      
      // Difficulties distribution
      Chord.findAll({
        where: { status: 'published' },
        attributes: [
          'difficulty',
          [Chord.sequelize.fn('COUNT', Chord.sequelize.col('difficulty')), 'count']
        ],
        group: ['difficulty'],
        order: [[Chord.sequelize.fn('COUNT', Chord.sequelize.col('difficulty')), 'DESC']]
      })
    ]);

    const [
      totalChords,
      totalArtists,
      totalViews,
      totalFavorites,
      categoriesDistribution,
      difficultiesDistribution
    ] = stats;

    const statistics = {
      totals: {
        chords: totalChords || 0,
        artists: totalArtists || 0,
        views: totalViews || 0,
        favorites: totalFavorites || 0
      },
      distributions: {
        categories: categoriesDistribution,
        difficulties: difficultiesDistribution
      }
    };

    req.logger.info('Chord statistics retrieved', {
      totalChords,
      totalArtists
    });

    res.json({
      success: true,
      data: {
        statistics
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve chord statistics', {
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  getChords,
  getChord,
  createChord,
  updateChord,
  deleteChord,
  getFeaturedChords,
  getPopularChords,
  getRecentChords,
  getCategories,
  getStatistics
}; 