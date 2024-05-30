const router = require('express').Router();
const jobpostings = require('../controllers/jobposting');
const jwt = require('../utils/jwt');

router.get('/all', async (req, res, next) => {
    try {
        await jobpostings.allJobpostings(req, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.get('/filter', async (req, res, next) => {
    try {
        const { deadlineFirst, deadlineLast, minSalary, jobtype, search, newestJobpost } = req.query;

        if (!(minSalary || jobtype || search || newestJobpost || (deadlineFirst && deadlineLast))) {
            await jobpostings.allJobpostings(req, res);
        }

        await jobpostings.filterJobpostings(req, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
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

        // verifying token
        await jwt.verifyToken(req);

        await jobpostings.jobposting(req, res);
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
    }
});

router.post('/create', async (req, res, next) => {
    try {
        const { title, description, deadline, jobtype, salary } = req.body;

        if (!(title && description && deadline && jobtype && salary)) {
            const error = new Error('Mangler felter udfyldt');
            error.status = 400;
            throw error;
        }

        // verifying token
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
        next(error); // This pass error to the central error handler in server.js
    }
});

router.put('/update', async (req, res, next) => {
    try {
        const { title, description, deadline, jobtype, salary, jobpostingId } = req.body;

        if (!jobpostingId) {
            const error = new Error('Mangler jobpostingId udfyldt');
            error.status = 400;
            throw error;
        }

        // verifying token
        const jwtVerify = await jwt.verifyToken(req);

        if (jwtVerify.type !== 'Company user') {
            const error = new Error('Ikke tilladt, kun Virksomheds brugers kan ændre opslag');
            error.status = 401;
            throw error;
        }

        if (!(title || description || deadline || jobtype || salary)) {
            const error = new Error('Mindst et felt skal være udfyldt');
            error.status = 400;
            throw error;
        }

        await jobpostings.updateJobposting(req);

        return res.status(200).json('Jobopslag opdateret');
    } catch (error) {
        next(error); // This pass error to the central error handler in server.js
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

        // verifying token
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
        next(error); // This pass error to the central error handler in server.js
    }
});

module.exports = router;
