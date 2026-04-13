const mongoose = require('mongoose');
const PracticeSuit = require('../models/PracticeSuit');

// Connect to MongoDB
mongoose.connect('mongodb+srv://parnetstech18_db_user:PYnaogdmJCjrCff8@cluster0.qcgbejh.mongodb.net/Taekwon-do?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migratePracticeSuitData() {
  try {
    console.log('Starting Practice Suit data migration...');
    
    // Find all Practice Suit items that have points but empty or missing headingPointGroups
    const oldItems = await PracticeSuit.find({
      $or: [
        { $and: [{ points: { $exists: true, $ne: [] } }, { headingPointGroups: { $exists: false } }] },
        { $and: [{ points: { $exists: true, $ne: [] } }, { headingPointGroups: { $size: 0 } }] }
      ]
    });

    console.log(`Found ${oldItems.length} items with old structure`);

    for (const item of oldItems) {
      console.log(`Migrating item: ${item.title || 'Untitled'}`);
      console.log(`Current points:`, item.points);
      
      // Convert old structure to new structure
      const headingPointGroups = [];
      
      if (item.points && item.points.length > 0) {
        headingPointGroups.push({
          heading: '', // No heading in old structure
          points: item.points
        });
      }

      console.log(`New headingPointGroups:`, headingPointGroups);

      // Update the item
      await PracticeSuit.findByIdAndUpdate(item._id, {
        headingPointGroups,
        $unset: { points: 1 } // Remove old points field
      });

      console.log(`✓ Migrated: ${item.title || 'Untitled'}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePracticeSuitData();