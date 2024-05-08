const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const jwt = require('../utils/jwt');

router.get('/createJobposting', async (req, res) => {
    let checkToken = await jwt.verifyToken(req);

    if(checkToken) {

    } else {
        return res.status().json("Ikke tilladt at lave opslag. skift til virksomheds bruger for at oprette opslag");
    }
});

router.get('/updateJobposting', async (req, res) => {

});

router.get('/deleteJobposting', async (req, res) => {

});

router.get('/allJobposings', async (req, res) => {

});

router.get('/filterJobpostings', async (req, res) => {

});

module.exports = router;