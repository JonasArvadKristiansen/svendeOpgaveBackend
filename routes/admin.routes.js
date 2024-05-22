const router = require('express').Router();
const admin = require('../controllers/admin');
const jwt = require('../utils/jwt');

router.get('/statistikData', async (req, res, next) => {
    try {
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Admin') {
            const error = new Error('Ikke tilladt at se info. Kun admin har tilladelse');
            error.status = 401;
            throw error;
        }

        await admin.allData(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/allBannedEmails', async (req, res, next) => {
    try {
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Admin') {
            const error = new Error('Ikke tilladt at se info. Kun admin har tilladelse');
            error.status = 401;
            throw error;
        }

        await admin.getAllBannedEmails(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/banEmail', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            const error = new Error('email mangler');
            error.status = 400;
            throw error;
        }

        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Admin') {
            const error = new Error('Ikke tilladt at ban. Kun admin har tilladelse');
            error.status = 401;
            throw error;
        }

        await admin.bannedEmailCheck(email);
        await admin.banEmail(email);

        return res.status(200).json('Email kan længere bruges på siden og brugerne med denne email er fjernet');
    } catch (error) {
        next(error);
    }
});

router.delete('/deleteUser', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            const error = new Error('email mangler');
            error.status = 400;
            throw error;
        }

        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Admin') {
            return res.status(401).json('Ikke tilladt at slette brugere. Kun admin har tilladelse');
        }

        await admin.deleteUser(email);

        return res.status(200).json('Brugerens profil er slettet');
    } catch (error) {
        next(error);
    }
});

router.delete('/deleteCompany', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            const error = new Error('email mangler');
            error.status = 400;
            throw error;
        }

        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Admin') {
            return res.status(401).json('Ikke tilladt at slette virksomheds brugere. Kun admin har tilladelse');
        }

        await admin.deleteCompany(email);

        return res.status(200).json('Virksomheds bruger profil er slettet');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
