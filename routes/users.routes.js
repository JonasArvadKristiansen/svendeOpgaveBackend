const router = require('express').Router();
const users = require('../controllers/users');
const jwt = require('../utils/jwt');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many login attempts, please try again later.' } });
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

router.get('/info', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if (jwtVerify) {
        users.getInfo(jwtVerify.userId, res);
    } else {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }
});

router.post('/login', loginLimit, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send('Mangler felter udfyldt');
        }

        const response = await users.login(req, res);
        if (response.success) {
            jwt.createJWT(response.user, res);
        } else {
            return res.status(404).json('Adgangskode eller email forkert. Tjek indtastet felter igen');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), function (req, res) {
    if (!req.user) {
        return res.status(401).json({ message: 'Login for google failed' });
    }
    // If authentication succeeds, create JWT
    jwt.createJWT(req.user, res);
});

// Endpoint for Facebook login
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

//Endpoint gets called here after users login to facebook
router.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), function (req, res) {
    if (!req.user) {
        return res.status(401).json({ message: 'Login for facebook failed' });
    }
    // If authentication succeeds, create JWT
    jwt.createJWT(req.user, res);
});

router.post('/create', async (req, res, next) => {
    //setting varibles
    const { fullName, password, repeatPassword, email, phonenumber } = req.body;

    //checking if fields are empty
    if (!(fullName && password && repeatPassword && email && phonenumber)) {
        return res.status(400).json('Mangler felter udfyldt');
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
    const userExist = await users.userExist(email);
    
    if (userExist) {
        return res.status(409).json('Brugeren eksitere allerede');
    }

    const bannedEmail = await users.bannedEmailCheck(email);

    if (bannedEmail) {
        return res.status(409).json('Email er ikke tiladt at bruge');
    }

    //sends to next endpoint if all checks are cleared
    next();
});

router.post('/create', async (req, res) => {
    try {
        let result = await users.create(req, res);
        if (result.success) {
            jwt.createJWT(result.user, res);
        } else {
            return res.status(500).json('Kunne ikke lave ny bruger');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.post('/sendEmail', async (req, res) => {});

router.put('/update', async (req, res) => {
    try {
        const { fullName, email, phonenumber } = req.body;
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Normal user') {
            return res.status(401).json('Ikke tilladt, kun jobsøgere kan ændre profil her');
        }

        if (!(fullName || email || phonenumber)) {
            return res.status(400).json('Mindst et felt skal være udfyldt');
        }

        if (email) {
            const userExist = await users.userExist(email, jwtVerify.userId);

            if (userExist) {
                return res.status(409).json('Email allerede i brug');
            }

            const bannedEmail = await users.bannedEmailCheck(email);

            if (bannedEmail) {
                return res.status(409).json('Email er ikke tiladt at bruge');
            }
        }

        let result = await users.update(req, jwtVerify.userId);

        if (result) {
            return res.status(200).json('Brugeren opdateret');
        } else {
            return res.status(500).json('Kunne ikke opdatere bruger');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.put('/password', async (req, res) => {
    try {
        const { oldPassword, newPassword, repeatNewPassword } = req.body;
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Normal user' && jwtVerify.type != 'Admin') {
            return res.status(401).json('Ikke tilladt, kun jobsøgere og admin kan opdatere adgangskode her');
        }

        if (!(oldPassword && newPassword && repeatNewPassword)) {
            return res.status(400).json('Mangler felter udfyldt');
        }

        const verifyOldPassword = await users.checkSentPassword(oldPassword, jwtVerify.userId);

        if (!verifyOldPassword) {
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

        let result = await users.updatePassword(req, jwtVerify.userId);

        if (result) {
            return res.status(200).json('Brugerens adgangskode opdateret');
        } else {
            return res.status(500).json('Kunnne ikke opdatere adgangskoden');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const jwtVerify = await jwt.verifyToken(req);

        if (!jwtVerify.success) {
            res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
        }

        if (jwtVerify.type != 'Normal user') {
            return res.status(401).json('Ikke tilladt, kun jobsøgere kan slette profil her');
        }

        let result = await users.deleteUser(jwtVerify.userId);

        if (result.success) {
            return res.status(200).json('Brugerens profil er slettet');
        } else {
            return res.status(500).json('Brugerens profil kunne ikke slettes eller Brugerens profil kunne ikke findes');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

module.exports = router;
