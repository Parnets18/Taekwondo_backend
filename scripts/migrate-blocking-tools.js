const mongoose = require('mongoose');
const BodyPart = require('../models/BodyPart');

// Migration script to convert legacy blocking tools to hierarchical format
async function migrateBlockingTools() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taekwondo');
    console.log('Connected to MongoDB');

    // Find all blocking tools without hierarchical data
    const blockingTools = await BodyPart.find({
      category: 'blocking',
      $or: [
        { hierarchicalData: { $exists: false } },
        { hierarchicalData: { $size: 0 } },
        { hierarchicalData: null }
      ]
    });

    console.log(`Found ${blockingTools.length} blocking tools to migrate`);

    let migratedCount = 0;

    for (const tool of blockingTools) {
      if (tool.directions && tool.directions.length > 0 && tool.parts && tool.parts.length > 0) {
        // Convert legacy format to hierarchical format
        const hierarchicalData = tool.directions.map(direction => ({
          direction: direction,
          parts: tool.parts.map(part => ({
            part: part.part || '',
            methods: (part.methods || []).map(method => ({
              method: method.method || '',
              tools: method.tools || []
            }))
          }))
        }));

        // Update the document
        await BodyPart.findByIdAndUpdate(tool._id, {
          hierarchicalData: hierarchicalData
        });

        console.log(`Migrated: ${tool.name}`);
        migratedCount++;
      } else {
        console.log(`Skipped: ${tool.name} (no legacy data to convert)`);
      }
    }

    console.log(`Migration completed. ${migratedCount} tools migrated.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateBlockingTools();
}

module.exports = migrateBlockingTools;