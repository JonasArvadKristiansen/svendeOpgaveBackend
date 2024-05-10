const router = require('express').Router();
const admin = require('../controllers/admin');
const jwt = require('../utils/jwt');

router.get('/allData', async (req, res) => {
    let jwtVerify = await jwt.verifyToken(req);

    if(jwtVerify.type != "Admin") {
        return res.status(401).json('Ikke tilladt at se info. Kun admin har tilladelse');
    }

    admin.allData(req, res);
});

router.post('/banEmail', async (req, res) => {
    const { email } = req.body;
    
    if (!(email)) {
        return res.status(400).json('email mangler');
    }

    let jwtVerify = await jwt.verifyToken(req);

    if(jwtVerify.type != "Admin") {
        return res.status(401).json('Ikke tilladt at se info. Kun admin har tilladelse');
    }

    let result = await admin.banEmail(email);
    if(result.success) {
        return res.status(200).json('Email kan længere bruges på siden');
    } else {
        return res.status(500).json('Server fejl. Kunne ikke forbyde email');
    }

});

router.delete('/adminDeleteUser', async (req, res) => {
    const { userId } = req.body;

    if (!(userId)) {
        return res.status(400).json('userId mangler');
    }

    let jwtVerify = await jwt.verifyToken(req);

    if(jwtVerify.type != "Admin") {
        return res.status(401).json('Ikke tilladt at slette brugere. Kun admin har tilladelse');
    }

    let result = await admin.deleteUser(req.body.userId);

    if (result.success) {
        return res.status(200).json('Brugerens profil er slettet');
    } else {
        return res.status(500).json('Brugerens profil kunne ikke slettes eller brugerens profil kunne ikke findes');
    }
});

router.delete('/adminDeleteCompany', async (req, res) => {
    const { companyId } = req.body;

    if (!(companyId)) {
        return res.status(400).json('companyId mangler');
    }

    let jwtVerify = await jwt.verifyToken(req);

    if(jwtVerify.type != "Admin") {
        return res.status(401).json('Ikke tilladt at slette virksomheds brugere. Kun admin har tilladelse');
    }

    let result = await admin.deleteCompany(req.body.companyId);

    if (result.success) {
        return res.status(200).json('Virksomheds bruger profil er slettet');
    } else {
        return res.status(500).json('Virksomheds brugeren kunne ikke slettes eller virksomheds brugeren kunne ikke findes');
    }
});

module.exports = router;