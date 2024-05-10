const router = require('express').Router();
const jobpostings = require('../controllers/jobposting');
const jwt = require('../utils/jwt');

router.post('/createJobposting', async (req, res) => {
    let jwtVerify = await jwt.verifyToken(req);

    if(jwtVerify.type != "Company user") {
        return res.status(401).json('Ikke tilladt at lave opslag. skift til virksomheds bruger for at oprette opslag');
    }

    let result = await jobpostings.createJobposting(req, jwtVerify.userId);

    if(result.success) {
        return res.status(200).json('Opslag oprettet');
    } else {
        return res.status(500).json('Opslag kunne ikke oprettes');
    }
});

router.get('/updateJobposting', async (req, res) => {

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