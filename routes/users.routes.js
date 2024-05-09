const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const jwt = require('../utils/jwt');

router.post('/loginUser', async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        return res.status(400).send('Mangler felter udfyldt');
    }

    const response = await users.loginUser(req, res);
    if (response.success) {
        jwt.createJWT(response.user, res);
    } else {
        return res.status(404).json('Adgangskode eller email forkert. Tjek indtastet felter igen');
    }
});

router.post('/createUser', async (req, res, next) => {
    //setting varibles
    const { fullName, password, repeatPassword, email, phonenumber } = req.body;

    //checking if fields are empty
    if (!(fullName && password && repeatPassword && email && phonenumber)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    if (password.length < 8) {
        return res.status(409).json('Adgangskode for kort');
    }

    //checks if password contains one upper_case letter
    const containsUppercase = /[A-Z]/.test(password);

    // Checks if the password contains at least one number
    const containsNumber = /\d/.test(password);

    if (!containsUppercase || !containsNumber) {
        return res.status(409).json('Adgangskode skal indeholde mindste et stor bogstav og et tal');
    }

    //checking if passwords match
    if (password != repeatPassword) {
        return res.status(409).json('Adgangskoder ikke ens');
    }

    //checks if user exists
    const userExist = await users.userExist(email);

    if (userExist) {
        return res.status(409).json('Bruger eksitere allerede');
    }

    //sends to next endpoint if all checks are cleared
    next();
});

router.post('/createUser', async (req, res) => {
    let result = await users.createUser(req, res);
    if (result.success) {
        jwt.createJWT(result.user, res);
    } else {
        return res.status(400).json('Nægtet at lave ny bruger');
    }
});

router.post('/sendEmail', async (req, res) => {

});

router.put('/updateUser', async (req, res) => {
    const { fullName, email, phonenumber } = req.body;
    const jwtVerify = await jwt.verifyToken(req);
    
    if(!(jwtVerify.success)) {
        return res.status(401).json("Adgangsnøgle ikke gyldig længere eller er blevet manipuleret");
    }

    if(jwtVerify.type === "Company user" || jwtVerify.type === "Admin") {
        return res.status(401).json("Ikke tilladt, kun jobsøgere kan ændre profil her");
    }

    if (!(fullName || email || phonenumber)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    if(email) {
        const userExist = await users.userExist(req.body.email);

        if (userExist) {
            return res.status(409).json('Email allerede i brug');
        }
    }

    let result = await users.updateUser(req, jwtVerify.userId);

    if (result) {
        return res.status(200).json('Brugeren opdateret');
    } else {
        return res.status(400).json('Nægtet at opdatere bruger');
    }

});

router.put('/updateUserPassword', async (req, res) => {
    const { oldPassword, newPassword, repeatNewPassword } = req.body;
    const jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        res.status(401).json("Adgangnøgle ikke gyldig")
    }

    if (!(oldPassword && newPassword && repeatNewPassword)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    const verifyOldPassword = await users.checkSentPassword(oldPassword, jwtVerify.userId);

    if(!verifyOldPassword.success) {
        return res.status(409).json('Gamle adgangskode ikke rigtig')
    }

    if (newPassword != repeatNewPassword) {
        return res.status(409).json('Nye Adgangskode felter ikke ens');
    }

    //RegExp test checks if password contains one upper_case letter
    const containsUppercase = /[A-Z]/.test(newPassword);

    // RegExp test Checks if the password contains at least one number
    const containsNumber = /\d/.test(newPassword);

    if (!containsUppercase || !containsNumber) {
        return res.status(409).json('Adgangskode skal indeholde mindste et stor bogstav og et tal');
    }

    let result = await users.updateUserPassword(req, jwtVerify.userId);

    if (result) {
        return res.status(200).json('Brugerens adgangskode opdateret');
    } else {
        return res.status(400).json('Nægtet at opdatere adgangskode');
    }
});

router.delete('/deleteUser', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        res.status(401).json("Adgangnøgle ikke gyldig")
    }

    let result = await users.deleteUser(jwtVerify.userId);

    if (result) {
        return res.status(200).json('Brugerens profil er slettet');
    } else {
        return res.status(400).json('Brugerens profil kunne ikke slettes');
    }
});

module.exports = router;