// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database and models
const db = require('./models');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);

// ✅ Serve React frontend
const frontendBuildPath = path.join(__dirname, '../../notes-frontend/build');
app.use(express.static(frontendBuildPath));

// ✅ Fallback middleware for frontend routes (avoids using '*')
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/auth') || req.path.startsWith('/notes')) {
    return next();
  }
  // Serve index.html for all other requests
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// ✅ Default API test route
app.get('/api', (req, res) => {
  res.send('Hello, Notes API is running 🚀');
});

// Sync database and start server
const PORT = process.env.PORT || 4000;
db.sequelize.sync()
  .then(() => {
    console.log('✅ Database synced successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error syncing database:', err);
  });
