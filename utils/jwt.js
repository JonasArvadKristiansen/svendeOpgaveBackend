const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

//creating token for a user
function createJWT(user, res) {
    const accessToken = jsonwebtoken.sign({ user: user }, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 });
    if (accessToken) {
        return res.status(200).json(accessToken);
    } else {
        return res.status(500).json('Token kunne ikke laves');
    }
}

//tjekking if user token is vaild
function verifyToken(req) {
    return new Promise((resolve) => {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            // Extract and verify token
            const token = authHeader.split(' ')[1]; // Removing 'Bearer' prefix
            jsonwebtoken.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
                if (err) {
                    resolve({ success: false }); // Token verification failed
                } else {
                    resolve({ success: true, userId: decodedToken.user.id, type: decodedToken.user.type }); // Token verification succeeded
                }
            });
        } else {
            resolve({ success: false }); // No token
        }
    });
}

module.exports = {
    verifyToken,
    createJWT,
};
