const router = require('express').Router();
const admin = require('../controllers/admin');
const jwt = require('../utils/jwt');

router.get('/statistikData', async (req, res) => {
    try {
        let jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Admin') {
            return res.status(401).json('Ikke tilladt at se info. Kun admin har tilladelse');
        }

        admin.allData(req, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.get('/allBannedEmails', async (req, res) => {
    try {
        let jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Admin') {
            return res.status(401).json('Ikke tilladt at se info. Kun admin har tilladelse');
        }

        admin.getAllBannedEmails(req, res);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.post('/banEmail', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json('email mangler');
        }

        let jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Admin') {
            return res.status(401).json('Ikke tilladt at ban. Kun admin har tilladelse');
        }

        let checkEmail = await admin.bannedEmailCheck(email);

        if (checkEmail) {
            let result = await admin.banEmail(email);

            if (result) {
                return res.status(200).json('Email kan længere bruges på siden');
            } else {
                return res.status(500).json('Server fejl. Kunne ikke forbyde email');
            }
        } else {
            return res.status(409).json('Ban email eksitere allerede');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.delete('/deleteUser', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json('userId mangler');
        }

        let jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Admin') {
            return res.status(401).json('Ikke tilladt at slette brugere. Kun admin har tilladelse');
        }

        let result = await admin.deleteUser(req.body.userId);

        if (result) {
            return res.status(200).json('Brugerens profil er slettet');
        } else {
            return res.status(500).json('Brugerens profil kunne ikke slettes eller brugerens profil kunne ikke findes');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

router.delete('/deleteCompany', async (req, res) => {
    try {
        const { companyId } = req.body;

        if (!companyId) {
            return res.status(400).json('companyId mangler');
        }

        let jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type != 'Admin') {
            return res.status(401).json('Ikke tilladt at slette virksomheds brugere. Kun admin har tilladelse');
        }

        let result = await admin.deleteCompany(req.body.companyId);

        if (result.success) {
            return res.status(200).json('Virksomheds bruger profil er slettet');
        } else {
            return res.status(500).json('Virksomheds brugeren kunne ikke slettes eller virksomheds brugeren kunne ikke findes');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.errorMessage);
    }
});

module.exports = router;
