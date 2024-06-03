const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

// Creating token for a user and setting it in a cookie
async function createJWT(user, res) {
    try {
        // Signing JWT
        const accessToken = jsonwebtoken.sign({ user }, process.env.TOKEN_SECRET, { expiresIn: '2h' });

        // Set token in a cookie

        await res.cookie('Authorization', accessToken, {
            maxAge: 2 * 60 * 60 * 1000, // max lifetime in millseconds
            httpOnly: false, // Not setting httpOnly
            secure: true, // Require HTTPS connection
            sameSite: 'None', // Allow cross-site requests
        });

        return true;
    } catch (error) {
        throw error;
    }
}

// Checking if token is valid by retrieving it from the cookie
async function verifyToken(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies.Authorization; // Retrieve the token from cookie

        if (token) {
            jsonwebtoken.verify(token, process.env.TOKEN_SECRET, (error, decodedToken) => {
                if (error) {
                    // token verification error
                    const customError = new Error('Error verifying token or token is no longer valid');
                    customError.status = 498;
                    reject(customError);
                } else {
                    // Resolve with decoded token
                    resolve({ userId: decodedToken.user.id, type: decodedToken.user.type, email: decodedToken.user.email });
                }
            });
        } else {
            // No token found in the cookie
            const error = new Error('No token sent');
            error.status = 498;
            reject(error);
        }
    });
}

module.exports = {
    verifyToken,
    createJWT,
};
