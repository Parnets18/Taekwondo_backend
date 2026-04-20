const mongoose = require('mongoose');
const PatternSlide = require('../models/PatternSlide');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taekwondo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixPatternNames() {
  try {
    console.log('🔧 Fixing pattern names in non-standard-list slides...');
    
    // Find all non-standard-list slides
    const slides = await PatternSlide.find({ slide: 'non-standard-list' });
    
    for (const slide of slides) {
      let updated = false;
      
      if (slide.points && Array.isArray(slide.points)) {
        slide.points = slide.points.map(point => {
          if (point.patternEntries && Array.isArray(point.patternEntries) && point.patternEntries.length > 0) {
            // Add pattern name to entries that don't have it
            const updatedPatternEntries = point.patternEntries.map(entry => {
              if (!entry.patternName || entry.patternName.trim() === '') {
                updated = true;
                return {
                  ...entry,
                  patternName: point.text || ''
                };
              }
              return entry;
            });
            
            return {
              ...point,
              patternEntries: updatedPatternEntries
            };
          }
          return point;
        });
      }
      
      if (updated) {
        await slide.save();
        console.log(`✅ Updated slide: ${slide.title}`);
      }
    }
    
    console.log('🎉 Pattern names fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing pattern names:', error);
    process.exit(1);
  }
}

fixPatternNames();