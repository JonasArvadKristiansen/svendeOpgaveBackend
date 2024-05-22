const db = require('../utils/DB');

const allData = async (req, res) => {
    try {
        const [companyCount] = await db.query('SELECT COUNT(*) AS count FROM companys');
        const [usersCount] = await db.query('SELECT COUNT(*) AS count FROM users WHERE isAdmin = 0');
        const [jobpostingCount] = await db.query('SELECT COUNT(*) AS count FROM jobpostings');

        return res.status(200).json({ countOfcompanys: companyCount[0].count, countOfUser: usersCount[0].count, countOfJobpostings: jobpostingCount[0].count });
    } catch (error) {
        throw error;
    }
};

// for getting all banned emails
const getAllBannedEmails = async (req, res) => {
    try {
        const [result] = await db.query('SELECT email FROM bannedEmails');
        
        res.status(200).json({ emails: result });
    } catch (error) {
        throw error;
    }
};

// this is used to check if email is already banned
const bannedEmailCheck = async (email) => {
    try {
        const [result] = await db.query('SELECT * FROM bannedEmails WHERE email = ?', email);
        
        if (result.length > 0) {
            const error = new Error('Ban email eksitere allerede');
            error.status = 409;
            throw error;
        } else {
            return true;
        }
    } catch (error) {
        throw error;
    }
};

// for ban a email from use
const banEmail = async (email) => {
    try {
        const [result] = await db.query('INSERT INTO bannedEmails (email) VALUES (?)', email);
        
        if (result.affectedRows === 0) {
            const error = new Error('Kunne ikke indsætte ban email');
            error.status = 409;
            throw error;
        } else {
            await db.query('DELETE from users WHERE email = ?', email);
            await db.query('DELETE from companys WHERE email = ?', email);
            return true;
        }
    } catch (error) {
        throw error;
    }
};

// for deleting a user with admin permissions
const deleteUser = async (email) => {
    try {
        const [result] = await db.query('DELETE from users WHERE email = ?', email);
        
        if (result.affectedRows === 0) {
            const error = new Error('Brugerens profil kunne ikke slettes eller brugerens profil kunne ikke findes');
            error.status = 404;
            throw error;
        } else {
            return true;
        }
    } catch (error) {
        throw error;
    }
};

// for deleting a company with admin permissions
const deleteCompany = async (email) => {
    try {
        const [result] = await db.query('DELETE from companys WHERE email = ?', email);
        
        if (result.affectedRows === 0) {
            const error = new Error('Virksomheds brugeren kunne ikke slettes eller virksomheds brugeren kunne ikke findes');
            error.status = 404;
            throw error;
        } else {
            return { success: true };
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    allData,
    getAllBannedEmails,
    bannedEmailCheck,
    banEmail,
    deleteUser,
    deleteCompany,
};
