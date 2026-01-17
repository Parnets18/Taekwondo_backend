require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventParticipant = require('../models/EventParticipant');

async function syncParticipantCounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all events
    const events = await Event.find();
    console.log(`📋 Found ${events.length} events to sync`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const event of events) {
      try {
        // Count actual participants for this event
        const actualCount = await EventParticipant.countDocuments({ event: event._id });
        
        // Check if count needs updating
        if (event.currentParticipants !== actualCount) {
          console.log(`🔄 Event "${event.name}": ${event.currentParticipants} → ${actualCount}`);
          
          // Update the event
          event.currentParticipants = actualCount;
          await event.save();
          updatedCount++;
        } else {
          console.log(`✅ Event "${event.name}": ${actualCount} (already correct)`);
        }
      } catch (error) {
        console.error(`❌ Error syncing event "${event.name}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   Total events: ${events.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Already correct: ${events.length - updatedCount - errorCount}`);
    
    console.log('\n✅ Sync completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncParticipantCounts();
