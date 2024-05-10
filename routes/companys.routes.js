const router = require('express').Router();
const companys = require('../controllers/companys');
const jwt = require('../utils/jwt');

router.post('/loginCompanyUser', async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        return res.status(400).send('Mangler felter udfyldt');
    }

    const response = await companys.loginCompanyUser(req, res);
    if (response.success) {
        jwt.createJWT(response.companyUser, res);
    } else {
        return res.status(404).json('Adgangskode eller email forkert. Tjek indtastet felter igen');
    }
});

router.post('/createCompanyUser', async (req, res, next) => {
    //setting varibles
    const { companyName, password, repeatPassword, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } = req.body;

    //checking if fields are empty
    if (!(companyName && password && repeatPassword && companyDescription && address && phonenumber && email && numberOfEmployees && cvrNumber && jobtypes)) {
        return res.status(400).send('Mangler felter udfyldt');
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
    const companyExist = await companys.companyUserExist(email);

    if (companyExist) {
        return res.status(409).json('Firma eksitere allerede');
    }

    //sends to next endpoint if all checks are cleared
    next();
});

router.post('/createCompanyUser', async (req, res) => {
    let result = await companys.createCompanyUser(req, res);
    if (result.success) {
        jwt.createJWT(result.companyUser, res);
    } else {
        return res.status(400).json('Kunne ikke lave ny virksomheds bruger');
    }
});

router.put('/updateCompanyUser', async (req, res) => {
    
});

router.put('/updatePasswordCompanyUser', async (req, res) => {
    const { oldPassword, newPassword, repeatNewPassword } = req.body;
    const jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret')
    }

    if (!(oldPassword && newPassword && repeatNewPassword)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    const verifyOldPassword = await companys.checkSentPassword(oldPassword, jwtVerify.userId);

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

    let result = await companys.updateCompanyPassword(req, jwtVerify.userId);

    if (result.success) {
        return res.status(200).json('Virksomheds brugers adgangskode opdateret');
    } else {
        return res.status(400).json('Kunne ikke opdatere adgangskoden');
    }
});

router.delete('/deleteCompanyUser', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        return res.status(401).json("Token ikke gyldig længere eller er blevet manipuleret")
    }

    let result = await companys.deleteCompanyUser(jwtVerify.userId);

    if (result.success) {
        return res.status(200).json('Virksomheds bruger profil er slettet');
    } else {
        return res.status(400).json('Virksomheds bruger kunne ikke slettes eller virksomheds bruger kunne ikke findes');
    }
});

module.exports = router;