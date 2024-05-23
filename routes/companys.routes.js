const router = require('express').Router();
const companys = require('../controllers/companys');
const jwt = require('../utils/jwt');
const rateLimit = require('express-rate-limit');
const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        res.status(429).json({ message: 'For mange login forsøg, Prøv igen senere.' });
    },
});

router.get('/all', async (req, res, next) => {
    try {
        await companys.allCompanys(req, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.get('/filter', async (req, res, next) => {
    try {
        const { jobtype, search } = req.query;

        if (!(jobtype || search)) {
            const error = new Error('Mindst et filter skal være udfyldt');
            error.status = 400;
            throw error;
        }

        await companys.filterCompanys(req, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.get('/info', async (req, res, next) => {
    try {
        const { companyID } = req.query;

        if (!companyID) {
            const error = new Error('companyID mangler');
            error.status = 400;
            throw error;
        }

        // verifying token
        await jwt.verifyToken(req);

        await companys.profile(req, res);
    } catch (error) {
        next(error); // Pass the error to the central error handler
    }
});

router.get('/profile', async (req, res, next) => {
    try {
        // verifying token
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun virksomheds brugere kan se deres profil her');
            error.status = 401;
            throw error;
        }

        await companys.getCompanyInfo(jwtVerify.userId, req, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.post('/login', loginLimit, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

        const response = await companys.login(req);

        jwt.createJWT(response.user, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.post('/create', async (req, res, next) => {
    try {
        const { companyName, password, repeatPassword, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } =
            req.body;

        // Checking if required fields are provided
        if (
            !(
                companyName &&
                password &&
                repeatPassword &&
                description &&
                address &&
                city &&
                phonenumber &&
                email &&
                numberOfEmployees &&
                cvrNumber &&
                jobtypes
            )
        ) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

        // Validating password length
        if (password.length < 8) {
            const error = new Error('Adgangskode for kort');
            error.status = 409;
            throw error;
        }

        // RegExp test checks if password contains one upper_case letter
        const containsUppercase = /[A-Z]/.test(password);

        // RegExp test Checks if the password contains at least one number
        const containsNumber = /\d/.test(password);

        if (!containsUppercase || !containsNumber) {
            const error = new Error('Adgangskode skal indeholde mindst et stort bogstav og et tal');
            error.status = 409;
            throw error;
        }

        // Checking if passwords match
        if (password !== repeatPassword) {
            const error = new Error('Adgangskoder ikke ens');
            error.status = 409;
            throw error;
        }

        // Check if company already exists
        const companyExist = await companys.companyExist(email);
        if (companyExist) {
            const error = new Error('Firma eksisterer allerede');
            error.status = 409;
            throw error;
        }

        // Check if email is banned
        const bannedEmail = await companys.bannedEmailCheck(email);
        if (bannedEmail) {
            const error = new Error('Email er ikke tilladt at bruge');
            error.status = 409;
            throw error;
        }

        // Create the company user
        const resultOfCreateCompany = await companys.create(req, res);

        // If creation successful, create JWT token
        jwt.createJWT(resultOfCreateCompany.user, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.put('/update', async (req, res) => {
    try {
        const { companyName, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } = req.body;

        // verifying token
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun virksomheds brugere kan ændre profil her');
            error.status = 401;
            throw error;
        }

        if (!(companyName || description || address || city || phonenumber || email || numberOfEmployees || cvrNumber || jobtypes)) {
            const error = new Error('Mindst et felt skal være udfyldt');
            error.status = 400;
            throw error;
        }

        if (email) {
            const companyExist = await companys.companyExist(email, jwtVerify.userId);

            if (companyExist) {
                const error = new Error('Email allerede i brug');
                error.status = 409;
                throw error;
            }

            const bannedEmail = await companys.bannedEmailCheck(email);

            if (bannedEmail) {
                const error = new Error('Email er ikke tiladt at bruge');
                error.status = 409;
                throw error;
            }
        }

        await companys.updateCompany(req, jwtVerify.userId);

        const companyJobpostings = await companys.allCompanysJobpostings(jwtVerify.userId);

        if (companyJobpostings.jobPostingsCount !== 0) {
            if (address || city || phonenumber || email) {
                await companys.updateJobpostes(jwtVerify.userId, req);
            }
            return res.status(200).json('Virksomheds brugeren er opdateret');
        }

        return res.status(200).json('Virksomheds brugeren er opdateret');
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.put('/password', async (req, res, next) => {
    try {
        const { oldPassword, newPassword, repeatNewPassword } = req.body;

        // verifying token
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun virksomheds brugere kan ændre adgangskode her');
            error.status = 401;
            throw error;
        }

        if (!(oldPassword && newPassword && repeatNewPassword)) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

        await companys.checkSentPassword(oldPassword, jwtVerify.userId);

        if (newPassword !== repeatNewPassword) {
            const error = new Error('Nye Adgangskode felter ikke ens');
            error.status = 409;
            throw error;
        }

        //RegExp test checks if password contains one upper_case letter
        const containsUppercase = /[A-Z]/.test(newPassword);

        // RegExp test Checks if the password contains at least one number
        const containsNumber = /\d/.test(newPassword);

        if (!containsUppercase || !containsNumber) {
            const error = new Error('Adgangskode skal indeholde mindste et stor bogstav og et tal');
            error.status = 409;
            throw error;
        }

        await companys.updatePassword(req, jwtVerify.userId);

        return res.status(200).json('Virksomheds brugers adgangskode opdateret');
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        // verifying token
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun virksomheds brugere kan slette profil her');
            error.status = 401;
            throw error;
        }

        await companys.deleteCompanyUser(jwtVerify.userId);

        return res.status(200).json('Virksomheds bruger profil er slettet');
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

module.exports = router;
