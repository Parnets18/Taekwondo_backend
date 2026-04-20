const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taekwondo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updatePatternNames() {
  try {
    console.log('🔧 Updating pattern names in database...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('patternslides');
    
    // Find the "Sort by patterns" slide
    const slide = await collection.findOne({ 
      slide: 'non-standard-list', 
      title: 'Sort by patterns' 
    });
    
    if (slide && slide.points) {
      let updated = false;
      
      // Update each point's patternEntries to include pattern name
      slide.points.forEach(point => {
        if (point.patternEntries && point.patternEntries.length > 0) {
          point.patternEntries.forEach(entry => {
            if (!entry.patternName || entry.patternName.trim() === '') {
              entry.patternName = point.text; // Use point text as pattern name
              updated = true;
            }
          });
        }
      });
      
      if (updated) {
        await collection.updateOne(
          { _id: slide._id },
          { $set: { points: slide.points } }
        );
        console.log('✅ Pattern names updated successfully!');
      } else {
        console.log('ℹ️ No updates needed - pattern names already exist');
      }
    } else {
      console.log('❌ Could not find "Sort by patterns" slide');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error updating pattern names:', error);
    mongoose.connection.close();
  }
}

updatePatternNames();