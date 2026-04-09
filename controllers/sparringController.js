const Sparring = require('../models/Sparring');

exports.getSparrings = async (req, res) => {
  try {
    const data = await Sparring.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getSparringByType = async (req, res) => {
  try {
    const sparring = await Sparring.findOne({ type: req.params.type });
    if (!sparring) return res.status(404).json({ status: 'error', message: 'Sparring type not found' });
    res.json({ status: 'success', data: sparring });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createSparring = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const sparring = await Sparring.create(body);
    res.status(201).json({ status: 'success', data: sparring });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateSparring = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const sparring = await Sparring.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!sparring) return res.status(404).json({ status: 'error', message: 'Sparring not found' });
    res.json({ status: 'success', data: sparring });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteSparring = async (req, res) => {
  try {
    const sparring = await Sparring.findByIdAndDelete(req.params.id);
    if (!sparring) return res.status(404).json({ status: 'error', message: 'Sparring not found' });
    res.json({ status: 'success', message: 'Sparring deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Parse FormData body — handles JSON string fields and injects section images
function parseBody(raw, files) {
  const body = { ...raw };

  ['attacks', 'routines', 'sections'].forEach(key => {
    if (typeof body[key] === 'string') {
      try { body[key] = JSON.parse(body[key]); } catch { body[key] = []; }
    }
  });

  // Inject uploaded section images: field sectionImage_0, sectionImage_1, ...
  if (files && Array.isArray(body.sections)) {
    body.sections = body.sections.map((section, i) => {
      const fieldName = `sectionImage_${i}`;
      if (files[fieldName]?.[0]) {
        return { ...section, image: `/uploads/sparring/${files[fieldName][0].filename}` };
      }
      return section;
    });
  }

  return body;
}
