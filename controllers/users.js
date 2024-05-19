const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const getInfo = (userId, res) => {
    db.query('SELECT fullName ,email, phonenumber FROM users WHERE id = ?', userId, (error, data) => {
        if (error) {
            console.error(error);
            return res.status(500).json('Kunne ikke hente bruger profil');
        } else {
            return res.status(200).json(data);
        }
    });
};

// for login a user
const login = (req) => {
    const { email, password } = req.body;

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke logge brugeren ind' });
            } else if (data.length > 0) {
                // tjekking if typed password match hashed password from database
                let passwordhashed = bcrypt.compareSync(password, data[0].password);

                //pwCheck return true if they match
                if (passwordhashed) {
                    let createdUser = {};

                    if (data[0].isAdmin === 1) {
                        createdUser = { id: data[0].id, type: 'Admin' };
                    } else {
                        createdUser = { id: data[0].id, type: 'Normal user' };
                    }
                    resolve({ success: true, user: createdUser });
                } else {
                    reject({ errorMessage: 'Adgangskode forkert' });
                }
            } else {
                reject({ errorMessage: 'Ingen bruger fundet' });
            }
        });
    });
};

// for creating a user
const create = (req) => {
    const { fullName, password, email, phonenumber } = req.body;

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO users (fullName ,email, password, phonenumber, isAdmin) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, hashPassword, phonenumber, 0],
            (error, data) => {
                if (error) {
                    reject({ error: error, errorMessage: 'Kunne ikke lave ny bruger' });
                } else {
                    let createdUser = { id: data.insertId, type: 'Normal user' };
                    resolve({ success: true, user: createdUser });
                }
            }
        );
    });
};

//checking if email is banned from use
const bannedEmailCheck = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM bannedemails WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke hente ban emails' });
            } else {
                resolve(data.length <= 0);
            }
        });
    });
};

//checking if any user with that email exists
const userExist = (email, userId) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke tjekke brugere igennem efter email' });
            } else if (data.length > 0 && data[0].id == userId) {
                reject({ error: error, errorMessage: 'Brugeren bruger allerede denne email' });
            } else {
                resolve(data.length > 0);
            }
        });
    });
};

// checking if typed oldPassword is right
const checkSentPassword = (password, companyID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', companyID, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke hente gamle adgangskode' });
            } else {
                let passwordhashed = bcrypt.compareSync(password, data[0].password);
                if (passwordhashed && data.length > 0) {
                    resolve(true);
                } else {
                    reject({ errorMessage: 'Gamle adgangskode forkert' });
                }
            }
        });
    });
};

// for updating a user's information
const update = (req, userId) => {
    let updateQuery = 'UPDATE users SET ';

    const fieldsForUpdates = [];
    const valuesForQuery = [];

    if (req.body.fullName !== undefined && req.body.fullName !== null) {
        fieldsForUpdates.push('fullName = ?');
        valuesForQuery.push(req.body.fullName);
    }

    if (req.body.email !== undefined && req.body.email !== null) {
        fieldsForUpdates.push('email = ?');
        valuesForQuery.push(req.body.email);
    }

    if (req.body.phonenumber !== undefined && req.body.phonenumber !== null) {
        fieldsForUpdates.push('phonenumber = ?');
        valuesForQuery.push(req.body.phonenumber);
    }

    //joining updateQuery with conditions that needs to be updated
    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE id = ?';

    valuesForQuery.push(userId);

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere bruger' });
            } else if (result.affectedRows == 0) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere bruger' });
            } else {
                resolve(true);
            }
        });
    });
};

// for updating a user's password
const updatePassword = (req, userId) => {
    let newPassword = req.body.newPassword;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    return new Promise((resolve, reject) => {
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword, userId], (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere adgangskoden' });
            } else {
                resolve(true);
            }
        });
    });
};

// for deleting a user
const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from users WHERE id = ?', userId, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke slette virksomheds bruger' });
            } else {
                resolve(true);
            }
        });
    });
};

module.exports = {
    getInfo,
    login,
    create,
    bannedEmailCheck,
    userExist,
    checkSentPassword,
    update,
    updatePassword,
    deleteUser,
};
