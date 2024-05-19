const db = require('../utils/DB');

const allData = (req, res) => {
    //promise all makes it so that if all is success it will send the data to frontend, but if one fails it returns error
    Promise.all([
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM companys', (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM users WHERE isAdmin = 0', (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM jobpostings', (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
    ])
        .then(([companyCount, usersCount, jobpostingCount]) => {
            return res.status(200).json({ countOfcompanys: companyCount, countOfUser: usersCount, countOfJobpostings: jobpostingCount });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json('Kunne ikke hente statistik data');
        });
};

// for getting all banned emails
const getAllBannedEmails = (req, res) => {
    db.query('SELECT email FROM bannedemails', (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).json('Kunne ikke hente ban emails');
        } else {
            return res.status(200).json({ emails: data });
        }
    });
};

// this is used to check if email is already banned
const bannedEmailCheck = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM bannedemails WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke tjekke ban email' });
            } else {
                if (data.length > 0) {
                    reject({ errorMessage: 'Ban email eksitere allerede' });
                } else {
                    resolve(true);
                }
            }
        });
    });
};

// for ban a email from use
const banEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO bannedemails (email) VALUES (?)', email, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke ban email' });
            } else if (result.affectedRows == 0) {
                reject({ errorMessage: 'Kunne ikke ban email' });
            } else {
                resolve(true);
            }
        });
    });
};

// for deleting a user with admin permissions
const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from users WHERE id = ?', userId, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Brugerens profil kunne ikke slettes eller brugerens profil kunne ikke findes' });
            } else if (result.affectedRows == 0) {
                reject({ errorMessage: 'Brugerens profil kunne ikke slettes eller brugerens profil kunne ikke findes' });
            } else {
                resolve(true);
            }
        });
    });
};

// for deleting a company with admin permissions
const deleteCompany = (companyId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from companys WHERE id = ?', companyId, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Virksomheds brugeren kunne ikke slettes eller virksomheds brugeren kunne ikke findes' });
            } else if (result.affectedRows == 0) {
                reject({ errorMessage: 'Virksomheds brugeren kunne ikke slettes eller virksomheds brugeren kunne ikke findes' });
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
