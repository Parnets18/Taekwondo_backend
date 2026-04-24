/**
 * Script to fix program exercises that might have missing programId or programTitle
 * Run with: node scripts/fix-program-exercises.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Program = require('../models/Program');
const ProgramExercise = require('../models/ProgramExercise');

async function fixProgramExercises() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all programs
    const programs = await Program.find();
    console.log(`📋 Found ${programs.length} programs:`);
    programs.forEach(p => {
      console.log(`   - ${p.title} (ID: ${p._id})`);
    });
    console.log('');

    // Get all exercises
    const exercises = await ProgramExercise.find();
    console.log(`🏋️ Found ${exercises.length} exercises:\n`);

    let fixedCount = 0;
    let issuesFound = 0;

    for (const exercise of exercises) {
      console.log(`Checking: "${exercise.name}"`);
      console.log(`  - programId: ${exercise.programId || '❌ MISSING'}`);
      console.log(`  - programTitle: ${exercise.programTitle || '❌ MISSING'}`);
      console.log(`  - section: ${exercise.section}`);
      console.log(`  - equipment: ${exercise.equipment}`);
      console.log(`  - level: ${exercise.level}`);
      console.log(`  - image: ${exercise.image || 'none'}`);
      console.log(`  - videoUrl: ${exercise.videoUrl || 'none'}`);

      let needsUpdate = false;
      const updates = {};

      // If programTitle is set but programId is missing, try to find the program
      if (exercise.programTitle && !exercise.programId) {
        const program = programs.find(p => p.title === exercise.programTitle);
        if (program) {
          updates.programId = program._id;
          needsUpdate = true;
          console.log(`  ✅ Will set programId to: ${program._id}`);
        } else {
          console.log(`  ⚠️  Program "${exercise.programTitle}" not found!`);
          issuesFound++;
        }
      }

      // If programId is set but programTitle is missing, set it
      if (exercise.programId && !exercise.programTitle) {
        const program = programs.find(p => p._id.toString() === exercise.programId.toString());
        if (program) {
          updates.programTitle = program.title;
          needsUpdate = true;
          console.log(`  ✅ Will set programTitle to: ${program.title}`);
        } else {
          console.log(`  ⚠️  Program with ID "${exercise.programId}" not found!`);
          issuesFound++;
        }
      }

      // If neither is set, flag as issue
      if (!exercise.programId && !exercise.programTitle) {
        console.log(`  ⚠️  No program association found!`);
        issuesFound++;
      }

      // Apply updates if needed
      if (needsUpdate) {
        await ProgramExercise.findByIdAndUpdate(exercise._id, updates);
        fixedCount++;
        console.log(`  ✅ Fixed!`);
      }

      console.log('');
    }

    console.log('\n📊 Summary:');
    console.log(`   - Total exercises: ${exercises.length}`);
    console.log(`   - Fixed: ${fixedCount}`);
    console.log(`   - Issues found: ${issuesFound}`);

    if (issuesFound > 0) {
      console.log('\n⚠️  Some exercises have issues. You may need to manually assign them to programs in the admin panel.');
    }

    if (fixedCount > 0) {
      console.log('\n✅ Exercises have been fixed! Restart your backend server and test the app.');
    } else {
      console.log('\n✅ All exercises are properly configured!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixProgramExercises();
