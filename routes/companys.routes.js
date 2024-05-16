const router = require('express').Router();
const companys = require('../controllers/companys');
const jwt = require('../utils/jwt');
const rateLimit = require('express-rate-limit');
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many login attempts, please try again later.' } });

router.get('/all', async (req, res) => {
    companys.allCompanys(req, res);
});

router.get('/filter', async (req, res) => {
    const { jobtype, search } = req.query;

    if (!(jobtype || search)) {
        return res.status(400).json('Mindst et filter skal være udfyldt');
    }

    companys.filterCompanys(req, res);
});

router.get('/profile', async (req, res) => {
    const { companyID } = req.query;

    if (!companyID) {
        return res.status(400).json('companyID mangler');
    }

    const jwtVerify = await jwt.verifyToken(req);

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    companys.companyProfile(req, res);
});

router.get('/info', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt, kun virksomheds brugere kan se profil her');
    }

    if (jwtVerify.success) {
        companys.getCompanyInfo(jwtVerify.userId, res);
    } else {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }
});

router.post('/login', loginLimit, async (req, res) => {
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

router.post('/create', async (req, res, next) => {
    //setting varibles
    const { companyName, password, repeatPassword, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } =
        req.body;

    //checking if fields are empty
    if (
        !(
            companyName &&
            password &&
            repeatPassword &&
            companyDescription &&
            address &&
            city &&
            phonenumber &&
            email &&
            numberOfEmployees &&
            cvrNumber &&
            jobtypes
        )
    ) {
        return res.status(400).send('Mangler felter udfyldt');
    }

    if (password.length < 8) {
        return res.status(409).json('Adgangskode for kort');
    }

    //RegExp test checks if password contains one upper_case letter
    const containsUppercase = /[A-Z]/.test(password);

    // RegExp test Checks if the password contains at least one number
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

    const bannedEmail = await companys.bannedEmailCheck(email);

    if (bannedEmail) {
        return res.status(409).json('Email er ikke tiladt at bruge');
    }

    //sends to next endpoint if all checks are cleared
    next();
});

router.post('/create', async (req, res) => {
    let resultOfCreateCompany = await companys.createCompanyUser(req, res);

    if (resultOfCreateCompany.success) {
        jwt.createJWT(resultOfCreateCompany.companyUser, res);
    } else {
        return res.status(500).json('Kunne ikke lave ny virksomheds bruger');
    }
});

router.put('/update', async (req, res) => {
    const { companyName, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } = req.body;
    const jwtVerify = await jwt.verifyToken(req);

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt, kun virksomheds brugere kan ændre profil her');
    }

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    if (!(companyName || companyDescription || address || city || phonenumber || email || numberOfEmployees || cvrNumber || jobtypes)) {
        return res.status(400).json('Mindst et felt skal være udfyldt');
    }

    if (email) {
        const userExist = await companys.companyUserExist(email);

        if (userExist) {
            return res.status(409).json('Email allerede i brug');
        }

        const bannedEmail = await companys.bannedEmailCheck(email);

        if (bannedEmail) {
            return res.status(409).json('Email er ikke tiladt at bruge');
        }
    }

    let result = await companys.updateCompany(req, jwtVerify.userId);

    if (result.success) {
        let companyJobpostings = await companys.allCompanysJobpostings(jwtVerify.userId);

        if (companyJobpostings.jobPostingsCount !== 0 && companyJobpostings.success) {
            if (address || city || phonenumber || email) {
                let updateJobpostes = await companys.updateJobpostes(jwtVerify.userId, req);

                if (!updateJobpostes.success) {
                    return res.status(200).json('Virksomheds brugerens jobopslag eller jobopslagene ikke opdateret');
                }
            }
            return res.status(200).json('Virksomheds brugeren er opdateret');
        }

        return res.status(200).json('Virksomheds brugeren er opdateret');
    } else {
        return res.status(500).json('Kunne ikke opdatere virksomheds bruger');
    }
});

router.put('/password', async (req, res) => {
    const { oldPassword, newPassword, repeatNewPassword } = req.body;
    const jwtVerify = await jwt.verifyToken(req);

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt, kun virksomheds brugere kan ændre adgangskode her');
    }

    if (!jwtVerify.success) {
        res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    if (!(oldPassword && newPassword && repeatNewPassword)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    const verifyOldPassword = await companys.checkSentPassword(oldPassword, jwtVerify.userId);

    if (!verifyOldPassword.success) {
        return res.status(409).json('Gamle adgangskode ikke rigtig');
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
        return res.status(500).json('Kunne ikke opdatere adgangskoden');
    }
});

router.delete('/delete', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt, kun virksomheds brugere kan slette profil her');
    }

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    let result = await companys.deleteCompanyUser(jwtVerify.userId);

    if (result.success) {
        return res.status(200).json('Virksomheds bruger profil er slettet');
    } else {
        return res.status(500).json('Virksomheds bruger kunne ikke slettes eller virksomheds bruger kunne ikke findes');
    }
});

module.exports = router;
