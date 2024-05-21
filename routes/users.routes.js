const router = require('express').Router();
const users = require('../controllers/users');
const jwt = require('../utils/jwt');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, handler: (req, res) => {
    res.status(429).json({ message: 'Too many login attempts, please try again later.' });
} });
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Middleware for initialisere Passport
router.use(passport.initialize());

passport.use(
    new FacebookStrategy(
        {
            clientID: `${process.env.FACEBOOK_clientID}`, // key from facebook developer
            clientSecret: `${process.env.FACEBOOK_clientSecret}`, // key from facebook developer
            callbackURL: 'http://localhost:3000/user/auth/facebook/callback', //part of offical documentation to call it this
            profileFields: ['displayName', 'email'], //values collected from facebook profile after success login
            enableProof: true, //sha256 hash of your accesstoken, using clientSecret for protection against outside attacks
        },
        function (accessToken, refreshToken, profile, callback) {
            // this part is called after users login regardless if success or fail
            if (!profile || !profile.emails || profile.emails.length === 0) {
                //check for values in the profile varible. if empty it failed
                return callback(new Error('Profile information is incomplete'));
            }

            //token payload
            const tokenPayload = {
                fullName: profile.displayName,
                email: profile.emails[0].value,
                type: 'Facebook user',
            };

            //saves by default tokenPayload in req.user
            return callback(null, tokenPayload);
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: `${process.env.GOOGLE_clientID}`,
            clientSecret: `${process.env.GOOGLE_clientSecret}`,
            callbackURL: 'http://localhost:3000/user/auth/google/callback',
        },
        function (accessToken, refreshToken, profile, callback) {
            if (!profile || !profile.emails || profile.emails.length === 0) {
                //check for values in the profile varible. if empty it failed
                return callback(new Error('Profile information is incomplete'));
            }

            //token payload
            const tokenPayload = {
                fullName: profile.displayName,
                email: profile.emails[0].value,
                type: 'Google user',
            };

            //saves by default tokenPayload in req.user
            return callback(null, tokenPayload);
        }
    )
);

router.get('/info', async (req, res, next) => {
    try {
        const jwtVerify = await jwt.verifyToken(req);
        await users.getInfo(jwtVerify.userId, res);
        
    } catch (error) {
        next(error); // this pass error to the central error handler in server.js
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

        const response = await users.login(req);
        jwt.createJWT(response.user, res);

    } catch (error) {
        next(error); // this pass error to the central error handler in server.js
    }
});


router.get('/auth/google', loginLimit, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), function (req, res, next) {
    try {
        if (!req.user) {
            const error = new Error('Login for google failed');
            error.status = 401;
            throw error;
        }
        // If authentication succeeds, create JWT
        jwt.createJWT(req.user, res);
    } catch (error) {
        next(error); // this pass error to the central error handler in server.js
    }
});

// Endpoint for Facebook login
router.get('/auth/facebook', loginLimit, passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

//Endpoint gets called here after users login to facebook
router.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), function (req, res, next) {
    try {
        if (!req.user) {
            const error = new Error('Login for facebook failed');
            error.status = 401;
            throw error;
        }
        // If authentication succeeds, create JWT
        jwt.createJWT(req.user, res);
    } catch (error) {
        next(error); // this pass error to the central error handler in server.js
    }
});


router.post('/create', async (req, res, next) => {
    try {
        // Setting variables
        const { fullName, password, repeatPassword, email, phonenumber } = req.body;

        // Checking if fields are empty
        if (!(fullName && password && repeatPassword && email && phonenumber)) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

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

        // Checking if user exists
        const userExists = await users.userExist(email);

        if (userExists) {
            const error = new Error('Brugeren eksisterer allerede');
            error.status = 409;
            throw error;
        }

        // Checking if email is banned
        const bannedEmail = await users.bannedEmailCheck(email);

        if (bannedEmail) {
            const error = new Error('Email er ikke tilladt at bruge');
            error.status = 409;
            throw error;
        }

        // Creating the user
        const result = await users.create(req);

        // JWT Creation
        jwt.createJWT(result.user, res);
        
    } catch (error) {
        next(error); // Passes the error to the centralized error handler
    }
});

router.post('/sendEmail', async (req, res) => {});

router.put('/update', async (req, res, next) => {
    try {
        const { fullName, email, phonenumber } = req.body;
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Normal user') {
            const error = new Error('Ikke tilladt, kun jobsøgere kan ændre profil her');
            error.status = 401;
            throw error;
        }

        if (!(fullName || email || phonenumber)) {
            const error = new Error('Mindst et felt skal være udfyldt');
            error.status = 400;
            throw error;
        }

        if (email) {
            const userExist = await users.userExist(email, jwtVerify.userId);

            if (userExist) {
                const error = new Error('Email allerede i brug');
                error.status = 409;
                throw error;
            }

            const bannedEmail = await users.bannedEmailCheck(email);
            
            if (bannedEmail) {
                const error = new Error('Email er ikke tiladt at bruge');
                error.status = 409;
                throw error;
            }
        }

        const result = await users.update(req, jwtVerify.userId);
        
        return res.status(200).json('Brugeren opdateret');
    } catch (error) {
        console.error(error);
        next(error)
    }
});

router.put('/password', async (req, res, next) => {
    try {
        const { oldPassword, newPassword, repeatNewPassword } = req.body;
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Normal user' && jwtVerify.type != 'Admin') {
            const error = new Error('Ikke tilladt, kun jobsøgere og admin kan opdatere adgangskode her');
            error.status = 401;
            throw error;
        }

        if (!(oldPassword && newPassword && repeatNewPassword)) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

        const verifyOldPassword = await users.checkSentPassword(oldPassword, jwtVerify.userId);

        if (!verifyOldPassword) {
            const error = new Error('Gamle adgangskode ikke rigtig');
            error.status = 409;
            throw error;
        }

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

        await users.updatePassword(req, jwtVerify.userId);
        
        return res.status(200).json('Brugerens adgangskode opdateret');
    } catch (error) {
        console.error(error);
        next(error)
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Normal user') {
            const error = new Error('Ikke tilladt, kun jobsøgere kan slette profil her');
            error.status = 401;
            throw error;
        }

        const result = await users.deleteUser(jwtVerify.userId);

        return res.status(200).json('Brugerens profil er slettet');
    } catch (error) {
        console.error(error);
        next(error)
    }
});

module.exports = router;
