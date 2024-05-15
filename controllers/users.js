const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const getUserInfo = (userId, res) => {
    db.query('SELECT fullName ,email, phonenumber FROM users WHERE id = ?', userId, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('SQL fejl');
        } else {
            return res.status(200).json(data);
        }
    });
};

const loginUser = (req) => {
    const { email, password } = req.body;

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', email, (err, data) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
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
                    resolve({ success: false });
                }
            } else {
                resolve({ success: false });
            }
        });
    });
};

const createUser = (req) => {
    const { fullName, password, email, phonenumber } = req.body;

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO users (fullName ,email, password, phonenumber, isAdmin) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, hashPassword, phonenumber, 0],
            (err, data) => {
                if (err) {
                    console.error(err);
                    resolve({ success: false });
                } else if (data.affectedRows == 0) {
                    resolve({ success: false });
                } else {
                    let createdUser = { id: data.insertId, type: 'Normal user' };

                    resolve({ success: true, user: createdUser });
                }
            }
        );
    });
};

const bannedEmailCheck = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM bannedemails WHERE email = ?', email, (err, data) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else {
                resolve(data.length > 0);
            }
        });
    });
};

const userExist = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', email, (err, data) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else {
                resolve(data.length > 0);
            }
        });
    });
};

const checkSentPassword = (password, userId) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', userId, (err, data) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else {
                let passwordhashed = bcrypt.compareSync(password, data[0].password);
                if (passwordhashed && data.length > 0) {
                    resolve({ success: true });
                } else {
                    resolve({ success: false });
                }
            }
        });
    });
};

const updateUser = (req, userId) => {
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

    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE id = ?';

    valuesForQuery.push(userId);

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (err, result) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else if (result.affectedRows == 0) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

const updateUserPassword = (req, userId) => {
    let newPassword = req.body.newPassword;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    return new Promise((resolve, reject) => {
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword, userId], (err, result) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else if (result.affectedRows == 0) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from users WHERE id = ?', userId, (err, result) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else if (result.affectedRows == 0) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

module.exports = {
    getUserInfo,
    loginUser,
    createUser,
    bannedEmailCheck,
    userExist,
    checkSentPassword,
    updateUser,
    updateUserPassword,
    deleteUser,
};
