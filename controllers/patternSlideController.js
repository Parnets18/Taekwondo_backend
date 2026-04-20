const PatternSlide = require('../models/PatternSlide');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.slide ? { slide: req.query.slide } : {};
    let data = await PatternSlide.find(filter).sort({ order: 1, createdAt: 1 });
    
    // Convert kickEntries to patternEntries for non-standard-list slides when reading
    if (req.query.slide === 'non-standard-list') {
      data = data.map(item => {
        const itemObj = item.toObject ? item.toObject() : item;
        if (itemObj.points && Array.isArray(itemObj.points)) {
          itemObj.points = itemObj.points.map(point => {
            // Always prioritize kickEntries over patternEntries for conversion
            // This ensures we use the most up-to-date data from the admin panel
            if (point.kickEntries && Array.isArray(point.kickEntries) && point.kickEntries.length > 0) {
              console.log('Converting kickEntries for point:', point.text);
              const patternEntries = [];
              point.kickEntries.forEach((entry, index) => {
                console.log(`Entry ${index + 1}: patternName="${entry.patternName}", number="${entry.number}"`);
                if (entry.rows && Array.isArray(entry.rows)) {
                  entry.rows.forEach(row => {
                    patternEntries.push({
                      patternName: entry.patternName || 'Unknown Pattern', // Use the exact pattern name from kickEntries
                      number: entry.number || '',
                      koreanTerm: row.koreanTerm || '',
                      description: row.description || ''
                    });
                  });
                } else {
                  // Handle case where there are no rows but we still have entry data
                  patternEntries.push({
                    patternName: entry.patternName || 'Unknown Pattern', // Use the exact pattern name from kickEntries
                    number: entry.number || '',
                    koreanTerm: entry.koreanTerm || '',
                    description: entry.description || ''
                  });
                }
              });
              console.log('Converted patternEntries:', patternEntries.map(e => `${e.patternName}:${e.number}`));
              return {
                ...point,
                patternEntries: patternEntries,
                kickEntries: point.kickEntries // Keep original for admin panel
              };
            }
            // Only use existing patternEntries if there are no kickEntries
            else if (point.patternEntries && Array.isArray(point.patternEntries) && point.patternEntries.length > 0) {
              const updatedPatternEntries = point.patternEntries.map(entry => {
                return {
                  ...entry,
                  patternName: entry.patternName || 'Unknown Pattern'
                };
              });
              
              return {
                ...point,
                patternEntries: updatedPatternEntries
              };
            }
            return point;
          });
        }
        return itemObj;
      });
    }
    
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await PatternSlide.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await PatternSlide.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const item = await PatternSlide.findByIdAndUpdate(
      req.params.id,
      { $set: { order: Number(req.body.order) } },
      { new: true }
    );
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await PatternSlide.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function parseBody(raw, files) {
  const body = { ...raw };
  ['headings', 'points'].forEach(k => {
    if (typeof body[k] === 'string') {
      try { 
        body[k] = JSON.parse(body[k]); 
        
        // Convert patternEntries for non-standard-list slides
        if (k === 'points' && body.slide === 'non-standard-list') {
          body[k] = body[k].map(point => {
            if (point.kickEntries && Array.isArray(point.kickEntries)) {
              // For non-standard-list, convert kickEntries to patternEntries for mobile app compatibility
              const patternEntries = [];
              point.kickEntries.forEach(entry => {
                if (entry.rows && Array.isArray(entry.rows)) {
                  entry.rows.forEach(row => {
                    patternEntries.push({
                      patternName: entry.patternName || point.text || 'Unknown Pattern',
                      number: entry.number || '',
                      koreanTerm: row.koreanTerm || '',
                      description: row.description || ''
                    });
                  });
                } else {
                  // Handle case where there are no rows but we still have entry data
                  patternEntries.push({
                    patternName: entry.patternName || point.text || 'Unknown Pattern',
                    number: entry.number || '',
                    koreanTerm: entry.koreanTerm || '',
                    description: entry.description || ''
                  });
                }
              });
              return {
                ...point,
                patternEntries: patternEntries,
                kickEntries: point.kickEntries // Keep original for admin panel
              };
            } else if (point.patternEntries) {
              // Ensure all patternEntries have pattern names
              const updatedPatternEntries = point.patternEntries.map(entry => ({
                ...entry,
                patternName: entry.patternName || point.text || 'Unknown Pattern'
              }));
              return {
                ...point,
                patternEntries: updatedPatternEntries
              };
            }
            return point;
          });
        }
      } catch { 
        body[k] = []; 
      }
    }
  });
  if (files?.images?.length) {
    const existing = body.existingImages ? JSON.parse(body.existingImages) : [];
    const newImgs = files.images.map(f => `/uploads/pattern-slides/${f.filename}`);
    body.images = [...existing, ...newImgs];
  } else if (body.existingImages) {
    body.images = JSON.parse(body.existingImages);
  }
  delete body.existingImages;
  return body;
}
