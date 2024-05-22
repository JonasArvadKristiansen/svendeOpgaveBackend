const router = require('express').Router();
const jobpostings = require('../controllers/jobposting');
const jwt = require('../utils/jwt');

router.get('/all', async (req, res, next) => {
    try {
        await jobpostings.allJobpostings(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/filter', async (req, res, next) => {
    try {
        const { deadline, minSalary, jobtype, search } = req.query;

        if (!(deadline || minSalary || jobtype || search)) {
            const error = new Error('Mindst et filter skal være udfyldt');
            error.status = 400;
            throw error;
        }

        await jobpostings.filterJobpostings(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/info', async (req, res, next) => {
    try {
        const { jobpostingId } = req.query;

        if (!jobpostingId) {
            const error = new Error('jobpostingId mangler');
            error.status = 400;
            throw error;
        }

        await jwt.verifyToken(req);

        await jobpostings.jobposting(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/create', async (req, res, next) => {
    try {
        const { title, DESCRIPTION, deadline, jobtype, salary } = req.body;

        if (!(title && DESCRIPTION && deadline && jobtype && salary)) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt at lave jobopslag. skift til virksomheds bruger for at oprette opslag');
            error.status = 401;
            throw error;
        }

        await jobpostings.createJobposting(req, jwtVerify.userId);
        await jobpostings.plusCompanyJobpostingCount(jwtVerify.userId);
            
        return res.status(200).json('Jobopslag oprettet');
    } catch (error) {
        next(error);
    }
});

router.put('/update', async (req, res, next) => {
    try {
        const { title, DESCRIPTION, deadline, jobtype, salary, jobpostingId } = req.body;

        if (!jobpostingId) {
            const error = new Error('Mangler jobpostingId udfyldt');
            error.status = 400;
            throw error;
        }

        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun Virksomheds brugers kan ændre opslag');
            error.status = 401;
            throw error;
        }

        if (!(title || DESCRIPTION || deadline || jobtype || salary)) {
            const error = new Error('Mindst et felt skal være udfyldt');
            error.status = 400;
            throw error;
        }

        await jobpostings.updateJobposting(req);

        return res.status(200).json('Jobopslag opdateret');
        
    } catch (error) {
        next(error);
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        const { jobpostingId } = req.body;

        if (!jobpostingId) {
            const error = new Error('Mangler jobpostingId udfyldt');
            error.status = 400;
            throw error;
        }

        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun Virksomheds brugers kan slette opslag');
            error.status = 401;
            throw error;
        }

        const result = await jobpostings.deleteJobposting(jobpostingId);

        if (result) {
            await jobpostings.minusCompanyJobpostingCount(jwtVerify.userId);

            return res.status(200).json('Jobopslag slettet');
        }
    } catch (error) {
        next(error);
    }
});


module.exports = router;
