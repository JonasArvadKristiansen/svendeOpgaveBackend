const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const loginCompanyUser = (req) => {
    let email = req.body.email;
    let password = req.body.password;

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve) => {
        //select * from database matching the parameter
        db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
            if (err) {
                //resolve false if error
                resolve({ success: false });
            } else if (data.length > 0) {
                // tjekking if typed password match hashed password from database
                let passwordhashed = bcrypt.compareSync(
                    password,
                    data[0].password
                );

                //pwCheck return true if they match
                if (passwordhashed) {
                    db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
                    if (err) {
                        //resolve false if error
                        resolve({ success: false });
                    } else if (data.length > 0) {
                        
                    }
                    const createdUser = {
                        id: data[0].id,
                        type: 'Company user'
                    };

                        resolve({ success: true, companyUser: createdUser });
                    });
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
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
    let companyName = req.body.companyName;
    let password = req.body.password;
    let companyDescription = req.body.companyDescription;
    let address = req.body.address;
    let phonenumber = req.body.phonenumber;
    let email = req.body.email;
    let numberOfEmployees = req.body.numberOfEmployees;
    let cvrNumber = req.body.cvrNumber;
    let jobtypes = req.body.jobtypes;

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);
    
    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve) => {
        db.query(
            'INSERT INTO companys (companyName ,password, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [companyName, hashPassword, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber], (err, data) => {
                if (err) {
                    //resolve false if error
                    resolve({ success: false });
                } else {
                    jobtypes.forEach(element => {
                        db.query('INSERT INTO jobtypes (name, companyID) VALUES (?, ?)', [element, data.insertId], (err, data) => {
                            if(err) {
                                //reject the promise if error and returns error 500
                                resolve({ success: false });
                            }
                            let createdUser = {
                                id: data.insertId,
                                type: 'Company user'
                            };

                            resolve({ success: true, companyUser: createdUser });
                        });
                    });
                }
            }
        );
    });
};

const deleteCompanyUser = (companyID) => {
    return new Promise((resolve) => {
        db.query('DELETE from companys WHERE id = ?', companyID, (err, result) => {
            if (err) {
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
    deleteCompanyUser,
};