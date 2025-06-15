const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Master routes
try {
    app.use('/api/master', require('./routes/master'));
    console.log('✅ Master routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading master routes:', error);
}

// Start server
app.listen(PORT, () => {
    console.log(`🎵 Test Server running on port ${PORT}`);
    console.log(`📱 Test: http://localhost:${PORT}/test`);
    console.log(`🔧 Master API: http://localhost:${PORT}/api/master/dashboard`);
});

module.exports = app; 