const db = require('../utils/DB');

const allJobpostings = async (req, res) => {
    try {
        const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
        const rowsToSkip = (currentPageNumber - 1) * 10; // rows to skip

        // query to fetch number of rows with data
        const [countResult] = await db.query('SELECT COUNT(*) AS count FROM jobpostings');

        // counting number of pages
        const pageCount = Math.ceil(countResult.count / 10);

        // query to fetch data for paginated page
        const [data] = await db.query(
            `SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings 
            INNER JOIN companys ON jobpostings.companyID = companys.id LIMIT 10 OFFSET ?`,
            [rowsToSkip]
        );

        res.status(200).json({ jobpostings: data, pages: pageCount });
    } catch (error) {
        throw error;
    }
};

const filterJobpostings = async (req, res) => {
    try {
        const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
        const rowsToSkip = (currentPageNumber - 1) * 10; //rows to skip

        // query to fetch number of rows with data
        let counterQuery = 'SELECT COUNT(*) AS count FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id';
        let whereConditions = [];
        let whereValues = [];

        // if conditions checking if some or all query parameters are present
        if (req.query.deadline) {
            whereConditions.push('deadline = ?');
            whereValues.push(req.query.deadline);
        }
        if (req.query.minSalary) {
            whereConditions.push('salary >= ?');
            whereValues.push(req.query.minSalary);
        }
        if (req.query.jobtype) {
            whereConditions.push('jobtype LIKE ?');
            whereValues.push(`%${req.query.jobtype}%`);
        }
        if (req.query.search) {
            whereConditions.push('(companyName LIKE ?)');
            whereValues.push(`%${req.query.search}%`);
        }

        // adding the WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            counterQuery += ' WHERE ' + whereConditions.join(' AND ');
        }

        // query to fetch number of rows with data
        const [countResult] = await db.query(counterQuery, whereValues);

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // select query for getting data
        let filterQuery = `SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName 
        FROM jobpostings 
        INNER JOIN companys ON jobpostings.companyID = companys.id`;

        // adding the WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            filterQuery += ' WHERE ' + whereConditions.join(' AND ');
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
        const [data] = await db.query(filterQuery, [...whereValues, rowsToSkip]);

        res.status(200).json({ jobpostings: data, pages: pageCount, url: req.originalUrl });
    } catch (error) {
        throw error;
    }
};

const jobposting = async (req, res) => {
    try {
        const { jobpostingId } = req.query;

        const [data] = await db.query(
            'SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName, companys.companyDescription, companys.jobpostingCount FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?',
            [jobpostingId]
        );

        res.status(200).json({ jobposting: data });
    } catch (error) {
        throw error;
    }
};

// for creating a jobpost
const createJobposting = async (req, companyID) => {
    try {
        const { title, DESCRIPTION, deadline, jobtype, salary } = req.body;

        // Fetch company details from the database
        const [companyData] = await db.query('SELECT address, city, phonenumber, email FROM companys WHERE id = ?', companyID);
        if (!companyData || companyData.length === 0) {
            const error = new Error('Kunne ikke finde virksomheds bruger');
            error.status = 404;
            throw error;
        }

        // Insert jobposting into the database
        await db.query(
            'INSERT INTO jobpostings (title, DESCRIPTION, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                title,
                DESCRIPTION,
                deadline,
                jobtype,
                companyID,
                companyData[0].address,
                companyData[0].city,
                companyData[0].phonenumber,
                companyData[0].email,
                salary,
            ]
        );

        return true; // Jobposting created successfully
    } catch (error) {
        throw error;
    }
};

// for updating a jobpost information
const updateJobposting = async (req) => {
    try {
        const { title, DESCRIPTION, deadline, jobtype, salary, jobpostingId } = req.body;

        if (!jobpostingId) {
            const error = new Error('Job posting ID is required');
            error.status = 400;
            throw error;
        }

        // Build the update query
        let updateQuery = 'UPDATE jobpostings SET ';
        const fieldsForUpdates = [];
        const valuesForQuery = [];

        if (title !== undefined && title !== null) {
            fieldsForUpdates.push('title = ?');
            valuesForQuery.push(title);
        }

        if (DESCRIPTION !== undefined && DESCRIPTION !== null) {
            fieldsForUpdates.push('DESCRIPTION = ?');
            valuesForQuery.push(DESCRIPTION);
        }

        if (deadline !== undefined && deadline !== null) {
            fieldsForUpdates.push('deadline = ?');
            valuesForQuery.push(deadline);
        }

        if (jobtype !== undefined && jobtype !== null) {
            fieldsForUpdates.push('jobtype = ?');
            valuesForQuery.push(jobtype);
        }

        if (salary !== undefined && salary !== null) {
            fieldsForUpdates.push('salary = ?');
            valuesForQuery.push(salary);
        }

        if (fieldsForUpdates.length === 0) {
            const error = new Error('No fields to update');
            error.status = 400;
            throw error;
        }

        // Join updateQuery with conditions that need to be updated
        updateQuery += fieldsForUpdates.join(', ');
        updateQuery += ' WHERE id = ?';

        valuesForQuery.push(jobpostingId);

        // Executing the update query
        const [result] = await db.query(updateQuery, valuesForQuery);

        // Check if rows were affected and/or changed
        if (result.affectedRows > 0) {
            if (result.changedRows > 0) {
                return true;
            } else {
                const error = new Error('Ingenting at opdatere på jobopslaget');
                error.status = 409;
                throw error;
            }
        } else {
            const error = new Error('Ingen jobopslag at opdatere på dette id');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for updating a counter in a company user
const plusCompanyJobpostingCount = async (companyID) => {
    try {
        const [result] = await db.query('UPDATE companys SET jobpostingCount = jobpostingCount + 1 WHERE id = ?', companyID);

        if (result.affectedRows > 0) {
            return true;
        } else {
            const error = new Error('Kunne ikke opdatere jobopslag tæller for virksomheds bruger');
            error.status = 409;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for updating a counter in a company user
const minusCompanyJobpostingCount = async (companyID) => {
    try {
        const [result] = await db.query('UPDATE companys SET jobpostingCount = jobpostingCount - 1 WHERE id = ?', companyID);

        if (result.affectedRows > 0) {
            return true;
        } else {
            const error = new Error('Kunne ikke opdatere jobopslag tæller for virksomheds bruger');
            error.status = 409;
            throw error;
        }
    } catch (error) {
        throw error;
    }
};

// for deleting a jobpost
const deleteJobposting = async (jobpostingId) => {
    try {
        const [result] = await db.query('DELETE from jobpostings WHERE id = ?', jobpostingId);

        if (result.affectedRows > 0) {
            return true;
        } else {
            const error = new Error('Ingen jobopslag fundet');
            error.status = 404;
            throw error;
        }
    } catch (error) {
        throw error;
    }
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
