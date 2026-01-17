const Event = require('../models/Event');
const EventParticipant = require('../models/EventParticipant');

// Get all events
const getEvents = async (req, res) => {
  try {
    console.log('📋 Fetching events...');
    console.log('📋 Query params:', req.query);
    
    const { eventType, eventLevel, status, isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    } else {
      filter.isActive = true;
    }

    if (eventType) filter.eventType = eventType;
    if (eventLevel) filter.eventLevel = eventLevel;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .sort({ date: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    console.log(`✅ Found ${events.length} events`);

    res.json({
      status: 'success',
      data: {
        events
      }
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    console.log(`📋 Fetching event: ${req.params.id}`);
    
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    console.log(`✅ Found event: ${event.name}`);

    res.json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    console.log('➕ Creating new event...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from token:', req.user);
    
    const { name, eventType, eventLevel, description, date, location, capacity, status } = req.body;

    // Validate required fields
    if (!name || !eventType || !eventLevel || !date || !location || !capacity) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, eventType, eventLevel, date, location, capacity'
      });
    }

    // Validate capacity
    if (capacity < 1) {
      console.log('❌ Invalid capacity:', capacity);
      return res.status(400).json({
        status: 'error',
        message: 'Capacity must be at least 1'
      });
    }

    // Validate eventLevel against enum
    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'All Levels'];
    if (!validLevels.includes(eventLevel)) {
      console.log('❌ Invalid event level:', eventLevel);
      return res.status(400).json({
        status: 'error',
        message: `Invalid event level. Must be one of: ${validLevels.join(', ')}`
      });
    }

    const eventData = {
      name,
      eventType,
      eventLevel,
      description: description || '',
      date,
      location,
      capacity,
      currentParticipants: 0,
      status: status || 'Scheduled',
      isActive: true,
      createdBy: req.user?.id
    };

    console.log('💾 Creating event with data:', JSON.stringify(eventData, null, 2));

    const event = new Event(eventData);
    await event.save();

    console.log('✅ Event saved to database with ID:', event._id);

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    console.log('✅ Created event:', populatedEvent.name);

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: { event: populatedEvent }
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Send detailed error for debugging
    res.status(500).json({
      status: 'error',
      message: 'Failed to create event',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    console.log(`✏️ Updating event: ${req.params.id}`);
    const { name, eventType, eventLevel, description, date, location, capacity, status, isActive } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Prevent date modification if event is completed
    if (date && event.status === 'Completed' && date !== event.date) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot modify date of a completed event'
      });
    }

    // Validate capacity if being updated
    if (capacity && capacity < event.currentParticipants) {
      return res.status(400).json({
        status: 'error',
        message: `Capacity cannot be less than current participants (${event.currentParticipants})`
      });
    }

    // Update fields
    if (name !== undefined) event.name = name;
    if (eventType !== undefined) event.eventType = eventType;
    if (eventLevel !== undefined) event.eventLevel = eventLevel;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (location !== undefined) event.location = location;
    if (capacity !== undefined) event.capacity = capacity;
    if (status !== undefined) event.status = status;
    if (isActive !== undefined) event.isActive = isActive;
    event.updatedBy = req.user?.id;

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('updatedBy', 'name email');

    console.log(`✅ Updated event: ${event.name}`);

    res.json({
      status: 'success',
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });
  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event (soft delete)
const deleteEvent = async (req, res) => {
  try {
    console.log(`🗑️ Deleting event: ${req.params.id}`);
    console.log(`👤 User from request:`, req.user);
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Soft delete using findByIdAndUpdate to avoid validation issues
    const updateData = { isActive: false };
    if (req.user && req.user.id) {
      updateData.updatedBy = req.user.id;
    }

    await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { runValidators: false } // Skip validation for soft delete
    );

    console.log(`✅ Deleted event: ${event.name}`);

    res.json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Get event statistics
const getEventStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching event statistics...');
    
    const totalEvents = await Event.countDocuments({ isActive: true });
    
    const totalParticipants = await EventParticipant.countDocuments({
      participationStatus: { $in: ['Registered', 'Confirmed', 'Participated'] }
    });
    
    const completedEvents = await Event.countDocuments({ status: 'Completed', isActive: true });
    
    const upcomingEvents = await Event.countDocuments({ 
      status: 'Scheduled', 
      date: { $gte: new Date() },
      isActive: true 
    });

    console.log('✅ Statistics fetched successfully');

    res.json({
      status: 'success',
      data: {
        totalEvents,
        totalParticipants,
        completedEvents,
        upcomingEvents
      }
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

// Sync participant counts for all events
const syncParticipantCounts = async (req, res) => {
  try {
    console.log('🔄 Syncing participant counts for all events...');
    
    const events = await Event.find();
    let updatedCount = 0;

    for (const event of events) {
      // Count actual participants for this event
      const actualCount = await EventParticipant.countDocuments({ event: event._id });
      
      // Update if count is different
      if (event.currentParticipants !== actualCount) {
        console.log(`🔄 Event "${event.name}": ${event.currentParticipants} → ${actualCount}`);
        event.currentParticipants = actualCount;
        await event.save();
        updatedCount++;
      }
    }

    console.log(`✅ Synced ${updatedCount} events`);

    res.json({
      status: 'success',
      message: `Participant counts synced successfully. Updated ${updatedCount} events.`,
      data: {
        totalEvents: events.length,
        updatedEvents: updatedCount
      }
    });
  } catch (error) {
    console.error('❌ Error syncing participant counts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync participant counts',
      error: error.message
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStatistics,
  syncParticipantCounts
};
