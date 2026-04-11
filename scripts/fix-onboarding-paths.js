const mongoose = require('mongoose');
const OnboardingSlide = require('../models/OnboardingSlide');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixOnboardingPaths() {
  try {
    console.log('🔧 Fixing onboarding slide image paths...');
    
    const slides = await OnboardingSlide.find({ image: { $exists: true, $ne: null } });
    console.log(`📋 Found ${slides.length} slides with images`);
    
    let fixedCount = 0;
    
    for (const slide of slides) {
      if (slide.image && slide.image.includes('uploads') && !slide.image.startsWith('http')) {
        // Extract relative path from absolute path
        const uploadsIndex = slide.image.indexOf('uploads');
        if (uploadsIndex !== -1) {
          const relativePath = slide.image.substring(uploadsIndex).replace(/\\/g, '/');
          
          console.log(`🔄 Fixing: ${slide.image} -> ${relativePath}`);
          
          await OnboardingSlide.findByIdAndUpdate(slide._id, {
            image: relativePath
          });
          
          fixedCount++;
        }
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} onboarding slide paths`);
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing onboarding paths:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the migration
fixOnboardingPaths();