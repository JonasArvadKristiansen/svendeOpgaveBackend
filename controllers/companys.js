const bcrypt = require('bcrypt');
const db = require('../utils/DB');

const allCompanys = (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToskip = (currentPageNumber - 1) * 10; // rows to skip

    // query to fetch number of pages with data
    db.query('SELECT COUNT(*) AS count FROM companys', (error, countResult) => {
        if (error) {
            console.error(error);
            return res.status(500).json('Kunne ikke hente virksomhedes profiler');
        }

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // query to fetch data for paginated page
        db.query('SELECT id, companyName, companyDescription, jobpostingCount FROM companys LIMIT 10 OFFSET ?', [rowsToskip], (error, data) => {
            if (error) {
                console.error(error);
                return res.status(500).json('Kunne ikke hente virksomheds profiler');
            } else {
                res.status(200).json({ companys: data, pages: pageCount });
            }
        });
    });
};

const filterCompanys = (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToSkip = (currentPageNumber - 1) * 10; //rows to skip

    // query to fetch number of rows with data
    let counterQuery = 'SELECT COUNT(*) AS count FROM companys';
    let whereconditions = [];
    let whereValues = [];

    // if conditions checking if some or all query parameters are present
    if (req.query.jobtype) {
        whereconditions.push('jobtypes LIKE ?');
        whereValues.push(`%${req.query.jobtype}%`);
    }
    if (req.query.search) {
        whereconditions.push('(companyName LIKE ?)');
        whereValues.push(`%${req.query.search}%`);
    }

    // adding the WHERE clause if there are conditions
    if (whereconditions.length > 0) {
        counterQuery += ' WHERE ' + whereconditions.join(' AND ');
    }

    // query to fetch number of rows with data
    db.query(counterQuery, whereValues, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json('Kunne ikke flitrere virksomheds profiler');
        }

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // select query for getting data
        let filterQuery = `SELECT id, companyName, companyDescription, jobpostingCount FROM companys`;

        // joining whereconditions on filterQuery
        if (whereconditions.length > 0) {
            filterQuery += ' WHERE ' + whereconditions.join(' AND ');
        }

        // setting up how many rows to take and how many to skip before taking rows
        filterQuery += ' LIMIT 10 OFFSET ?';

        // query to fetch data for paginated page and ... spread operator is used to copy one a array to a new one
        db.query(filterQuery, [...whereValues, rowsToSkip], (error, data) => {
            if (error) {
                console.error(error);
                return res.status(500).json('Kunne ikke flitrere virksomheds profiler');
            } else {
                res.status(200).json({ companys: data, pages: pageCount, url: req.originalUrl });
            }
        });
    });
};

const profile = (req, res) => {
    const { companyID } = req.query;
    //promise all makes it so that if all is success it will send the data to frontend, but if one fails it returns error
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(
                'SELECT companyName, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes FROM companys WHERE id = ?',
                [companyID],
                (error, data) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(data);
                    }
                }
            );
        }),
        new Promise((resolve, reject) => {
            db.query(
                'SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.companyID = ?',
                [companyID],
                (error, data) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(data);
                    }
                }
            );
        }),
    ])
        .then(([companyProfileData, jobpostingsData]) => {
            return res.status(200).json({ companyProfileData: companyProfileData, jobpostingsData: jobpostingsData });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json('Kunne ikke virksomheds brugers profil');
        });
};

const getCompanyInfo = (companyId, res) => {
    db.query(
        'SELECT companyName ,companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys WHERE id = ?',
        companyId,
        (error, data) => {
            if (error) {
                console.error(error);
                return res.status(500).json('Kunne ikke hente virksomheds bruger');
            } else {
                return res.status(200).json(data);
            }
        }
    );
};

const login = (req) => {
    const { email, password } = req.body;

    // had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM companys WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke logge virksomheds brugeren ind' });
            } else if (data.length > 0) {
                // tjekking if typed password match hashed password from database
                let passwordhashed = bcrypt.compareSync(password, data[0].password);

                // passwordhashed return true if they match
                if (passwordhashed) {
                    const createdUser = { id: data[0].id, type: 'Company user' };
                    resolve({ success: true, companyUser: createdUser });
                } else {
                    reject({errorMessage: 'Adgangskode forkert'});
                }
            } else {
                reject({errorMessage: 'Ingen bruger fundet'});
            }
        });
    });
};

//creating company user
const create = (req) => {
    const { companyName, password, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes } = req.body;

    //hashing password user typed
    const hashPassword = bcrypt.hashSync(password, 10);

    //had to wrap in a promise in order to return true or false. If i did not it returned before value was resolved
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO companys (companyName ,password, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [companyName, hashPassword, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes.join(','), 0],
            (error, result) => {
                if (error) {
                    reject({ error: error, errorMessage: 'Kunne ikke lave ny virksomheds bruger' });
                } else {
                    let createdUser = { id: result.insertId, type: 'Company user' };
                    resolve({companyUser: createdUser, CompanyId: result.insertId, jobtypesData: jobtypes });
                }
            }
        );
    });
};

//checking if email is banned from use
const bannedEmailCheck = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM bannedemails WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke hente ban emails' });
            } else {
                resolve(data.length > 0);
            }
        });
    });
};

//checking if any company user with that email exists
const companyExist = (email, userId) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM companys WHERE email = ?', email, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke tjekke virksomheds brugere igennem efter email' });
            } else if(data.length > 0 && data[0].id == userId) {
                reject({ error: error, errorMessage: 'Virksomheds brugeren bruger allerede denne email' });
            } else {
                resolve(data.length > 0);
            }
        });
    });
};

// checking if typed oldPassword is right
const checkSentPassword = (password, companyID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM companys WHERE id = ?', companyID, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke hente gamle adgangskode' });
            } else {
                let passwordhashed = bcrypt.compareSync(password, data[0].password);
                if (passwordhashed && data.length > 0) {
                    resolve(true)
                } else {
                    reject({ errorMessage: 'Gamle adgangskode forkert' });
                }
            }
        });
    });
};

// for checking if a company owns any jobposts
const allCompanysJobpostings = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) AS count FROM jobpostings WHERE companyID = ?', companyID, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke hente virksomheds brugers opslag' });
            } else {
                resolve({jobPostingsCount: result[0].count });
            }
        });
    });
};

// for updating a company user's information
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

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere virksomheds bruger' });
            } else if (result.affectedRows == 0) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere virksomheds bruger' });
            } else {
                resolve(true);
            }
        });
    });
};

// for updating jobposts related to the company user
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
        db.query(updateQuery, valuesForQuery, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere jobopslag for virksomheds bruger' });
            } else if (result.affectedRows == 0) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere jobopslag for virksomheds bruger' });
            } else {
                resolve(true);
            }
        });
    });
};

// for updating a company user's password
const updatePassword = (req, userId) => {
    const { newPassword } = req.body;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    return new Promise((resolve, reject) => {
        db.query('UPDATE companys SET password = ? WHERE id = ?', [hashPassword, userId], (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke opdatere adgangskoden' });
            } else {
                resolve(true);
            }
        });
    });
};

// for deleting a company user
const deleteCompanyUser = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from companys WHERE id = ?', companyID, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke slette virksomheds bruger' });
            } else {
                resolve(true);
            }
        });
    });
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
