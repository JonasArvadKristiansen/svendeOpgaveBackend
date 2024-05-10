const router = require('express').Router();
const homepage = require('../controllers/homepage');
const jwt = require('../utils/jwt');

router.get('/allCompanys', async (req, res) => {
    homepage.allCompanys(req, res);
});

router.get('/allJobpostings', async (req, res) => {
    homepage.allJobpostings(req, res);
});

router.get('/jobposting', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        return res.status(401).json("Token ikke gyldig længere eller er blevet manipuleret")
    }

    homepage.jobposting(req, res);
});

router.get('/companyProfile', async (req, res) => {
    const jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        return res.status(401).json("Token ikke gyldig længere eller er blevet manipuleret")
    }

    homepage.companyProfile(req, res);
});



module.exports = router;