const BodyPart = require('../models/BodyPart');

const extractImages = (req, body) => {
  if (!req.files) return;
  if (req.files.image?.[0]) body.image = `/uploads/body-parts/${req.files.image[0].filename}`;
  if (req.files.images?.length) {
    const existing = body.existingImages ? JSON.parse(body.existingImages) : [];
    const newImgs = req.files.images.map(f => `/uploads/body-parts/${f.filename}`);
    body.images = [...existing, ...newImgs];
  } else if (body.existingImages) {
    body.images = JSON.parse(body.existingImages);
  }
  delete body.existingImages;
  // Parse JSON fields
  if (body.directions && typeof body.directions === 'string') body.directions = JSON.parse(body.directions);
  if (body.parts && typeof body.parts === 'string') body.parts = JSON.parse(body.parts);
  if (body.points && typeof body.points === 'string') body.points = JSON.parse(body.points);
  if (body.hierarchicalData && typeof body.hierarchicalData === 'string') body.hierarchicalData = JSON.parse(body.hierarchicalData);
};

// Validate and clean hierarchical data structure
const validateHierarchicalData = (hierarchicalData) => {
  if (!Array.isArray(hierarchicalData)) return [];
  
  return hierarchicalData.map(direction => {
    if (!direction || typeof direction !== 'object') return null;
    
    const cleanDirection = {
      direction: String(direction.direction || '').trim(),
      parts: []
    };
    
    if (Array.isArray(direction.parts)) {
      cleanDirection.parts = direction.parts.map(part => {
        if (!part || typeof part !== 'object') return null;
        
        const cleanPart = {
          part: String(part.part || '').trim(),
          methods: []
        };
        
        if (Array.isArray(part.methods)) {
          cleanPart.methods = part.methods.map(method => {
            if (!method || typeof method !== 'object') return null;
            
            const cleanMethod = {
              method: String(method.method || '').trim(),
              tools: []
            };
            
            if (Array.isArray(method.tools)) {
              cleanMethod.tools = method.tools
                .map(tool => String(tool || '').trim())
                .filter(tool => tool.length > 0);
            }
            
            return cleanMethod.method || cleanMethod.tools.length > 0 ? cleanMethod : null;
          }).filter(method => method !== null);
        }
        
        return cleanPart.part || cleanPart.methods.length > 0 ? cleanPart : null;
      }).filter(part => part !== null);
    }
    
    return cleanDirection.direction || cleanDirection.parts.length > 0 ? cleanDirection : null;
  }).filter(direction => direction !== null);
};

// Convert hierarchical data to legacy format for backward compatibility
const convertToLegacyFormat = (hierarchicalData) => {
  if (!Array.isArray(hierarchicalData) || hierarchicalData.length === 0) {
    return { directions: [], parts: [] };
  }
  
  const directions = [...new Set(hierarchicalData.map(d => d.direction).filter(Boolean))];
  
  // Flatten all parts from all directions
  const allParts = hierarchicalData.flatMap(direction => 
    direction.parts.map(part => ({
      part: part.part,
      methods: part.methods.map(method => ({
        method: method.method,
        tools: method.tools
      }))
    }))
  );
  
  // Remove duplicates based on part name
  const uniqueParts = allParts.reduce((acc, current) => {
    const existing = acc.find(p => p.part === current.part);
    if (existing) {
      // Merge methods if part already exists
      existing.methods = [...existing.methods, ...current.methods];
    } else {
      acc.push(current);
    }
    return acc;
  }, []);
  
  return { directions, parts: uniqueParts };
};

// Convert legacy format to hierarchical format
const convertLegacyToHierarchical = (directions, parts) => {
  if (!directions || !parts) return [];
  
  return directions.map(direction => ({
    direction: direction,
    parts: parts.map(part => ({
      part: part.part,
      methods: (part.methods || []).map(method => ({
        method: method.method,
        tools: method.tools || []
      }))
    }))
  }));
};

exports.getBodyParts = async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const items = await BodyPart.find(filter).sort({ order: 1, createdAt: 1 });
    
    // For blocking tools, ensure hierarchical data is properly structured
    if (req.query.category === 'blocking') {
      const processedItems = items.map(item => {
        const itemObj = item.toObject();
        
        // If no hierarchical data but has legacy data, convert it
        if (!itemObj.hierarchicalData || itemObj.hierarchicalData.length === 0) {
          if (itemObj.directions && itemObj.parts) {
            itemObj.hierarchicalData = convertLegacyToHierarchical(itemObj.directions, itemObj.parts);
          }
        }
        
        return itemObj;
      });
      
      return res.json({ status: 'success', data: processedItems });
    }
    
    res.json({ status: 'success', data: items });
  } catch (err) {
    console.error('Error fetching body parts:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get hierarchical structure for a specific blocking tool
exports.getBlockingToolStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BodyPart.findById(id);
    
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Blocking tool not found' });
    }
    
    if (item.category !== 'blocking') {
      return res.status(400).json({ status: 'error', message: 'Item is not a blocking tool' });
    }
    
    let hierarchicalData = item.hierarchicalData;
    
    // Convert legacy data if needed
    if (!hierarchicalData || hierarchicalData.length === 0) {
      hierarchicalData = convertLegacyToHierarchical(item.directions, item.parts);
    }
    
    // Calculate statistics
    const stats = {
      totalDirections: hierarchicalData.length,
      totalParts: hierarchicalData.reduce((sum, d) => sum + d.parts.length, 0),
      totalMethods: hierarchicalData.reduce((sum, d) => 
        sum + d.parts.reduce((pSum, p) => pSum + p.methods.length, 0), 0),
      totalTools: hierarchicalData.reduce((sum, d) => 
        sum + d.parts.reduce((pSum, p) => 
          pSum + p.methods.reduce((mSum, m) => mSum + m.tools.length, 0), 0), 0)
    };
    
    res.json({ 
      status: 'success', 
      data: {
        id: item._id,
        name: item.name,
        hierarchicalData,
        stats
      }
    });
  } catch (err) {
    console.error('Error fetching blocking tool structure:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createBodyPart = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    
    // Process hierarchical data for blocking tools
    if (body.category === 'blocking' && body.hierarchicalData) {
      const validatedHierarchicalData = validateHierarchicalData(body.hierarchicalData);
      body.hierarchicalData = validatedHierarchicalData;
      
      // Also update legacy format for backward compatibility
      const legacy = convertToLegacyFormat(validatedHierarchicalData);
      body.directions = legacy.directions;
      body.parts = legacy.parts;
    }
    
    const item = await BodyPart.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    console.error('Error creating body part:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateBodyPart = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    
    // Process hierarchical data for blocking tools
    if (body.category === 'blocking' && body.hierarchicalData) {
      const validatedHierarchicalData = validateHierarchicalData(body.hierarchicalData);
      body.hierarchicalData = validatedHierarchicalData;
      
      // Also update legacy format for backward compatibility
      const legacy = convertToLegacyFormat(validatedHierarchicalData);
      body.directions = legacy.directions;
      body.parts = legacy.parts;
    }
    
    const item = await BodyPart.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    console.error('Error updating body part:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteBodyPart = async (req, res) => {
  try {
    const item = await BodyPart.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
