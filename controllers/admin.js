const db = require('../utils/DB');

const allData = (req, res) => {
    Promise.all([
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM companys', (err, result) => {
                if (err) {
                    console.error("Fejl i companys count query:", err);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM users WHERE isAdmin = 0', (err, result) => {
                if (err) {
                    console.error("Fejl i users count query:", err);
                } else {
                    resolve(result[0].count);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM jobpostings', (err, result) => {
                if (err) {
                    console.error("Fejl i jobpostings count query:", err);
                } else {
                    resolve(result[0].count);
                }
            });
        })
    ])
    .then(([companyCount, usersCount, jobpostingCount]) => {
        return res.status(200).json({ countOfcompanys: companyCount, countOfUser: usersCount, countOfJobpostings: jobpostingCount });
    }).catch(error => {
        console.error("Fejl i allData controller:", error);
        return res.status(500).json('Server fejl');
    });
};

const banEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO bannedemails (email) VALUES (?)', email, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else if(result.affectedRows == 0) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
}

const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from users WHERE id = ?', userId, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else if(result.affectedRows == 0) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

const deleteCompany = (companyId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from companys WHERE id = ?', companyId, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else if(result.affectedRows == 0) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

module.exports = {
    allData,
    banEmail,
    deleteUser,
    deleteCompany,
};