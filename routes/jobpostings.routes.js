const router = require('express').Router();
const jobpostings = require('../controllers/jobposting');
const jwt = require('../utils/jwt');

router.post('/createJobposting', async (req, res) => {
    const { title, DESCRIPTION, deadline, jobtype, salary} = req.body;

    if (!(title && DESCRIPTION && deadline && jobtype && salary)) {
        return res.status(400).json('Mangler felter udfyldt');
    }

    let jwtVerify = await jwt.verifyToken(req);
    console.log(jwtVerify)
    if(jwtVerify.type != "Company user") {
        return res.status(401).json('Ikke tilladt at lave jobopslag. skift til virksomheds bruger for at oprette opslag');
    }

    let result = await jobpostings.createJobposting(req, jwtVerify.userId);

    if(result.success) {
        return res.status(200).json('Jobopslag oprettet');
    } else {
        return res.status(500).json('Jobopslag kunne ikke oprettes');
    }
});

router.put('/updateJobposting', async (req, res) => {
    const { title, DESCRIPTION, deadline, jobtype, salary, jobpostingId} = req.body;

    if(!(jobpostingId)) {
        return res.status(400).json('Mangler jobpostingId udfyldt');
    }
    
    const jwtVerify = await jwt.verifyToken(req);
    
    if(!(jwtVerify.success)) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret');
    }

    if(jwtVerify.type != "Company user") {
        return res.status(401).json('Ikke tilladt, kun Virksomheds bruger kan ændre opslag');
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

router.delete('/deleteJobposting', async (req, res) => {
    let jwtVerify = await jwt.verifyToken(req);

    if(!jwtVerify.success) {
        return res.status(401).json('Token ikke gyldig længere eller er blevet manipuleret')
    }

    let result = await jobpostings.deleteJobposting(req.body.jobpostingId);

    if(result.success) {
        return res.status(200).json('Jobopslag slettet');
    } else {
        return res.status(500).json('Jobopslag kunne ikke slettes');
    }
});

module.exports = router;