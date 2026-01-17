const EventParticipant = require('../models/EventParticipant');
const Event = require('../models/Event');
const Student = require('../models/Student');

// Get participants for an event
const getParticipants = async (req, res) => {
  try {
    console.log(`📋 Fetching participants for event: ${req.params.eventId}`);
    
    const { participationStatus } = req.query;
    const filter = { event: req.params.eventId };
    
    if (participationStatus) {
      filter.participationStatus = participationStatus;
    }

    const participants = await EventParticipant.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ registrationDate: -1 });

    console.log(`✅ Found ${participants.length} participants`);

    res.json({
      status: 'success',
      data: {
        participants
      }
    });
  } catch (error) {
    console.error('❌ Error fetching participants:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch participants',
      error: error.message
    });
  }
};

// Register student to event
const registerParticipant = async (req, res) => {
  try {
    console.log(`➕ Registering student to event: ${req.params.eventId}`);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from token:', req.user);
    
    const { studentId, participationStatus } = req.body;

    console.log('🔍 Step 1: Validating event...');
    // Validate event exists and is active
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      console.log('❌ Event not found');
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    if (!event.isActive) {
      console.log('❌ Event is not active');
      return res.status(400).json({
        status: 'error',
        message: 'Cannot register to inactive event'
      });
    }
    console.log('✅ Event found:', event.name, 'Active:', event.isActive);

    console.log('🔍 Step 2: Validating student...');
    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      console.log('❌ Student not found');
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    console.log('✅ Student found:', student.fullName, 'Status:', student.status);

    console.log('🔍 Step 3: Checking student status...');
    // Check if student is active
    if (student.status !== 'active') {
      console.log('❌ Student is not active, status:', student.status);
      return res.status(400).json({
        status: 'error',
        message: 'Cannot register inactive student to event'
      });
    }
    console.log('✅ Student is active');

    console.log('🔍 Step 4: Checking for duplicate registration...');
    // Check if student is already registered for this event (by student ID, not name)
    const existingParticipant = await EventParticipant.findOne({
      event: req.params.eventId,
      studentId: studentId  // ✅ Check by student ID to allow multiple students with same name
    });
    
    if (existingParticipant) {
      console.log('❌ Student already registered for this event');
      return res.status(400).json({
        status: 'error',
        message: 'Student is already registered for this event'
      });
    }
    console.log('✅ No duplicate registration found');

    console.log('🔍 Step 5: Checking event capacity...');
    console.log('Current participants:', event.currentParticipants, 'Capacity:', event.capacity);
    // Check if event capacity is reached
    if (event.currentParticipants >= event.capacity) {
      console.log('❌ Event capacity reached');
      return res.status(400).json({
        status: 'error',
        message: 'Event capacity has been reached'
      });
    }
    console.log('✅ Capacity available');

    const participantData = {
      event: req.params.eventId,
      studentId: studentId,  // ✅ Store student ID for unique identification
      studentName: student.fullName,
      participationStatus: participationStatus || 'Registered',
      registrationDate: new Date(),
      createdBy: req.user?.id
    };

    console.log('💾 Step 6: Creating participant with data:', JSON.stringify(participantData, null, 2));

    const participant = new EventParticipant(participantData);
    await participant.save();

    console.log('✅ Participant saved to database with ID:', participant._id);

    console.log('📈 Step 7: Updating event participant count...');
    // Update event participant count
    event.currentParticipants += 1;
    await event.save();
    console.log('✅ Event participant count updated to:', event.currentParticipants);

    console.log('✅ Registered student to event successfully');

    res.status(201).json({
      status: 'success',
      message: 'Student registered to event successfully',
      data: { participant }
    });
  } catch (error) {
    console.error('❌ Error registering student:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Send more detailed error for debugging
    res.status(500).json({
      status: 'error',
      message: 'Failed to register student',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update participation status
const updateParticipationStatus = async (req, res) => {
  try {
    console.log(`✏️ Updating participation status for participant: ${req.params.participantId}`);
    const { participationStatus } = req.body;

    // Validate status is valid enum value
    const validStatuses = ['Registered', 'Confirmed', 'Participated', 'Cancelled', 'No-Show'];
    if (!validStatuses.includes(participationStatus)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid participation status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const participant = await EventParticipant.findById(req.params.participantId);
    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found'
      });
    }

    participant.participationStatus = participationStatus;
    participant.updatedBy = req.user?.id;
    await participant.save();

    const updatedParticipant = await EventParticipant.findById(participant._id)
      .populate('student', 'fullName email currentBelt')
      .populate('updatedBy', 'name email');

    console.log(`✅ Updated participation status to: ${participationStatus}`);

    res.json({
      status: 'success',
      message: 'Participation status updated successfully',
      data: { participant: updatedParticipant }
    });
  } catch (error) {
    console.error('❌ Error updating participation status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update participation status',
      error: error.message
    });
  }
};

// Remove participant from event
const removeParticipant = async (req, res) => {
  try {
    console.log(`🗑️ Removing participant: ${req.params.participantId}`);
    
    const participant = await EventParticipant.findById(req.params.participantId);
    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found'
      });
    }

    const eventId = participant.event;

    // Delete participant
    await EventParticipant.findByIdAndDelete(req.params.participantId);

    // Update event participant count
    const event = await Event.findById(eventId);
    if (event && event.currentParticipants > 0) {
      event.currentParticipants -= 1;
      await event.save();
    }

    console.log(`✅ Removed participant from event`);

    res.json({
      status: 'success',
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('❌ Error removing participant:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove participant',
      error: error.message
    });
  }
};

module.exports = {
  getParticipants,
  registerParticipant,
  updateParticipationStatus,
  removeParticipant
};
