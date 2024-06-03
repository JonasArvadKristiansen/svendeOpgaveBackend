const express = require('express');
const app = express();
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const users = require('./routes/users.routes');
const admin = require('./routes/admin.routes');
const companys = require('./routes/companys.routes');
const jobpostings = require('./routes/jobpostings.routes');
const loginLimit = require('./utils/loginlimiter');
require('dotenv').config();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user/login', loginLimit);
app.use('/api/user/auth/google', loginLimit);
app.use('/api/user/auth/facebook', loginLimit);
app.use('/api/company/login', loginLimit);

// Custom middleware to check access token
app.use((req, res, next) => {
    if (req.path === '/api/user/auth/facebook' || req.path === '/api/user/auth/facebook/callback' || req.path === '/api/user/auth/google' || req.path === '/api/user/auth/google/callback')
        return next();
    const requestSecret = req.headers['accesstoken'];
    if (requestSecret !== process.env.ACCESS_TOKEN) {
        const error = new Error('Access not allowed to this server');
        error.status = 403;
        next(error);
    } else {
        next();
    }
});

// Routes
app.use('/api/user', users);
app.use('/api/admin', admin);
app.use('/api/company', companys);
app.use('/api/jobpost', jobpostings);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).json(error.message);
});

// Start server
app.listen(3000, () => {
    console.log('app is running on port 3000');
});
