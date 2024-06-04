const rateLimit = require('express-rate-limit');

const loginLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  handler: (req, res) => {
      res.status(429).json('For mange login forsøg, Prøv igen om 10 min.');
  },
});

module.exports = loginLimit;