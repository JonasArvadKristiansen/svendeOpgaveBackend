const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const loginCompanyUser = (req) => {
    let email = req.body.email;
    let password = req.body.password;

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        //select * from database matching the parameter
        db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
            if (err) {
                //reject the promise if error and returns error 500
                reject(err);
            } else if (data.length > 0) {
                // tjekking if typed password match hashed password from database
                let passwordhashed = bcrypt.compareSync(
                    password,
                    data[0].password
                );

                //pwCheck return true if they match
                if (passwordhashed) {
                    const createdUser = {
                        id: data[0].insertId,
                        companyName: data[0].companyName,
                        companyDescription: data[0].companyDescription,
                        address: data[0].address,
                        phonenumber: data[0].phonenumber,
                        email: data[0].email,
                        numberOfEmployees: data[0].numberOfEmployees,
                        cvrNumber: data[0].cvrNumber,
                        type: 'companyUser'
                    };

                    resolve({ success: true, companyUser: createdUser });
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
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM companys WHERE email = ?', email, (err, data) => {
            if (err) {
                //reject the promise if error and returns error 500
                reject(err);
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

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);
    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.execute(
            'INSERT INTO companys (companyName ,password, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [companyName, hashPassword, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber], (err, data) => {
                if (err) {
                //reject the promise if error and returns error 500
                reject(err);
                } else {
                    const createdUser = {
                        id: data.insertId,
                        companyName: companyName,
                        companyDescription: companyDescription,
                        address: address,
                        phonenumber: phonenumber,
                        email: email,
                        numberOfEmployees: numberOfEmployees,
                        cvrNumber: cvrNumber,
                        type: 'companyUser'
                    };

                    resolve({ success: true, companyUser: createdUser });
                }
            }
        );
    });
};

module.exports = {
    loginCompanyUser,
    companyUserExist,
    createCompanyUser,
};