require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3456;

// CORS for Vite dev server
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        httpOnly: true
    }
}));

// API Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Start
app.listen(PORT, () => {
    console.log(`🚀 AAC API Server running at http://localhost:${PORT}`);
    console.log(`📋 API endpoints: http://localhost:${PORT}/api`);
});
