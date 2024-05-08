const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const jwt = require('../utils/jwt');

router.get('/login', async (req, res) => {

});

router.post('/createUser', async (req, res, next) => {
    //setting varibles
    const { fullName, password, repeatPassword, email, phonenumber } = req.body;

    //checking if fields are empty
    if (!(fullName && password && repeatPassword && email && phonenumber)) {
        return res.status(400).json('Input/Inputs missing');
    }

    if (password.length < 8) {
        return res.status(409).json('Adgangskode for kort');
    }

    if (password.includes('')) {
        // Password contains the specified substring
    }
    //checks if password contains one upper_case letter
    const containsUppercase = /[A-Z]/.test(password);

    // Checks if the password contains at least one number
    const containsNumber = /\d/.test(password);

    if (!containsUppercase || !containsNumber) {
        return res.status(409).json('Password must contain at least one uppercase letter and one number');
    }

    //checking if passwords match
    if (password != repeatPassword) {
        return res.status(409).json('Passwords not matching');
    }

    

    //checks if user exists
    const userExist = await users.userExist(email);

    if (userExist) {
        return res.status(409).json('User already exists');
    }

    //sends to next endpoint if all checks are cleared
    next();
});

router.post('/createUser', async (req, res) => {
    let result = await users.createUser(req, res);
    if (result.success) {
        jwt.createJWT(result.user, res);
    } else {
        return res.status(400).json('Denied creating user');
    }
});

router.put('/updateUser', async (req, res) => {

});

router.put('/updatePassword', async (req, res) => {

});

router.delete('/deleteUser', async (req, res) => {

});

router.get('/loginCheck', async (req, res) => {

});

router.post('/sendEmail', async (req, res) => {

});

module.exports = router;