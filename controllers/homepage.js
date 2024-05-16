const db = require('../utils/DB');

const allCompanys = (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToskip = (currentPageNumber - 1) * 10; // rows to skip

    // query to fetch number of pages with data
    db.query('SELECT COUNT(*) AS count FROM companys', (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json('server ikke aktiv');
        }

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // query to fetch data for paginated page
        db.query('SELECT id, companyName, companyDescription, jobpostingCount FROM companys LIMIT 10 OFFSET ?', [rowsToskip], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json('server ikke aktiv');
            } else {
                res.status(200).json({ companys: data, pages: pageCount });
            }
        });
    });
};

const allJobpostings = (req, res) => {
    const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
    const rowsToskip = (currentPageNumber - 1) * 10; // rows to skip

    // query to fetch number of rows with data
    db.query('SELECT COUNT(*) AS count FROM jobpostings', (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json('server ikke aktiv');
        }

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // query to fetch data for paginated page
        db.query(
            `SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings 
        INNER JOIN companys ON jobpostings.companyID = companys.id LIMIT 10 OFFSET ?`,
            [rowsToskip],
            (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json('server ikke aktiv');
                } else {
                    res.status(200).json({ jobpostings: data, pages: pageCount });
                }
            }
        );
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
            return res.status(500).json('server ikke aktiv');
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
        db.query(filterQuery, [...whereValues, rowsToSkip], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json('server ikke aktiv');
            } else {
                res.status(200).json({ companys: data, pages: pageCount, url: req.originalUrl });
            }
        });
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
    db.query(counterQuery, whereValues, (err, countResult) => {
        if (err) {
            console.error(err);
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
        db.query(filterQuery, [...whereValues, rowsToSkip], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json('server ikke aktiv');
            } else {
                res.status(200).json({ jobpostings: data, pages: pageCount, url: req.originalUrl });
            }
        });
    });
};

const companyProfile = (req, res) => {
    const { companyID } = req.body;
    //promise all makes it so that if all is success it will send the data to frontend, but if one fails it returns error
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(
                'SELECT companyName, companyDescription, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes FROM companys WHERE id = ?',
                [companyID],
                (err, data) => {
                    if (err) {
                        console.error(err);
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
                (err, data) => {
                    if (err) {
                        console.error(err);
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
            return res.status(500).json('Server fejl');
        });
};

const jobposting = (req, res) => {
    const { jobpostingId } = req.body;

    db.query(
        'SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName, companys.companyDescription, companys.jobpostingCount FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?',
        [jobpostingId],
        (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json('server ikke aktiv');
            } else {
                return res.status(200).json({ jobposting: data });
            }
        }
    );
};

module.exports = {
    allCompanys,
    allJobpostings,
    filterCompanys,
    filterJobpostings,
    jobposting,
    companyProfile,
};
