const express = require('express');
const app = express();

// Simple middleware to log requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('Health endpoint hit!');
  res.json({ status: 'success', message: 'Minimal server working' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
});