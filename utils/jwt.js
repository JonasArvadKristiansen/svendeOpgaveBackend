const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

//creating token for user
function createJWT(user, res) {
    const accessToken = jsonwebtoken.sign(
        { user: user },
        process.env.TOKEN_SECRET,
        { expiresIn: 60 * 60 }
    );
    if (accessToken) {
        return res.status(200).json(accessToken);
    } else {
        return res.status(500).json('Token failed to be created');
    }
}

//tjekking if user token is vaild
function verifyToken(req, res) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        // Extract and verify token
        const token = authHeader.split(' ')[1]; // Removing 'Bearer' prefix
        jsonwebtoken.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            return res.status(200).json('approved');
        });
    } else {
        return res.status(401).send('Unauthorized');
    }
}

module.exports = {
    verifyToken,
    createJWT,
};