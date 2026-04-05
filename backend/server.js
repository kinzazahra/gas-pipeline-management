const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gas-pipeline')
  .then(() => console.log('Connected to MongoDB safely'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Route Imports
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/projects', require('./routes/projectRoutes'));
// --- ADD THE NEW ROUTE HERE ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // <--- Add this line
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/projects', require('./routes/projectRoutes')); // <--- Add this!
// ------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Pipeline Server running on port ${PORT}`);
});