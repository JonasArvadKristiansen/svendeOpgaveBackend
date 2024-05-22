const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const allCompanys = async (req, res) => {
    try {
        const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
        const rowsToSkip = (currentPageNumber - 1) * 10; // rows to skip

        // Query to fetch number of pages with data
        const [countResult] = await db.query('SELECT COUNT(*) AS count FROM companys');

        // Counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // Query to fetch data for paginated page
        const [companysData] = await db.query('SELECT id, companyName, companyDescription, jobpostingCount FROM companys LIMIT 10 OFFSET ?', [
            rowsToSkip,
        ]);

        res.status(200).json({ companys: companysData, pages: pageCount });
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

const filterCompanys = async (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1;
    const rowsToSkip = (currentPageNumber - 1) * 10;

    try {
        let counterQuery = 'SELECT COUNT(*) AS count FROM companys';
        let filterQuery = 'SELECT id, companyName, companyDescription, jobpostingCount FROM companys';
        const whereConditions = [];
        const whereValues = [];

        if (req.query.jobtype) {
            whereConditions.push('jobtypes LIKE ?');
            whereValues.push(`%${req.query.jobtype}%`);
        }
        if (req.query.search) {
            whereConditions.push('companyName LIKE ?');
            whereValues.push(`%${req.query.search}%`);
        }

        if (whereConditions.length > 0) {
            const whereClause = ' WHERE ' + whereConditions.join(' AND ');
            counterQuery += whereClause;
            filterQuery += whereClause;
        }

        const [[{ count }]] = await db.query(counterQuery, whereValues); // nested destructuring
        const pageCount = Math.ceil(count / 10);

        filterQuery += ' LIMIT 10 OFFSET ?';
        const [companysData] = await db.query(filterQuery, [...whereValues, rowsToSkip]);

        if (companysData.affectedRows === 0) {
            const error = new Error('Kunne ikke opdatere virksomheds bruger');
            error.status = 404;
            throw error;
        }

        res.status(200).json({ companys: companysData, pages: pageCount, url: req.originalUrl });
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

const profile = async (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1;
    const rowsToSkip = (currentPageNumber - 1) * 10;
    const { companyID } = req.query;

    try {
        const [companyProfileData] = await db.query(
            'SELECT companyName, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes FROM companys WHERE id = ?',
            [companyID]
        );
        const [jobpostingsData] = await db.query(
            'SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.companyID = ? LIMIT 10 OFFSET ?',
            [companyID, rowsToSkip]
        );
        const [pageCountData] = await db.query('SELECT COUNT(*) AS count FROM jobpostings WHERE companyID = ?', [companyID]);

        if (!companyProfileData.length) {
            const error = new Error('Ingen virksomheds bruger fundet');
            error.status = 404;
            throw error;
        }

        const pageCount = Math.ceil(pageCountData[0].count / 10);

        res.status(200).json({ companyProfileData, jobpostingsData, pages: pageCount });
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

const getCompanyInfo = async (companyID, req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToSkip = (currentPageNumber - 1) * 10; // rows to skip

    try {
        const [companyProfileData] = await db.query(
            'SELECT companyName, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes FROM companys WHERE id = ?',
            [companyID]
        );
        const [jobpostingsData] = await db.query(
            'SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.companyID = ? LIMIT 10 OFFSET ?',
            [companyID, rowsToSkip]
        );
        const [countData] = await db.query('SELECT COUNT(*) AS count FROM jobpostings WHERE companyID = ?', [companyID]);

        if (!companyProfileData.length) {
            const error = new Error('Ingen virksomheds bruger fundet');
            error.status = 404;
            throw error;
        }

        const pageCount = Math.ceil(countData[0].count / 10);

        return res.status(200).json({ companyProfileData, jobpostingsData, pages: pageCount });
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

const login = async (req) => {
    const { email, password } = req.body;

    try {
        const [data] = await db.query('SELECT * FROM companys WHERE email = ?', email);

        if (data.length === 0) {
            const error = new Error('Ingen Virksomheds bruger fundet');
            error.status = 404;
            throw error;
        }

        const passwordhashed = bcrypt.compareSync(password, data[0].password);

        if (!passwordhashed) {
            const error = new Error('Adgangskode forkert');
            error.status = 401;
            throw error;
        }

        const loginUser = { id: data[0].id, type: 'Company user' };
        return { user: loginUser };
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

//creating company user
const create = async (req) => {
    const { companyName, password, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } = req.body;

    // Hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);

    try {
        // Inserting data into the database
        const result = await db.query(
            'INSERT INTO companys (companyName, password, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [companyName, hashPassword, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes.join(','), 0]
        );

        // Returning created user information
        const createdUser = { id: result.insertId, type: 'Company user' };
        return { user: createdUser };
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

//checking if email is banned from use
const bannedEmailCheck = async (email) => {
    try {
        const [data] = await db.query('SELECT * FROM bannedEmails WHERE email = ?', email);

        return data.length > 0;
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

//checking if any company user with that email exists
const companyExist = async (email, userId) => {
    try {
        const [data] = await db.query('SELECT * FROM companys WHERE email = ?', email);

        if (data.length > 0 && data[0].id === userId) {
            const error = new Error('Brugeren bruger allerede denne email');
            error.status = 409;
            throw error;
        }

        return data.length > 0;
    } catch (error) {
        throw error; // Passes error to the central error handler
    }
};

// checking if typed oldPassword is right
const checkSentPassword = async (password, companyID) => {
    try {
        const [rows] = await db.query('SELECT * FROM companys WHERE id = ?', companyID);

        if (rows.length === 0) {
            const error = new Error('Ingen virksomhed fundet');
            error.status = 404;
            throw error;
        }

        const isPasswordMatch = bcrypt.compareSync(password, rows[0].password);

        if (!isPasswordMatch) {
            const error = new Error('Gamle adgangskode forkert');
            error.status = 409;
            throw error;
        }

        return true;
    } catch (error) {
        throw error;
    }
};

// for checking if a company owns any jobposts
const allCompanysJobpostings = async (companyID) => {
    try {
        const [result] = await db.query('SELECT COUNT(*) AS count FROM jobpostings WHERE companyID = ?', companyID);

        if (!result || !result[0]) {
            const error = new Error('Kunne ikke hente virksomheds brugers opslag');
            error.status = 404;
            throw error;
        }

        return { jobPostingsCount: result[0].count };
    } catch (error) {
        throw error;
    }
};

// for updating a company user's information
const updateCompany = async (req, companyID) => {
    try {
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

        if (req.body.city !== undefined && req.body.city !== null) {
            fieldsForUpdates.push('city = ?');
            valuesForQuery.push(req.body.city);
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

        if (req.body.jobtypes !== undefined && req.body.jobtypes !== null) {
            fieldsForUpdates.push('jobtypes = ?');
            valuesForQuery.push(req.body.jobtypes.join(','));
        }

        updateQuery += fieldsForUpdates.join(', ');
        updateQuery += ' WHERE id = ?';

        valuesForQuery.push(companyID);

        const [result] = await db.query(updateQuery, valuesForQuery);

        if (result.affectedRows > 0) {
            if (result.changedRows > 0) {
                return true;
            } else {
                const error = new Error('Ingenting at opdatere på virksomheds bruger');
                error.status = 409;
                throw error;
            }
        } else {
            const error = new Error('Ingen virksomheds bruger at opdatere på dette id');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for updating jobposts related to the company user
const updateJobpostes = async (companyID, req) => {
    let updateQuery = 'UPDATE jobpostings SET ';

    const fieldsForUpdates = [];
    const valuesForQuery = [];

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

    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE companyID = ?';

    valuesForQuery.push(companyID);

    try {
        const [result] = await db.query(updateQuery, valuesForQuery);

        if (result.affectedRows === 0) {
            const error = new Error('Kunne ikke opdatere jobopslag for virksomheds bruger');
            error.status = 404;
            throw error;
        }

        return true;
    } catch (error) {
        throw error;
    }
};

// for updating a company user's password
const updatePassword = async (req, userId) => {
    const { newPassword } = req.body;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    try {
        const [result] = await db.query('UPDATE companys SET password = ? WHERE id = ?', [hashPassword, userId]);

        if (result.affectedRows === 0) {
            const error = new Error('Kunne ikke opdatere adgangskoden');
            error.status = 404;
            throw error;
        }

        return true;
    } catch (error) {
        throw error;
    }
};

// for deleting a company user
const deleteCompanyUser = async (companyID) => {
    try {
        const [result] = await db.query('DELETE from companys WHERE id = ?', companyID);

        if (result.affectedRows === 0) {
            const error = new Error('Ingen Virksomheds bruger fundet');
            error.status = 404;
            throw error;
        }

        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    allCompanys,
    filterCompanys,
    profile,
    getCompanyInfo,
    login,
    create,
    bannedEmailCheck,
    companyExist,
    checkSentPassword,
    allCompanysJobpostings,
    updateCompany,
    updateJobpostes,
    updatePassword,
    deleteCompanyUser,
};
