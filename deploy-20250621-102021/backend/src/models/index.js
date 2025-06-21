/**
 * Models Index
 * Enterprise-level model associations and database management
 */

const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Import all models
const User = require('./User');
const Chord = require('./Chord');
const Favorite = require('./Favorite');

// Store models in an object for easy access and relationship setup
const models = {
  User,
  Chord,
  Favorite
};

/**
 * Define Model Associations
 */

// User <-> Chord (One-to-Many: User has many Chords)
User.hasMany(Chord, {
  foreignKey: 'user_id',
  as: 'chords',
  onDelete: 'SET NULL' // Keep chords when user is deleted, but set user_id to null
});

Chord.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  allowNull: true
});

// User <-> Favorite (One-to-Many: User has many Favorites)
User.hasMany(Favorite, {
  foreignKey: 'user_id',
  as: 'favorites',
  onDelete: 'CASCADE' // Delete favorites when user is deleted
});

Favorite.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Chord <-> Favorite (One-to-Many: Chord has many Favorites)
Chord.hasMany(Favorite, {
  foreignKey: 'chord_id',
  as: 'favorites',
  onDelete: 'CASCADE' // Delete favorites when chord is deleted
});

Favorite.belongsTo(Chord, {
  foreignKey: 'chord_id',
  as: 'chord'
});

// User <-> Chord (Many-to-Many through Favorites)
User.belongsToMany(Chord, {
  through: Favorite,
  foreignKey: 'user_id',
  otherKey: 'chord_id',
  as: 'favoriteChords'
});

Chord.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'chord_id',
  otherKey: 'user_id',
  as: 'favoritedByUsers'
});

/**
 * Database Seeders
 */
const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    // Check if admin user already exists
    const adminExists = await User.findOne({ where: { email: 'admin@catcifras.com' } });
    
    if (!adminExists) {
      // Create default admin user
      const adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@catcifras.com',
        password: 'Admin123!@#', // Will be hashed by model hook
        role: 'master',
        status: 'active',
        email_verified_at: new Date()
      });
      
      logger.info('✅ Admin user created:', { id: adminUser.id, email: adminUser.email });
      
      // Create sample chords
      const sampleChords = [
        {
          title: 'Amazing Grace',
          artist: 'Traditional',
          composer: 'John Newton',
          key: 'G',
          category: 'adoration',
          lyrics: `[Verse 1]
G                    C           G
Amazing grace! How sweet the sound
                    D
That saved a wretch like me!
G                    C           G
I once was lost, but now am found;
                    D         G
Was blind, but now I see.

[Verse 2]
G                    C           G
'Twas grace that taught my heart to fear,
                    D
And grace my fears relieved;
G                    C           G
How precious did that grace appear
                    D         G
The hour I first believed.`,
          difficulty: 'easy',
          bpm: 80,
          duration: '4:30',
          user_id: adminUser.id,
          review_status: 'approved',
          status: 'active',
          featured: true,
          tags: ['traditional', 'hymn', 'grace', 'salvation']
        },
        {
          title: 'How Great Thou Art',
          artist: 'Carl Boberg',
          composer: 'Carl Boberg',
          key: 'C',
          category: 'adoration',
          lyrics: `[Verse 1]
C                    F           C
O Lord my God, when I in awesome wonder
                    G
Consider all the worlds Thy hands have made
C                    F           C
I see the stars, I hear the rolling thunder
                    G         C
Thy power throughout the universe displayed

[Chorus]
C                    F           C
Then sings my soul, my Savior God, to Thee
                    G
How great Thou art! How great Thou art!`,
          difficulty: 'medium',
          bpm: 75,
          duration: '3:45',
          user_id: adminUser.id,
          review_status: 'approved',
          status: 'active',
          featured: true,
          tags: ['hymn', 'worship', 'praise', 'traditional']
        }
      ];
      
      for (const chordData of sampleChords) {
        const chord = await Chord.create(chordData);
        logger.info('✅ Sample chord created:', { id: chord.id, title: chord.title });
      }
    } else {
      logger.info('ℹ️  Admin user already exists, skipping seeding');
    }
    
    logger.info('✅ Database seeding completed');
    
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Synchronize Database
 */
const syncDatabase = async (options = {}) => {
  const { force = false, alter = false } = options;
  
  try {
    logger.info('🔄 Synchronizing database models...');
    
    // Sync all models
    await sequelize.sync({ force, alter });
    
    logger.info('✅ Database models synchronized successfully');
    
    // Run seeders if force is true or in development
    if (force || process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

/**
 * Get Database Statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = await Promise.all([
      User.count(),
      Chord.count(),
      Favorite.count(),
      User.count({ where: { role: 'admin' } }),
      Chord.count({ where: { review_status: 'approved' } })
    ]);
    
    return {
      totalUsers: stats[0],
      totalChords: stats[1],
      totalFavorites: stats[2],
      adminUsers: stats[3],
      approvedChords: stats[4]
    };
  } catch (error) {
    logger.error('❌ Error getting database stats:', error);
    throw error;
  }
};

/**
 * Clean up database (remove soft-deleted records)
 */
const cleanupDatabase = async () => {
  try {
    logger.info('🧹 Starting database cleanup...');
    
    // Force delete soft-deleted records older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const cleanupResults = await Promise.all([
      User.destroy({
        where: {
          deleted_at: {
            [sequelize.Sequelize.Op.lt]: thirtyDaysAgo
          }
        },
        force: true
      }),
      Chord.destroy({
        where: {
          deleted_at: {
            [sequelize.Sequelize.Op.lt]: thirtyDaysAgo
          }
        },
        force: true
      })
    ]);
    
    logger.info('✅ Database cleanup completed:', {
      deletedUsers: cleanupResults[0],
      deletedChords: cleanupResults[1]
    });
    
    return {
      deletedUsers: cleanupResults[0],
      deletedChords: cleanupResults[1]
    };
  } catch (error) {
    logger.error('❌ Database cleanup failed:', error);
    throw error;
  }
};

/**
 * Export models and functions
 */
module.exports = {
  // Models
  User,
  Chord,
  Favorite,
  
  // Database management functions
  syncDatabase,
  seedDatabase,
  getDatabaseStats,
  cleanupDatabase,
  
  // Sequelize instance
  sequelize,
  
  // All models object
  models
}; 