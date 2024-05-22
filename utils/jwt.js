const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

// creating token for a user
function createJWT(user, res) {
    try {
        // Signing JWT
        const accessToken = jsonwebtoken.sign({ user }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

        // Return the token in json format
        return res.status(200).json({ token: accessToken });
    } catch (error) {
        console.error('Error creating token:', error);
        return res.status(500).json({ message: 'Token kunne ikke laves' });
    }
}

// tjekking if token is vaild
async function verifyToken(req) {
    return new Promise((resolve, reject) => {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jsonwebtoken.verify(token, process.env.TOKEN_SECRET, (error, decodedToken) => {
                if (error) {
                    const error = new Error('Fejl i at godkende token eller token ikke gyldig længere');
                    error.status = 498;
                    reject(error);
                } else {
                    resolve({ userId: decodedToken.user.id, type: decodedToken.user.type });
                }
            });
        } else {
            const error = new Error('ingen token sent');
            error.status = 498;
            reject(error);
        }
    });
}

module.exports = {
    verifyToken,
    createJWT,
};
