const db = require('../utils/DB');

const allData = (req, res) => {
    //promise all makes it so that if all is success it will send the data to frontend, but if one fails it returns error
    Promise.all([
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM companys', (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM users WHERE isAdmin = 0', (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM jobpostings', (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
    ])
        .then(([companyCount, usersCount, jobpostingCount]) => {
            return res.status(200).json({ countOfcompanys: companyCount, countOfUser: usersCount, countOfJobpostings: jobpostingCount });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json('Server fejl');
        });
};

// for getting all banned emails
const getAllBannedEmails = (req, res) => {
    db.query('SELECT email FROM bannedemails', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json('server fejl');
        } else {
            return res.status(200).json({ emails: data });
        }
    });
};

// this is used to check if email is already banned
const bannedEmailCheck = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM bannedemails WHERE email = ?', email, (err, data) => {
            if (err) {
                console.error(err);
                resolve({ success: false });
            } else {
                if (data.length > 0) {
                    resolve({ success: false });
                } else {
                    resolve({ success: true });
                }
            }
        });
    });
};

// for ban a email from use
const banEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO bannedemails (email) VALUES (?)', email, (err, result) => {
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

// for deleting a user with admin permissions
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

// for deleting a company with admin permissions
const deleteCompany = (companyId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from companys WHERE id = ?', companyId, (err, result) => {
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
    allData,
    getAllBannedEmails,
    bannedEmailCheck,
    banEmail,
    deleteUser,
    deleteCompany,
};
