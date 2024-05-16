const router = require('express').Router();
const homepage = require('../controllers/homepage');
const jwt = require('../utils/jwt');

router.get('/filterCompanys', async (req, res) => {
    const { jobtype, search } = req.query;

    if (!(jobtype || search)) {
        return res.status(400).json('Mindst et filter skal være udfyldt');
    }

    homepage.filterCompanys(req, res);
});

router.get('/filterJobpostings', async (req, res) => {
    const { deadline, minSalary, jobtype, search } = req.query;

    if (!(deadline || minSalary || jobtype || search)) {
        return res.status(400).json('Mindst et filter skal være udfyldt');
    }

    homepage.filterJobpostings(req, res);
});

router.get('/allCompanys', async (req, res) => {
    homepage.allCompanys(req, res);
});

router.get('/allJobpostings', async (req, res) => {
    homepage.allJobpostings(req, res);
});

router.get('/jobposting', async (req, res) => {
    const { jobpostingId } = req.body;

    if (!jobpostingId) {
        return res.status(400).json('jobpostingId mangler');
    }

    const jwtVerify = await jwt.verifyToken(req);

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    homepage.jobposting(req, res);
});

router.get('/companyProfile', async (req, res) => {
    const { companyID } = req.body;

    if (!companyID) {
        return res.status(400).json('companyID mangler');
    }

    const jwtVerify = await jwt.verifyToken(req);

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    homepage.companyProfile(req, res);
});

module.exports = router;
