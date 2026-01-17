const Belt = require('../../models/Belt');

// Get all belt levels
const getBeltLevels = async (req, res) => {
  try {
    console.log('📋 Fetching belt levels...');
    console.log('📋 Query params:', req.query);
    
    const { isActive } = req.query;
    
    const filter = {};
    // Only filter by isActive if explicitly provided in query
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
      console.log('📋 Filtering by isActive:', filter.isActive);
    } else {
      // Default: only show active belts
      filter.isActive = true;
      console.log('📋 Default filter: isActive = true');
    }

    console.log('📋 Final filter:', filter);

    const belts = await Belt.find(filter)
      .sort({ level: 1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    console.log(`✅ Found ${belts.length} belt levels`);
    if (belts.length > 0) {
      console.log('📋 First belt:', belts[0].name, 'Level:', belts[0].level);
    }

    res.json({
      status: 'success',
      data: {
        belts
      }
    });
  } catch (error) {
    console.error('❌ Error fetching belt levels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt levels',
      error: error.message
    });
  }
};

// Get belt level by ID
const getBeltById = async (req, res) => {
  try {
    console.log(`📋 Fetching belt level: ${req.params.id}`);
    const belt = await Belt.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!belt) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt level not found'
      });
    }

    console.log(`✅ Found belt level: ${belt.name}`);

    res.json({
      status: 'success',
      data: { belt }
    });
  } catch (error) {
    console.error('❌ Error fetching belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt level',
      error: error.message
    });
  }
};

// Create new belt level
const createBelt = async (req, res) => {
  try {
    console.log('➕ Creating new belt level...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', req.user);
    
    const { name, level, color, hex, requirements } = req.body;

    // Check if belt level already exists
    const existingBelt = await Belt.findOne({ level });
    if (existingBelt) {
      console.log('⚠️ Belt level already exists:', existingBelt.name);
      return res.status(400).json({
        status: 'error',
        message: `Belt level ${level} already exists`
      });
    }

    const beltData = {
      name,
      level,
      color,
      hex,
      requirements: requirements || [],
      students: 0,
      isActive: true,  // Explicitly set to true
      createdBy: req.user?.id
    };

    console.log('💾 Creating belt with data:', JSON.stringify(beltData, null, 2));

    const belt = new Belt(beltData);
    await belt.save();

    console.log('✅ Belt saved to database with ID:', belt._id);

    const populatedBelt = await Belt.findById(belt._id)
      .populate('createdBy', 'name email');

    console.log('✅ Created belt level:', populatedBelt.name, 'Level:', populatedBelt.level);

    res.status(201).json({
      status: 'success',
      message: 'Belt level created successfully',
      data: { belt: populatedBelt }
    });
  } catch (error) {
    console.error('❌ Error creating belt:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create belt level',
      error: error.message
    });
  }
};

// Update belt level
const updateBelt = async (req, res) => {
  try {
    console.log(`✏️ Updating belt level: ${req.params.id}`);
    const { name, level, color, hex, requirements, students, isActive } = req.body;

    const belt = await Belt.findById(req.params.id);
    if (!belt) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt level not found'
      });
    }

    // Update fields
    if (name !== undefined) belt.name = name;
    if (level !== undefined) belt.level = level;
    if (color !== undefined) belt.color = color;
    if (hex !== undefined) belt.hex = hex;
    if (requirements !== undefined) belt.requirements = requirements;
    if (students !== undefined) belt.students = students;
    if (isActive !== undefined) belt.isActive = isActive;
    belt.updatedBy = req.user?.id;

    await belt.save();

    const updatedBelt = await Belt.findById(belt._id)
      .populate('updatedBy', 'name email');

    console.log(`✅ Updated belt level: ${belt.name}`);

    res.json({
      status: 'success',
      message: 'Belt level updated successfully',
      data: { belt: updatedBelt }
    });
  } catch (error) {
    console.error('❌ Error updating belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update belt level',
      error: error.message
    });
  }
};

// Delete belt level (hard delete)
const deleteBelt = async (req, res) => {
  try {
    console.log(`🗑️ Deleting belt level: ${req.params.id}`);
    const belt = await Belt.findByIdAndDelete(req.params.id);
    
    if (!belt) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt level not found'
      });
    }

    console.log(`✅ Deleted belt level: ${belt.name}`);

    res.json({
      status: 'success',
      message: 'Belt level deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete belt level',
      error: error.message
    });
  }
};

// Get belt statistics
const getBeltStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching belt statistics...');
    
    const beltStats = await Belt.getStatistics();
    
    console.log('✅ Statistics fetched successfully');

    res.json({
      status: 'success',
      data: beltStats
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  getBeltLevels,
  getBeltById,
  createBelt,
  updateBelt,
  deleteBelt,
  getBeltStatistics
};
