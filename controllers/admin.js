const db = require('../utils/DB');

const deleteUser = (userId) => {
    return new Promise((resolve) => {
        db.query('DELETE from users WHERE id = ?', userId, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
}

const deleteCompany = (userId) => {
    return new Promise((resolve) => {
        db.query('DELETE from users WHERE id = ?', userId, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
}

module.exports = {
    deleteUser,
    deleteCompany,
};