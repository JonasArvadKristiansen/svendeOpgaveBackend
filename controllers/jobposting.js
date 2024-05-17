const db = require('../utils/DB');

const allJobpostings = (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToskip = (currentPageNumber - 1) * 10; // rows to skip

    // query to fetch number of rows with data
    db.query('SELECT COUNT(*) AS count FROM jobpostings', (error, countResult) => {
        if (error) {
            console.error(error);
            return res.status(500).json('server ikke aktiv');
        }

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // query to fetch data for paginated page
        db.query(
            `SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings 
        INNER JOIN companys ON jobpostings.companyID = companys.id LIMIT 10 OFFSET ?`,
            [rowsToskip],
            (error, data) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json('Kunne ikke hente jobopslagene');
                } else {
                    res.status(200).json({ jobpostings: data, pages: pageCount });
                }
            }
        );
    });
};

const filterJobpostings = (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToSkip = (currentPageNumber - 1) * 10; //rows to skip

    // query to fetch number of rows with data
    let counterQuery = 'SELECT COUNT(*) AS count FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id';
    let whereconditions = [];
    let whereValues = [];

    // if conditions checking if some or all query parameters are present
    if (req.query.deadline) {
        whereconditions.push('deadline = ?');
        whereValues.push(req.query.deadline);
    }
    if (req.query.minSalary) {
        whereconditions.push('salary >= ?');
        whereValues.push(req.query.minSalary);
    }
    if (req.query.jobtype) {
        whereconditions.push('jobtype LIKE ?');
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
    db.query(counterQuery, whereValues, (error, countResult) => {
        if (error) {
            console.error(error);
            return res.status(500).json('server ikke aktiv');
        }

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // select query for getting data
        let filterQuery = `SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName 
        FROM jobpostings 
        INNER JOIN companys ON jobpostings.companyID = companys.id`;

        // adding the WHERE clause if there are conditions
        if (whereconditions.length > 0) {
            filterQuery += ' WHERE ' + whereconditions.join(' AND ');
        }

        // adding order by clause based on newestJobpost
        if (req.query.newestJobpost) {
            if (req.query.newestJobpost === 'new') {
                filterQuery += ' ORDER BY deadline DESC';
            } else if (req.query.newestJobpost === 'old') {
                filterQuery += ' ORDER BY deadline ASC';
            }
        }

        // setting up how many rows to take and how many to skip before taking rows
        filterQuery += ' LIMIT 10 OFFSET ?';

        // query to fetch data for paginated page and ... spread operator is used to copy one a array to a new one
        db.query(filterQuery, [...whereValues, rowsToSkip], (error, data) => {
            if (error) {
                console.error(error);
                return res.status(500).json('Kunne ikke flitrere jobopslagene');
            } else {
                res.status(200).json({ jobpostings: data, pages: pageCount, url: req.originalUrl });
            }
        });
    });
};

const jobposting = (req, res) => {
    const { jobpostingId } = req.query;

    db.query(
        'SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName, companys.companyDescription, companys.jobpostingCount FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?',
        [jobpostingId],
        (error, data) => {
            if (error) {
                console.error(error);
                return res.status(500).json('Kunne ikke hente jobopslag');
            } else {
                return res.status(200).json({ jobposting: data });
            }
        }
    );
};

// for creating a jobpost
const createJobposting = (req, companyID) => {
    const { title, DESCRIPTION, deadline, jobtype, salary } = req.body;
    return new Promise((resolve, reject) => {
        db.query('SELECT address, city, phonenumber, email FROM companys WHERE id = ?', companyID, (error, data) => {
            if (error) {
                reject({ error: error, errorMessage: 'Kunne ikke hente virksomheds brugeren' });
            } else {
                db.query(
                    'INSERT INTO jobpostings (title, DESCRIPTION, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [title, DESCRIPTION, deadline, jobtype, companyID, data[0].address, data[0].city, data[0].phonenumber, data[0].email, salary],
                    (error, data) => {
                        if (error) {
                            reject({ error: error, errorMessage: 'Kunne ikke oprette jobopslag' });
                        } else {
                            resolve(true);
                        }
                    }
                );
            }
        });
    });
};

// for updating a jobpost information
const updateJobposting = (req) => {
    let updateQuery = 'UPDATE jobpostings SET ';

    const fieldsForUpdates = [];
    const valuesForQuery = [];

    if (req.body.title !== undefined && req.body.title !== null) {
        fieldsForUpdates.push('title = ?');
        valuesForQuery.push(req.body.title);
    }

    if (req.body.DESCRIPTION !== undefined && req.body.DESCRIPTION !== null) {
        fieldsForUpdates.push('DESCRIPTION = ?');
        valuesForQuery.push(req.body.DESCRIPTION);
    }

    if (req.body.deadline !== undefined && req.body.deadline !== null) {
        fieldsForUpdates.push('deadline = ?');
        valuesForQuery.push(req.body.deadline);
    }

    if (req.body.jobtype !== undefined && req.body.jobtype !== null) {
        fieldsForUpdates.push('jobtype = ?');
        valuesForQuery.push(req.body.jobtype);
    }

    if (req.body.salary !== undefined && req.body.salary !== null) {
        fieldsForUpdates.push('salary = ?');
        valuesForQuery.push(req.body.salary);
    }

    //joining updateQuery with conditions that needs to be updated
    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE id = ?';

    valuesForQuery.push(req.body.jobpostingId);

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'kunne ikke opdatere jobopslag' });
            } else {
                resolve(true);
            }
        });
    });
};

// for updating a counter in a company user
const plusCompanyJobpostingCount = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE companys SET jobpostingCount = jobpostingCount + 1 WHERE id = ?', companyID, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'kunne ikke opdatere virksomheds brugerens jobopslag tæller' });
            } else {
                resolve(true);
            }
        });
    });
};

// for updating a counter in a company user
const minusCompanyJobpostingCount = (companyID) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE companys SET jobpostingCount = jobpostingCount - 1 WHERE id = ?', companyID, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'kunne ikke opdatere virksomheds brugerens jobopslag tæller' });
            } else {
                resolve(true);
            }
        });
    });
};

// for deleting a jobpost
const deleteJobposting = (jobpostingId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from jobpostings WHERE id = ?', jobpostingId, (error, result) => {
            if (error) {
                reject({ error: error, errorMessage: 'kunne ikke slette jobopslag' });
            } else {
                resolve(true);
            }
        });
    });
};

module.exports = {
    allJobpostings,
    filterJobpostings,
    jobposting,
    createJobposting,
    updateJobposting,
    plusCompanyJobpostingCount,
    minusCompanyJobpostingCount,
    deleteJobposting,
};
