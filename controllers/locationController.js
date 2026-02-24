const Location = require('../models/Location');

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ order: 1, createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
};

// Get active locations only
exports.getActiveLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active locations', error: error.message });
  }
};

// Get locations by type
exports.getLocationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const locations = await Location.find({ type, isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations by type', error: error.message });
  }
};

// Get single location
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location', error: error.message });
  }
};

// Create location
exports.createLocation = async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: 'Error creating location', error: error.message });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(400).json({ message: 'Error updating location', error: error.message });
  }
};

// Delete location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting location', error: error.message });
  }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    location.isActive = !location.isActive;
    await location.save();
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling status', error: error.message });
  }
};
