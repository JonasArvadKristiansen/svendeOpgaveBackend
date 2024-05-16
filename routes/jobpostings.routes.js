const router = require('express').Router();
const jobpostings = require('../controllers/jobposting');
const jwt = require('../utils/jwt');

router.get('/all', async (req, res) => {
    jobpostings.allJobpostings(req, res);
});

router.get('/filter', async (req, res) => {
    const { deadline, minSalary, jobtype, search } = req.query;

    if (!(deadline || minSalary || jobtype || search)) {
        return res.status(400).json('Mindst et filter skal være udfyldt');
    }

    jobpostings.filterJobpostings(req, res);
});

router.get('/info', async (req, res) => {
    const { jobpostingId } = req.query;

    if (!jobpostingId) {
        return res.status(400).json('jobpostingId mangler');
    }

    const jwtVerify = await jwt.verifyToken(req);

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    jobpostings.jobposting(req, res);
});

router.post('/create', async (req, res) => {
    const { title, DESCRIPTION, deadline, jobtype, salary } = req.body;

    if (!(title && DESCRIPTION && deadline && jobtype && salary)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    let jwtVerify = await jwt.verifyToken(req);

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt at lave jobopslag. skift til virksomheds bruger for at oprette opslag');
    }

    let result = await jobpostings.createJobposting(req, jwtVerify.userId);

    if (result.success) {
        let jobposting = await jobpostings.plusCompanyJobpostingCount(jwtVerify.userId);
        if (jobposting.success) {
            return res.status(200).json('Jobopslag oprettet');
        } else {
            return res.status(200).json('Jobopslag oprettet, men kunne ikke opdatere virksomheds bruger jobopslag tæller');
        }
    } else {
        return res.status(500).json('Jobopslag kunne ikke oprettes');
    }
});

router.put('/update', async (req, res) => {
    const { title, DESCRIPTION, deadline, jobtype, salary, jobpostingId } = req.body;

    if (!jobpostingId) {
        return res.status(400).json('Mangler jobpostingId udfyldt');
    }

    const jwtVerify = await jwt.verifyToken(req);

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt, kun Virksomheds brugers kan ændre opslag');
    }

    if (!(title || DESCRIPTION || deadline || jobtype || salary)) {
        return res.status(400).json('Mindst et felt skal være udfyldt');
    }

    let result = await jobpostings.updateJobposting(req);

    if (result.success) {
        return res.status(200).json('Jobopslag opdateret');
    } else {
        return res.status(500).json('Kunne ikke opdatere jobopslag');
    }
});

router.delete('/delete', async (req, res) => {
    const { jobpostingId } = req.body;

    if (!jobpostingId) {
        return res.status(400).json('Mangler jobpostingId udfyldt');
    }

    let jwtVerify = await jwt.verifyToken(req);

    if (!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    if (jwtVerify.type != 'Company user') {
        return res.status(401).json('Ikke tilladt, kun Virksomheds brugers kan slette opslag');
    }

    let result = await jobpostings.deleteJobposting(jobpostingId);

    if (result.success) {
        let jobposting = await jobpostings.minusCompanyJobpostingCount(jwtVerify.userId);
        if (jobposting.success) {
            return res.status(200).json('Jobopslag slettet');
        } else {
            return res.status(200).json('Jobopslag slettet, men kunne ikke opdatere virksomheds brugers jobopslag tæller');
        }
    } else {
        return res.status(500).json('Jobopslag kunne ikke slettes');
    }
});

module.exports = router;
