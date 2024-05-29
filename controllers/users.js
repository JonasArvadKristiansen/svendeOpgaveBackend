const bcrypt = require('bcrypt');
const db = require('../utils/DB');
const generatePassword = require('generate-password');
const nodemailer = require('nodemailer');
const mailtrapTP = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

// for getting a users info email
const getEmail = async (userId, res) => {
    try {
        const [rows] = await db.query('SELECT email FROM users WHERE id = ?', userId);

        if (rows.length > 0) {
            return rows[0];
        } else {
            const error = new Error('Ingen bruger fundet');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for getting a users info
const getInfo = async (userId, res) => {
    try {
        const [rows] = await db.query('SELECT fullName, email, phonenumber FROM users WHERE id = ?', userId);

        if (rows.length > 0) {
            return res.status(200).json(rows);
        } else {
            const error = new Error('Ingen bruger fundet');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for login a user
const login = async (req) => {
    const { email, password } = req.body;

    try {
        const [data] = await db.query('SELECT * FROM users WHERE email = ?', email);

        if (data.length === 0) {
            const error = new Error('Ingen bruger fundet');
            error.status = 404;
            throw error;
        }

        const passwordhashed = bcrypt.compareSync(password, data[0].password);

        if (!passwordhashed) {
            const error = new Error('Adgangskode forkert');
            error.status = 401;
            throw error;
        }

        const userType = data[0].isAdmin === 1 ? 'Admin' : 'Normal user'; // ternary operator if else
        return { user: { id: data[0].id, type: userType } };
    } catch (error) {
        throw error;
    }
};

// for creating a user
const create = async (req) => {
    const { fullName, password, email, phonenumber } = req.body;

    // Hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);

    try {
        const [result] = await db.query('INSERT INTO users (fullName, email, password, phonenumber, isAdmin) VALUES (?, ?, ?, ?, ?)', [fullName, email, hashPassword, phonenumber, 0]);

        let createdUser = { id: result.insertId, type: 'Normal user' };
        return { user: createdUser };
    } catch (error) {
        throw error;
    }
};

//checking if email is banned from use
const bannedEmailCheck = async (email) => {
    try {
        const [data] = await db.query('SELECT * FROM bannedEmails WHERE email = ?', email);

        return data.length > 0;
    } catch (error) {
        throw error;
    }
};

// checking if any user with that email exists
const userExist = async (email, userId) => {
    try {
        const [data] = await db.query('SELECT * FROM users WHERE email = ?', email);

        if (data.length > 0 && data[0].id === userId) {
            const error = new Error('Brugeren bruger allerede denne email');
            error.status = 409;
            throw error;
        }

        return data.length > 0;
    } catch (error) {
        throw error;
    }
};

// checking if typed oldPassword is right
const checkSentPassword = async (password, companyID) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [companyID]);

        if (rows.length === 0) {
            const error = new Error('Bruger ikke fundet');
            error.status = 404;
            throw error;
        }

        const passwordMatch = bcrypt.compareSync(password, rows[0].password);

        if (passwordMatch) {
            return true;
        } else {
            const error = new Error('Gamle adgangskode forkert');
            error.status = 401;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for updating a user's information
const update = async (req, userId) => {
    try {
        const { fullName, email, phonenumber } = req.body;
        const valuesForQuery = [];

        let updateQuery = 'UPDATE users SET ';

        if (fullName !== undefined && fullName !== null) {
            updateQuery += 'fullName = ?, ';
            valuesForQuery.push(fullName);
        }

        if (email !== undefined && email !== null) {
            updateQuery += 'email = ?, ';
            valuesForQuery.push(email);
        }

        if (phonenumber !== undefined && phonenumber !== null) {
            updateQuery += 'phonenumber = ?, ';
            valuesForQuery.push(phonenumber);
        }

        // Remove the last comma and space in order to make correct query
        updateQuery = updateQuery.slice(0, -2);

        // Add the WHERE clause
        updateQuery += ' WHERE id = ?';
        valuesForQuery.push(userId);

        const [result] = await db.query(updateQuery, valuesForQuery);

        // Check if rows were affected and/or changed
        if (result.affectedRows > 0) {
            if (result.changedRows > 0) {
                return true;
            } else {
                const error = new Error('Ingenting at opdatere på bruger');
                error.status = 409;
                throw error;
            }
        } else {
            const error = new Error('Ingen bruger at opdatere på dette id');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

const sendEmail = async (mailFields, res) => {
    try {
        // Sending emails using npm nodemailer
        mailtrapTP.sendMail(mailFields, (error, info) => {
            if (error) {
                const error = new Error('Failed to send email');
                error.status = 400;
                throw error;
            }

            return res.status(200).json('Email sendt til ud til virksomhed');
        });
    } catch(error) {
        throw error;
    }
};

// for getting a new password sent
const newUserPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const newPassword = generatePassword.generate({
            length: 20,
            numbers: true,
            uppercase: true,
            lowercase: true,
        });
    
        const mailFields = {
            from: 'jobconnectsupport@jobconnect.com',
            to: email,
            subject: 'Ny adgangskode til login',
            text: `
            Du har anmodet om en ny hos Jobconnect. 
            Din nye adgangkode til login er ${newPassword}. 
            Husk og skifte adgangskode efter og have logget ind`,
        };
    
        mailtrapTP.sendMail(mailFields, async (error, info) => {
            if (error) {
                const error = new Error('kunne ikke sende email');
                error.status = 500;
                throw error;
            }
            await updatePassword(email, newPassword)
            return res.status(200).json('Email sendt ud med en ny adgangskode');
        });
    } catch(error) {
        throw error
    }
};

// for updating a user's password
const updatePassword = async (value1, value2) => {
    try {
        const valuesForQuery = [];
        let updateQuery = 'UPDATE users SET password = ?';

        if(typeof(value1) == 'string') {
            updateQuery += ' WHERE email = ?';
            valuesForQuery.push(bcrypt.hashSync(value2, 10));
            valuesForQuery.push(value1);
        } else {
            updateQuery += ' WHERE id = ?';
            valuesForQuery.push(bcrypt.hashSync(value1.body.newPassword, 10));
            valuesForQuery.push(value2);
        }

        const [result] = await db.query(updateQuery, valuesForQuery);

        // Check if rows were affected and/or changed
        if (result.affectedRows > 0) {
            return true; // returns true is password is updated
        } else {
            const error = new Error('Kunne ikke opdatere adgangskode');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for deleting a user
const deleteUser = async (userId) => {
    try {
        const [result] = await db.query('DELETE from users WHERE id = ?', userId);

        // Check if rows were affected and/or changed
        if (result.affectedRows > 0) {
            return true; // returns true if user is deleted
        } else {
            const error = new Error('Ingen bruger fundet');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getEmail,
    getInfo,
    login,
    create,
    bannedEmailCheck,
    userExist,
    checkSentPassword,
    update,
    sendEmail,
    newUserPassword,
    updatePassword,
    deleteUser,
};
