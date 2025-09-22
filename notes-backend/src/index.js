// src/index.js
const express = require('express');
const cors = require('cors');

// Import database and models
const db = require('./models');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

const app = express();

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ Then Routes
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);


app.get('/', (req, res) => {
  res.send('Hello, Notes API is running 🚀');
});

// Sync database and start server
const PORT = process.env.PORT || 4000;
db.sequelize.sync()
  .then(() => {
    console.log('✅ Database synced successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error syncing database:', err);
  });
