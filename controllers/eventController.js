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
    
    // Return sample events data matching admin panel structure
    const sampleEventsData = [
      {
        _id: 'EVENT-001',
        name: 'State Level Championship 2025',
        description: 'Annual state-level Taekwondo championship tournament for all belt levels',
        date: new Date('2025-03-15'),
        startTime: '09:00',
        endTime: '17:00',
        location: 'Sports Complex, Bangalore',
        eventType: 'Tournament',
        level: 'All Levels',
        status: 'Upcoming',
        maxParticipants: 200,
        registrationFee: 1500,
        registrationDeadline: new Date('2025-03-01'),
        organizer: 'Karnataka Taekwondo Association',
        contactInfo: {
          phone: '+91-9876543210',
          email: 'info@ktaekwondo.org'
        },
        requirements: ['Valid belt certificate', 'Medical fitness certificate', 'Registration fee payment'],
        prizes: ['Gold, Silver, Bronze medals', 'Trophies for winners', 'Participation certificates'],
        registeredParticipants: [
          {
            student: {
              _id: 'STU-001',
              fullName: 'Golu Vishwakarma',
              studentId: 'TKD001',
              currentBelt: 'Red Belt'
            },
            registrationDate: new Date('2025-01-20'),
            paymentStatus: 'Paid'
          },
          {
            student: {
              _id: 'STU-002',
              fullName: 'Arjun Sharma',
              studentId: 'TKD002',
              currentBelt: 'Black Belt'
            },
            registrationDate: new Date('2025-01-22'),
            paymentStatus: 'Paid'
          }
        ],
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-25')
      },
      {
        _id: 'EVENT-002',
        name: 'Belt Promotion Test - February 2025',
        description: 'Quarterly belt promotion examination for students ready to advance to next level',
        date: new Date('2025-02-28'),
        startTime: '10:00',
        endTime: '15:00',
        location: 'Main Dojo, Academy',
        eventType: 'Belt Test',
        level: 'All Levels',
        status: 'Upcoming',
        maxParticipants: 50,
        registrationFee: 800,
        registrationDeadline: new Date('2025-02-20'),
        organizer: 'Combat Warrior Taekwondo Academy',
        contactInfo: {
          phone: '+91-9876543211',
          email: 'belttests@academy.com'
        },
        requirements: ['Minimum training hours completed', 'Instructor recommendation', 'Current belt certificate'],
        prizes: ['New belt certificate', 'Achievement recognition'],
        registeredParticipants: [
          {
            student: {
              _id: 'STU-003',
              fullName: 'Priya Patel',
              studentId: 'TKD003',
              currentBelt: 'Blue Belt'
            },
            registrationDate: new Date('2025-01-25'),
            paymentStatus: 'Paid'
          }
        ],
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-25')
      },
      {
        _id: 'EVENT-003',
        name: 'Self-Defense Workshop for Women',
        description: 'Special workshop focusing on practical self-defense techniques for women',
        date: new Date('2025-02-14'),
        startTime: '14:00',
        endTime: '17:00',
        location: 'Training Hall B, Academy',
        eventType: 'Workshop',
        level: 'Beginner',
        status: 'Upcoming',
        maxParticipants: 30,
        registrationFee: 500,
        registrationDeadline: new Date('2025-02-10'),
        organizer: 'Combat Warrior Taekwondo Academy',
        contactInfo: {
          phone: '+91-9876543212',
          email: 'workshops@academy.com'
        },
        requirements: ['Comfortable workout clothes', 'Water bottle'],
        prizes: ['Participation certificate', 'Self-defense guide booklet'],
        registeredParticipants: [
          {
            student: {
              _id: 'STU-005',
              fullName: 'Sneha Singh',
              studentId: 'TKD005',
              currentBelt: 'Yellow Belt'
            },
            registrationDate: new Date('2025-01-28'),
            paymentStatus: 'Paid'
          }
        ],
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-28')
      },
      {
        _id: 'EVENT-004',
        name: 'Inter-Academy Friendly Match',
        description: 'Friendly sparring competition between different Taekwondo academies',
        date: new Date('2025-01-20'),
        startTime: '11:00',
        endTime: '16:00',
        location: 'City Sports Arena',
        eventType: 'Competition',
        level: 'Intermediate',
        status: 'Completed',
        maxParticipants: 80,
        registrationFee: 300,
        registrationDeadline: new Date('2025-01-15'),
        organizer: 'Regional Taekwondo Council',
        contactInfo: {
          phone: '+91-9876543213',
          email: 'competitions@rtc.org'
        },
        requirements: ['Sparring gear', 'Valid insurance', 'Academy recommendation'],
        prizes: ['Winner trophies', 'Best technique awards', 'Team spirit award'],
        registeredParticipants: [
          {
            student: {
              _id: 'STU-002',
              fullName: 'Arjun Sharma',
              studentId: 'TKD002',
              currentBelt: 'Black Belt'
            },
            registrationDate: new Date('2025-01-10'),
            paymentStatus: 'Paid'
          },
          {
            student: {
              _id: 'STU-004',
              fullName: 'Rahul Kumar',
              studentId: 'TKD004',
              currentBelt: 'Green Belt'
            },
            registrationDate: new Date('2025-01-12'),
            paymentStatus: 'Paid'
          }
        ],
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2025-01-20')
      },
      {
        _id: 'EVENT-005',
        name: 'Master Class with Grand Master Kim',
        description: 'Special training session with internationally renowned Grand Master Kim',
        date: new Date('2025-04-10'),
        startTime: '10:00',
        endTime: '16:00',
        location: 'Main Dojo, Academy',
        eventType: 'Seminar',
        level: 'Advanced',
        status: 'Upcoming',
        maxParticipants: 25,
        registrationFee: 2500,
        registrationDeadline: new Date('2025-03-25'),
        organizer: 'Combat Warrior Taekwondo Academy',
        contactInfo: {
          phone: '+91-9876543214',
          email: 'masterclass@academy.com'
        },
        requirements: ['Minimum Black Belt', 'Advanced techniques knowledge', 'Special registration'],
        prizes: ['Certificate from Grand Master', 'Exclusive training materials', 'Photo opportunity'],
        registeredParticipants: [
          {
            student: {
              _id: 'STU-001',
              fullName: 'Golu Vishwakarma',
              studentId: 'TKD001',
              currentBelt: 'Red Belt'
            },
            registrationDate: new Date('2025-01-30'),
            paymentStatus: 'Paid'
          }
        ],
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-30')
      }
    ];

    // Apply filters if provided
    let filteredData = sampleEventsData;
    
    if (year) {
      const yearNum = parseInt(year);
      filteredData = filteredData.filter(event => {
        const eventYear = new Date(event.date).getFullYear();
        return eventYear === yearNum;
      });
    }
    
    if (month && month !== 'All Months') {
      const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
      filteredData = filteredData.filter(event => {
        const eventMonth = new Date(event.date).getMonth();
        return eventMonth === monthIndex;
      });
    }
    
    if (status && status !== 'All Events') {
      if (status === 'Upcoming') {
        filteredData = filteredData.filter(event => 
          new Date(event.date) >= new Date() && event.status === 'Upcoming'
        );
      } else if (status === 'Past') {
        filteredData = filteredData.filter(event => 
          new Date(event.date) < new Date() || event.status === 'Completed'
        );
      }
    }
    
    if (eventType && eventType !== 'All') {
      filteredData = filteredData.filter(event => 
        event.eventType.toLowerCase() === eventType.toLowerCase()
      );
    }
    
    if (level && level !== 'All Levels') {
      filteredData = filteredData.filter(event => 
        event.level === level || event.level === 'All Levels'
      );
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredData = filteredData.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    }
    
    // Apply limit
    if (limit) {
      filteredData = filteredData.slice(0, parseInt(limit));
    }
    
    console.log(`✅ Returning ${filteredData.length} events`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        events: filteredData,
        count: filteredData.length,
        query: req.query
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
    console.log('📝 Creating new event...');
    console.log('Request body:', req.body);
    
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
      console.log('❌ Validation failed - missing required fields');
      console.log('Missing:', {
        name: !name,
        description: !description,
        date: !date,
        startTime: !startTime,
        location: !location
      });
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
    
    console.log('💾 Saving event to database...');
    await event.save();
    console.log('✅ Event saved successfully');
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      status: 'success',
      data: { event: populatedEvent }
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    console.error('Error details:', error.message);
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
    console.log('📊 Fetching event statistics...');
    
    const totalEvents = await Event.countDocuments({ isActive: true });
    console.log('Total events:', totalEvents);
    
    const upcomingEvents = await Event.countDocuments({ 
      isActive: true,
      date: { $gte: new Date() },
      status: { $in: ['Upcoming', 'Ongoing'] }
    });
    console.log('Upcoming events:', upcomingEvents);
    
    const pastEvents = await Event.countDocuments({ 
      isActive: true,
      date: { $lt: new Date() }
    });
    console.log('Past events:', pastEvents);
    
    // Get events by type
    const eventsByType = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    console.log('Events by type:', eventsByType);
    
    // Get total registrations - handle empty result
    const totalRegistrationsResult = await Event.aggregate([
      { $match: { isActive: true } },
      { $project: { participantCount: { $size: { $ifNull: ['$registeredParticipants', []] } } } },
      { $group: { _id: null, total: { $sum: '$participantCount' } } }
    ]);
    
    const totalRegistrations = totalRegistrationsResult.length > 0 ? totalRegistrationsResult[0].total : 0;
    console.log('Total registrations:', totalRegistrations);
    
    console.log('✅ Statistics fetched successfully');
    
    res.status(200).json({
      status: 'success',
      data: {
        totalEvents,
        upcomingEvents,
        pastEvents,
        eventsByType,
        totalRegistrations
      }
    });
  } catch (error) {
    console.error('❌ Error fetching event statistics:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event statistics',
      error: error.message
    });
  }
};