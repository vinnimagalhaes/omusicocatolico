/**
 * Users Controller
 * Enterprise-level user management with admin features
 */

const { User, Chord, Favorite } = require('../models');
const { AppError } = require('../middleware/error-handler');
const { Op } = require('sequelize');

/**
 * Get all users (admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      q, role, status, emailVerified,
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search query
    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Filters
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (emailVerified !== undefined) whereClause.emailVerified = emailVerified;

    // Pagination
    const offset = (page - 1) * limit;

    // Sorting
    const validSortFields = ['name', 'email', 'role', 'status', 'createdAt', 'lastLoginAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder.toUpperCase()]];

    // Execute query
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'passwordResetToken', 'emailVerificationToken'] },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    req.logger.info('Users retrieved successfully', {
      adminId: req.user.id,
      count,
      page,
      limit,
      filters: { q, role, status, emailVerified }
    });

    res.json({
      success: true,
      data: {
        users,
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
    req.logger.error('Failed to retrieve users', {
      error: error.message,
      adminId: req.user?.id,
      query: req.query
    });
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;
    const isAdmin = req.user.hasRole('admin');

    // Check if user can access this profile
    if (parseInt(id) !== requestingUserId && !isAdmin) {
      throw new AppError('You can only access your own profile', 403, 'UNAUTHORIZED_ACCESS');
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'passwordResetToken', 'emailVerificationToken'] },
      include: [
        {
          model: Chord,
          as: 'chords',
          attributes: ['id', 'title', 'artist', 'category', 'createdAt', 'viewCount', 'favoriteCount'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Favorite,
          as: 'favorites',
          attributes: ['id', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Chord,
              as: 'chord',
              attributes: ['id', 'title', 'artist', 'category']
            }
          ]
        }
      ]
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    req.logger.info('User retrieved successfully', {
      userId: user.id,
      requestingUserId,
      isAdmin
    });

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve user', {
      error: error.message,
      userId: req.params.id,
      requestingUserId: req.user?.id
    });
    next(error);
  }
};

/**
 * Update user (admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Prevent updating password through this endpoint
    delete updateData.password;

    // Update user
    await user.update(updateData);

    // Get updated user without sensitive data
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password', 'passwordResetToken', 'emailVerificationToken'] }
    });

    req.logger.info('User updated successfully', {
      userId: user.id,
      adminId: req.user.id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    req.logger.error('Failed to update user', {
      error: error.message,
      userId: req.params.id,
      adminId: req.user?.id,
      data: req.body
    });
    next(error);
  }
};

/**
 * Delete user (admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      throw new AppError('You cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
    }

    // Delete user (this will cascade to related records)
    await user.destroy();

    req.logger.info('User deleted successfully', {
      userId: user.id,
      userEmail: user.email,
      adminId: req.user.id
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    req.logger.error('Failed to delete user', {
      error: error.message,
      userId: req.params.id,
      adminId: req.user?.id
    });
    next(error);
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;
    const isAdmin = req.user.hasRole('admin');

    // Check if user can access these stats
    if (parseInt(id) !== requestingUserId && !isAdmin) {
      throw new AppError('You can only access your own statistics', 403, 'UNAUTHORIZED_ACCESS');
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const stats = await Promise.all([
      // Total chords created
      Chord.count({ where: { userId: id } }),
      
      // Total favorites
      Favorite.count({ where: { userId: id } }),
      
      // Total views on user's chords
      Chord.sum('viewCount', { where: { userId: id } }),
      
      // Total favorites on user's chords
      Chord.sum('favoriteCount', { where: { userId: id } }),
      
      // Chords by category
      Chord.findAll({
        where: { userId: id },
        attributes: [
          'category',
          [Chord.sequelize.fn('COUNT', Chord.sequelize.col('category')), 'count']
        ],
        group: ['category'],
        order: [[Chord.sequelize.fn('COUNT', Chord.sequelize.col('category')), 'DESC']]
      }),
      
      // Recent activity (chords created in last 30 days)
      Chord.count({
        where: {
          userId: id,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Recent favorites (last 30 days)
      Favorite.count({
        where: {
          userId: id,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const [
      totalChords,
      totalFavorites,
      totalViews,
      totalFavoritesReceived,
      chordsByCategory,
      recentChords,
      recentFavorites
    ] = stats;

    const statistics = {
      totals: {
        chords: totalChords || 0,
        favorites: totalFavorites || 0,
        views: totalViews || 0,
        favoritesReceived: totalFavoritesReceived || 0
      },
      recent: {
        chords: recentChords || 0,
        favorites: recentFavorites || 0
      },
      distributions: {
        chordsByCategory
      }
    };

    req.logger.info('User statistics retrieved', {
      userId: id,
      requestingUserId,
      isAdmin
    });

    res.json({
      success: true,
      data: {
        statistics
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve user statistics', {
      error: error.message,
      userId: req.params.id,
      requestingUserId: req.user?.id
    });
    next(error);
  }
};

/**
 * Get platform statistics (admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Total users
      User.count(),
      
      // Active users (logged in last 30 days)
      User.count({
        where: {
          lastLoginAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // New users (last 30 days)
      User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Users by role
      User.findAll({
        attributes: [
          'role',
          [User.sequelize.fn('COUNT', User.sequelize.col('role')), 'count']
        ],
        group: ['role']
      }),
      
      // Users by status
      User.findAll({
        attributes: [
          'status',
          [User.sequelize.fn('COUNT', User.sequelize.col('status')), 'count']
        ],
        group: ['status']
      }),
      
      // Email verification status
      User.findAll({
        attributes: [
          'emailVerified',
          [User.sequelize.fn('COUNT', User.sequelize.col('emailVerified')), 'count']
        ],
        group: ['emailVerified']
      }),
      
      // Total chords
      Chord.count(),
      
      // Total favorites
      Favorite.count()
    ]);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      usersByStatus,
      emailVerificationStats,
      totalChords,
      totalFavorites
    ] = stats;

    const statistics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers
      },
      content: {
        chords: totalChords,
        favorites: totalFavorites
      },
      distributions: {
        usersByRole,
        usersByStatus,
        emailVerification: emailVerificationStats
      }
    };

    req.logger.info('Platform statistics retrieved', {
      adminId: req.user.id,
      totalUsers,
      activeUsers,
      newUsers
    });

    res.json({
      success: true,
      data: {
        statistics
      }
    });

  } catch (error) {
    req.logger.error('Failed to retrieve platform statistics', {
      error: error.message,
      adminId: req.user?.id
    });
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getPlatformStats
}; 