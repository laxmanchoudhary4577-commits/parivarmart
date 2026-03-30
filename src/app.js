const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'ecommerce-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Import Routes
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const viewRoutes = require('./routes/viewRoutes');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

// Use Routes
app.use('/api', apiRoutes);
app.use('/api', authRoutes);
app.use('/api', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/', viewRoutes);

module.exports = app;
