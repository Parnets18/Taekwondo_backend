const mongoose = require('mongoose');
const DoJang = require('../models/DoJang');

// Connect to MongoDB
mongoose.connect('mongodb+srv://parnetstech18_db_user:PYnaogdmJCjrCff8@cluster0.qcgbejh.mongodb.net/Taekwon-do?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateDoJangData() {
  try {
    console.log('Starting Do Jang data migration...');
    
    // Find all Do Jang items with old structure (having points field but no headingPointGroups)
    const oldItems = await DoJang.find({
      $and: [
        { points: { $exists: true } },
        { headingPointGroups: { $exists: false } }
      ]
    });

    console.log(`Found ${oldItems.length} items with old structure`);

    for (const item of oldItems) {
      console.log(`Migrating item: ${item.title}`);
      
      // Convert old structure to new structure
      const headingPointGroups = [];
      
      if (item.points && item.points.length > 0) {
        headingPointGroups.push({
          heading: item.heading || '',
          points: item.points
        });
      }

      // Update the item
      await DoJang.findByIdAndUpdate(item._id, {
        headingPointGroups,
        $unset: { points: 1, heading: 1 } // Remove old fields
      });

      console.log(`✓ Migrated: ${item.title}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDoJangData();