const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const loginCompanyUser = (req) => {
    const { email, password } = req.body;

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve) => {
        db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
            if (err) {
                resolve({ success: false });
            } else if (data.length > 0) {
                // tjekking if typed password match hashed password from database
                let passwordhashed = bcrypt.compareSync(password, data[0].password);

                //passwordhashed return true if they match
                if (passwordhashed) {
                    db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
                        if (err) {
                            resolve({ success: false });
                        } else if (data.length > 0) {
                            const createdUser = { id: data[0].id, type: 'Company user' };
                            resolve({ success: true, companyUser: createdUser });
                        }
                    });
                } else {
                    resolve({ success: false });
                }
            } else {
                resolve({ success: false });
            }
        });
    });
};

const companyUserExist = (email) => {
    return new Promise((resolve, ) => {
        db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
            if (err) {
                //resolve false if error
                resolve({ success: false });
            } else {
                //resolve with true or false based on the query result
                resolve(data.length > 0);
            }
        });
    });
};

const createCompanyUser = (req) => {
    const { companyName, password, repeatPassword, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } = req.body;

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);
    
    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO companys (companyName ,password, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [companyName, hashPassword, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber], (err, result) => {
                if (err) {
                    resolve({ success: false });
                } else {
                    jobtypes.forEach(element => {
                        db.query('INSERT INTO jobtypes (name, companyID) VALUES (?, ?)', [element, result.insertId], (err, data) => {
                            if(err) {
                                resolve({ success: false });
                            }
                        });

                        let createdUser = { id: result.insertId, type: 'Company user' };
                        resolve({ success: true, companyUser: createdUser });
                    });
                }
            }
        );
    });
};

const checkSentPassword = (password, companyID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM companys WHERE id = ?', companyID, (err, data) => {
            if (err) {
                resolve({ success: false });
            } else {
                let passwordhashed = bcrypt.compareSync(password, data[0].password);
                if(passwordhashed && data.length > 0) {
                    resolve({success: true})
                } else {
                    resolve({success: false})
                }
            }
        });
    });
}

const updateCompanyPassword = (req, userId) => {
    const { newPassword } = req.body;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    return new Promise((resolve, reject) => {
        db.query('UPDATE companys SET password = ? WHERE id = ?', [hashPassword, userId], (err, result) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
}

const deleteCompanyUser = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from companys WHERE id = ?', companyID, (err, result) => {
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

module.exports = {
    loginCompanyUser,
    companyUserExist,
    createCompanyUser,
    checkSentPassword,
    updateCompanyPassword,
    deleteCompanyUser,
};