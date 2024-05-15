const express = require('express');
const app = express();
const cors = require('cors');
const users = require('./routes/users.routes');
const admin = require('./routes/admin.routes');
const homepage = require('./routes/homepage.routes');
const companys = require('./routes/companys.routes');
const jobpostings = require('./routes/jobpostings.routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(users);
app.use(admin);
app.use(companys);
app.use(jobpostings);
app.use(homepage);

app.listen(3000, () => {
    console.log('app is running on port 3000');
});
