const express = require('express');
const app = express();
const cors = require('cors');
const users = require('./routes/users.routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(users);

app.listen(3000, () => {
    console.log('app is running on port 3000');
});