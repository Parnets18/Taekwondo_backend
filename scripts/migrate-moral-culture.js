const mongoose = require('mongoose');
const MoralCulture = require('../models/MoralCulture');

// Connect to MongoDB
mongoose.connect('mongodb+srv://parnetstech18_db_user:PYnaogdmJCjrCff8@cluster0.qcgbejh.mongodb.net/Taekwon-do?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateMoralCultureData() {
  try {
    console.log('Starting Moral Culture data migration...');
    
    // Find all Moral Culture items with old structure (having points field but no headingPointGroups)
    const oldItems = await MoralCulture.find({
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
          heading: '', // No heading in old structure
          points: item.points
        });
      }

      // Update the item
      await MoralCulture.findByIdAndUpdate(item._id, {
        headingPointGroups,
        $unset: { points: 1 } // Remove old points field
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

migrateMoralCultureData();