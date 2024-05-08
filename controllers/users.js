const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const loginUser = (req) => {
    let email = req.body.email;
    let password = req.body.password;

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        //select * from database matching the parameter
        db.query('SELECT * FROM users WHERE email = ?', email, (err, data) => {
            if (err) {
                //reject the promise if error and returns error 500
                reject(err);
            } else if (data.length > 0) {
                // tjekking if typed password match hashed password from database
                let passwordhashed = bcrypt.compareSync(
                    password,
                    data[0].userpassword
                );

                //pwCheck return true if they match
                if (passwordhashed) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    });
};

const userExist = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', email, (err, data) => {
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

const createUser = (req) => {
    let fullName = req.body.fullName;
    let password = req.body.password;
    let email = req.body.email;
    let phonenumber = req.body.phonenumber;

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);
    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.execute(
            'INSERT INTO users (fullName ,email, password, phonenumber, isAdmin) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, hashPassword, phonenumber, 0], (err, data) => {
                if (err) {
                //reject the promise if error and returns error 500
                reject(err);
                } else {
                    const createdUser = {
                        id: data.insertId,
                        fullName: fullName,
                        email: email,
                        phonenumber: phonenumber
                    };

                    resolve({ success: true, user: createdUser });
                }
            }
        );
    });
};

module.exports = {
    userExist,
    createUser,
    loginUser,
};