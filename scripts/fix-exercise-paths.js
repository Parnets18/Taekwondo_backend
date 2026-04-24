/**
 * Script to fix exercise image and video paths (add leading slash)
 * Run with: node scripts/fix-exercise-paths.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ProgramExercise = require('../models/ProgramExercise');

async function fixExercisePaths() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const exercises = await ProgramExercise.find();
    console.log(`🏋️ Found ${exercises.length} exercises\n`);

    let fixedCount = 0;

    for (const exercise of exercises) {
      const updates = {};
      let needsUpdate = false;

      // Fix image path
      if (exercise.image && !exercise.image.startsWith('/') && !exercise.image.startsWith('http')) {
        updates.image = '/' + exercise.image;
        needsUpdate = true;
        console.log(`Fixing image path for "${exercise.name}":`);
        console.log(`  Before: ${exercise.image}`);
        console.log(`  After:  ${updates.image}`);
      }

      // Fix video path
      if (exercise.videoUrl && !exercise.videoUrl.startsWith('/') && !exercise.videoUrl.startsWith('http')) {
        updates.videoUrl = '/' + exercise.videoUrl;
        needsUpdate = true;
        console.log(`Fixing video path for "${exercise.name}":`);
        console.log(`  Before: ${exercise.videoUrl}`);
        console.log(`  After:  ${updates.videoUrl}`);
      }

      if (needsUpdate) {
        await ProgramExercise.findByIdAndUpdate(exercise._id, updates);
        fixedCount++;
        console.log(`  ✅ Fixed!\n`);
      }
    }

    console.log('📊 Summary:');
    console.log(`   - Total exercises: ${exercises.length}`);
    console.log(`   - Fixed: ${fixedCount}`);

    if (fixedCount > 0) {
      console.log('\n✅ Paths have been fixed! Restart your backend server.');
    } else {
      console.log('\n✅ All paths are correct!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixExercisePaths();
