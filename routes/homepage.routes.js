const router = require('express').Router();
const homepage = require('../controllers/homepage');

router.get('/allCompanys', async (req, res) => {
    homepage.allCompanys(req, res);
});

router.get('/allJobpostings', async (req, res) => {
    homepage.allJobpostings(req, res);
});

router.get('/filterCompanys', async (req, res) => {

});

router.get('/filterJobpostings', async (req, res) => {

});

module.exports = router;