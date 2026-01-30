const Event = require('../models/Event');
const Student = require('../models/Student');

// Get all events with filters (public route)
exports.getEventsPublic = async (req, res) => {
  try {
    console.log('📅 Public events route called');
    const { 
      year, 
      month, 
      status, 
      eventType, 
      level, 
      startDate, 
      endDate,
      limit = 50 
    } = req.query;
    
    let query = { isActive: true };
    
    // Date filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      
      if (month && month !== 'All Months') {
        const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      } else {
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }
    }
    
    // Status filtering
    if (status && status !== 'All Events') {
      if (status === 'Upcoming') {
        query.date = { ...query.date, $gte: new Date() };
        query.status = { $in: ['Upcoming', 'Ongoing'] };
      } else if (status === 'Past') {
        query.date = { ...query.date, $lt: new Date() };
      }
    }
    
    // Other filters
    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }
    
    if (level && level !== 'All Levels') {
      query.level = level;
    }
    
    console.log('🔍 Events Query:', query);
    
    const events = await Event.find(query)
      .populate('registeredParticipants.student', 'fullName studentId')
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${events.length} events`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        events,
        count: events.length,
        query: query
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public events:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get all events with filters (protected route)
exports.getEvents = async (req, res) => {
  try {
    const { 
      year, 
      month, 
      status, 
      eventType, 
      level, 
      startDate, 
      endDate 
    } = req.query;
    
    let query = { isActive: true };
    
    // Date filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      
      if (month && month !== 'All Months') {
        const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      } else {
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }
    }
    
    // Status filtering
    if (status && status !== 'All Events') {
      if (status === 'Upcoming') {
        query.date = { ...query.date, $gte: new Date() };
        query.status = { $in: ['Upcoming', 'Ongoing'] };
      } else if (status === 'Past') {
        query.date = { ...query.date, $lt: new Date() };
      }
    }
    
    // Other filters
    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }
    
    if (level && level !== 'All Levels') {
      query.level = level;
    }
    
    const events = await Event.find(query)
      .populate('registeredParticipants.student', 'fullName studentId currentBelt')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      data: { events }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('registeredParticipants.student', 'fullName studentId currentBelt email phone')
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Create new event (admin/instructor only)
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      eventType,
      level,
      maxParticipants,
      registrationFee,
      registrationDeadline,
      organizer,
      contactInfo,
      requirements,
      prizes
    } = req.body;
    
    if (!name || !description || !date || !startTime || !location) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, description, date, start time, and location are required'
      });
    }
    
    const event = new Event({
      name,
      description,
      date: new Date(date),
      startTime,
      endTime,
      location,
      eventType: eventType || 'Other',
      level: level || 'All Levels',
      maxParticipants,
      registrationFee: registrationFee || 0,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      organizer: organizer || 'Taekwondo Academy',
      contactInfo,
      requirements: requirements || [],
      prizes: prizes || [],
      createdBy: req.user?._id
    });
    
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      status: 'success',
      data: { event: populatedEvent }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Update event (admin/instructor only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert date strings to Date objects if present
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    }
    
    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event (admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Register for event (student)
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if event is still accepting registrations
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        status: 'error',
        message: 'Registration deadline has passed'
      });
    }
    
    // Check if event is full
    if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({
        status: 'error',
        message: 'Event is full'
      });
    }
    
    // Check if student is already registered
    const isAlreadyRegistered = event.registeredParticipants.some(
      participant => participant.student.toString() === studentId
    );
    
    if (isAlreadyRegistered) {
      return res.status(400).json({
        status: 'error',
        message: 'Student is already registered for this event'
      });
    }
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    
    // Add student to event
    event.registeredParticipants.push({
      student: studentId,
      registrationDate: new Date(),
      paymentStatus: event.registrationFee > 0 ? 'Pending' : 'Paid'
    });
    
    await event.save();
    
    const updatedEvent = await Event.findById(id)
      .populate('registeredParticipants.student', 'fullName studentId');
    
    res.status(200).json({
      status: 'success',
      message: 'Successfully registered for event',
      data: { event: updatedEvent }
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

// Unregister from event (student)
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Remove student from event
    event.registeredParticipants = event.registeredParticipants.filter(
      participant => participant.student.toString() !== studentId
    );
    
    await event.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unregister from event',
      error: error.message
    });
  }
};

// Get event statistics
exports.getEventStatistics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({ 
      isActive: true,
      date: { $gte: new Date() },
      status: { $in: ['Upcoming', 'Ongoing'] }
    });
    const pastEvents = await Event.countDocuments({ 
      isActive: true,
      date: { $lt: new Date() }
    });
    
    // Get events by type
    const eventsByType = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    
    // Get total registrations
    const totalRegistrations = await Event.aggregate([
      { $match: { isActive: true } },
      { $project: { participantCount: { $size: '$registeredParticipants' } } },
      { $group: { _id: null, total: { $sum: '$participantCount' } } }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        totalEvents,
        upcomingEvents,
        pastEvents,
        eventsByType,
        totalRegistrations: totalRegistrations[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event statistics',
      error: error.message
    });
  }
};