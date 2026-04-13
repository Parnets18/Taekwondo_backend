const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taekwondo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BasicTheoryContent = require('../models/BasicTheoryContent');

async function migrateBasicTheoryToGroups() {
  try {
    console.log('🔄 Starting Basic Theory migration to heading-point groups structure...');
    
    const items = await BasicTheoryContent.find({});
    console.log(`📊 Found ${items.length} Basic Theory items to migrate`);
    
    let migratedCount = 0;
    
    for (const item of items) {
      // Skip if already has headingPointGroups
      if (item.headingPointGroups && item.headingPointGroups.length > 0) {
        console.log(`⏭️  Skipping "${item.title}" - already has heading-point groups`);
        continue;
      }
      
      // Convert old points structure to heading-point groups
      if (item.points && item.points.length > 0) {
        const headingPointGroups = [{
          heading: '', // No heading for migrated items
          points: item.points.map(point => ({
            text: typeof point === 'string' ? point : point.text || '',
            description: '', // No description for migrated items
            details: typeof point === 'object' ? point.details || [] : []
          }))
        }];
        
        await BasicTheoryContent.findByIdAndUpdate(item._id, {
          headingPointGroups: headingPointGroups
        });
        
        console.log(`✅ Migrated "${item.title}" - converted ${item.points.length} points to heading-point groups`);
        migratedCount++;
      } else {
        // Create empty heading-point groups for items without points
        await BasicTheoryContent.findByIdAndUpdate(item._id, {
          headingPointGroups: []
        });
        
        console.log(`✅ Updated "${item.title}" - added empty heading-point groups`);
        migratedCount++;
      }
    }
    
    console.log(`🎉 Migration completed! Migrated ${migratedCount} items`);
    console.log('📝 Note: Old points structure is kept for backward compatibility');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateBasicTheoryToGroups();