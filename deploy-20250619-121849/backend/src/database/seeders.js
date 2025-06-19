/**
 * Database Seeders
 * Enterprise-level database seeding for initial data
 */

const logger = require('../utils/logger');

/**
 * Run all seeders
 */
const run = async () => {
  try {
    logger.info('🌱 Running database seeders...');
    
    // Import models
    const { User, Chord } = require('../models');
    
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

module.exports = {
  run
}; 