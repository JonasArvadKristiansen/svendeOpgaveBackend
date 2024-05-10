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
                    let createdUser = { id: result.insertId, type: 'Company user' };
                    resolve({ success: true, companyUser: createdUser, CompanyId: result.insertId, jobtypesData: jobtypes });
                }
            }
        );
    });
};

const createJobtypes = (CompanyId, jobtypesData) => {
    return new Promise((resolve, reject) => {
        jobtypesData.forEach(element => {
            db.query('INSERT INTO jobtypes (name, companyID) VALUES (?, ?)', [element, CompanyId], (err, data) => {
                if(err) {
                    resolve({ success: false });
                }
            });
        });

        resolve({ success: true })
    });
};

const allCompanysJobpostings = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) AS count FROM jobpostings WHERE companyID = ?', companyID, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve({ jobPostingsCount: result[0].count });
            }
        });
    })
};

const bannedEmailCheck = (email) => {
    return new Promise((resolve, reject ) => {
        db.query('SELECT * FROM bannedemails WHERE email = ?', email, (err, data) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve(data.length > 0);
            }
        });
    });
};

const companyUserExist = (email) => {
    return new Promise((resolve, reject ) => {
        db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve(data.length > 0);
            }
        });
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

const updateCompany = (req, companyID) => {
    let updateQuery = 'UPDATE companys SET ';

    const fieldsForUpdates = [];
    const valuesForQuery = [];
    
    if (req.body.companyName !== undefined && req.body.companyName !== null) {
        fieldsForUpdates.push('companyName = ?');
        valuesForQuery.push(req.body.companyName);
    }

    if (req.body.companyDescription !== undefined && req.body.companyDescription !== null) {
        fieldsForUpdates.push('companyDescription = ?');
        valuesForQuery.push(req.body.companyDescription);
    }

    if (req.body.address !== undefined && req.body.address !== null) {
        fieldsForUpdates.push('address = ?');
        valuesForQuery.push(req.body.address);
    }

    if (req.body.phonenumber !== undefined && req.body.phonenumber !== null) {
        fieldsForUpdates.push('phonenumber = ?');
        valuesForQuery.push(req.body.phonenumber);
    }

    if (req.body.email !== undefined && req.body.email !== null) {
        fieldsForUpdates.push('email = ?');
        valuesForQuery.push(req.body.email);
    }

    if (req.body.numberOfEmployees !== undefined && req.body.numberOfEmployees !== null) {
        fieldsForUpdates.push('numberOfEmployees = ?');
        valuesForQuery.push(req.body.numberOfEmployees);
    }

    if (req.body.cvrNumber !== undefined && req.body.cvrNumber !== null) {
        fieldsForUpdates.push('cvrNumber = ?');
        valuesForQuery.push(req.body.cvrNumber);
    }

    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE id = ?';

    valuesForQuery.push(companyID);

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (err, result) => {
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



const updateJobpostes = (companyID, req) => {
    let updateQuery = 'UPDATE jobpostings SET ';

    const fieldsForUpdates = [];
    const valuesForQuery = [];
    
    if (req.body.address !== undefined && req.body.address !== null) {
        fieldsForUpdates.push('address = ?');
        valuesForQuery.push(req.body.address);
    }

    if (req.body.phonenumber !== undefined && req.body.phonenumber !== null) {
        fieldsForUpdates.push('phonenumber = ?');
        valuesForQuery.push(req.body.companyDescription);
    }

    if (req.body.email !== undefined && req.body.email !== null) {
        fieldsForUpdates.push('email = ?');
        valuesForQuery.push(req.body.email);
    }

    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE companyID = ?';

    valuesForQuery.push(companyID);

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (err, result) => {
            console.log(result)
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
};

const deleteJobtypes = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from jobtypes WHERE companyID = ?', companyID, (err, result) => {
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
};

module.exports = {
    loginCompanyUser,
    createCompanyUser,
    createJobtypes,
    allCompanysJobpostings,
    bannedEmailCheck,
    companyUserExist,
    checkSentPassword,
    updateCompany,
    updateJobpostes,
    updateCompanyPassword,
    deleteJobtypes,
    deleteCompanyUser,
};