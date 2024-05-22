const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const users = require('./routes/users.routes');
const admin = require('./routes/admin.routes');
const companys = require('./routes/companys.routes');
const jobpostings = require('./routes/jobpostings.routes');

app.use(cors()); // allow cross site access
app.use(helmet()); // enhance security in backend
app.use(express.json()); // makes incoming fetch json available in req.body
app.use(express.urlencoded({ extended: true })); // makes URL-encoded data available in req.body.query
app.use('/api/user', users); // routing endpoints for users
app.use('/api/admin', admin); // routing endpoints for admin
app.use('/api/company', companys); // routing endpoints for companys
app.use('/api/jobpost', jobpostings); // routing endpoints for jobpostings

// Centralized error handling middleware. More readable and maintainable
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).json(error.message);
});

app.listen(3000, () => {
    console.log('app is running on port 3000');
});
