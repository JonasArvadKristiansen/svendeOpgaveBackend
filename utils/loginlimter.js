const rateLimit = require('express-rate-limit');

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
      res.status(429).json('For mange login forsøg, Prøv igen senere.');
  },
});

module.exports = loginLimit;