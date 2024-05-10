const router = require('express').Router();
const admin = require('../controllers/admin');
const jwt = require('../utils/jwt');

router.get('/allCompanys', async (req, res) => {
    homepage.allCompanys(req, res);
});

router.delete('/allCompanys', async (req, res) => {
    homepage.allCompanys(req, res);
});

router.delete('/allCompanys', async (req, res) => {
    homepage.allCompanys(req, res);
});

module.exports = router;