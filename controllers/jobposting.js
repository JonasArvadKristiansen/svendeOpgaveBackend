const db = require('../utils/DB');

/*
// getting all jobposts paginated. Not in use, because missing frontend functionality
const allJobpostings2 = async (req, res) => {
    try {
        const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
        const rowsToSkip = (currentPageNumber - 1) * 10; // rows to skip

        // query to fetch number of rows with data
        const [countResult] = await db.query('SELECT COUNT(*) AS count FROM jobpostings');

        // counting number of pages
        const pageCount = Math.ceil(countResult[0].count / 10);

        // query to fetch data for paginated page
        const [data] = await db.query(
            `SELECT jobpostings.id, title, LEFT(jobpostings.description, 535) AS description, deadline, jobpostings.address, companys.companyName FROM jobpostings 
            INNER JOIN companys ON jobpostings.companyID = companys.id LIMIT 10 OFFSET ?`,
            [rowsToSkip]
        );

        return res.status(200).json({ jobpostings: data, pages: pageCount });
    } catch (error) {
        throw error;
    }
};
*/

const allJobpostings = async (req, res) => {
    try {
        // query to fetch data
        const [data] = await db.query(
            `SELECT jobpostings.id, title, LEFT(jobpostings.description, 535) AS description, deadline, jobpostings.jobtype, jobpostings.address, companys.companyName FROM jobpostings 
            INNER JOIN companys ON jobpostings.companyID = companys.id ORDER BY jobpostings.id DESC`);

        return res.status(200).json({ jobpostings: data });
    } catch (error) {
        throw error;
    }
};

/*
// filter between jobposts paginated. Not in use, because missing frontend functionality
const filterJobpostings2 = async (req, res) => {
    try {
        const currentPageNumber = parseInt(req.query.page) || 1; // starting page / next page
        const rowsToSkip = (currentPageNumber - 1) * 10; //rows to skip

        // query to fetch number of rows with data
        let counterQuery = 'SELECT COUNT(*) AS count FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id';
        let whereConditions = [];
        let whereValues = [];

        // if conditions checking if some or all query parameters are present
        if (req.query.deadlineFirst && req.query.deadlineLast) {
            whereConditions.push('deadline BETWEEN ? AND ?');
            whereValues.push(req.query.deadlineFirst, req.query.deadlineLast);
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
        let filterQuery = `SELECT jobpostings.id, title, LEFT(jobpostings.description, 535) AS description, deadline, jobpostings.address, companys.companyName 
        FROM jobpostings 
        INNER JOIN companys ON jobpostings.companyID = companys.id`;

        // adding the WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            filterQuery += ' WHERE ' + whereConditions.join(' AND ');
        }

        // adding order by clause based on newestJobpost
        if (req.query.newestJobpost) {
            if (req.query.newestJobpost.toLowerCase() === 'new') {
                filterQuery += ' ORDER BY jobpostings.id DESC';
            } else if (req.query.newestJobpost.toLowerCase() === 'old') {
                filterQuery += ' ORDER BY jobpostings.id ASC';
            }
        }

        // setting up how many rows to take and how many to skip before taking rows
        filterQuery += ' LIMIT 10 OFFSET ?';

        // query to fetch data for paginated page and ... spread operator is used to copy one a array to a new one
        const [data] = await db.query(filterQuery, [...whereValues, rowsToSkip]);

        return res.status(200).json({ jobpostings: data, pages: pageCount, url: req.originalUrl });
    } catch (error) {
        throw error;
    }
};
*/

const filterJobpostings = async (req, res) => {
    try {
        let whereConditions = [];
        let whereValues = [];

        // if conditions checking if some or all query parameters are present
        if (req.query.deadlineFirst && req.query.deadlineLast) {
            whereConditions.push('deadline BETWEEN ? AND ?');
            whereValues.push(req.query.deadlineFirst, req.query.deadlineLast);
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

        // select query for getting data
        let filterQuery = `SELECT jobpostings.id, title, LEFT(jobpostings.description, 535) AS description, deadline, jobpostings.jobtype, jobpostings.address, companys.companyName 
        FROM jobpostings 
        INNER JOIN companys ON jobpostings.companyID = companys.id`;

        // adding the WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            filterQuery += ' WHERE ' + whereConditions.join(' AND ');
        }

        // adding order by clause based on newestJobpost
        if (req.query.newestJobpost) {
            if (req.query.newestJobpost.toLowerCase() === 'new') {
                filterQuery += ' ORDER BY jobpostings.id DESC';
            } else if (req.query.newestJobpost.toLowerCase() === 'old') {
                filterQuery += ' ORDER BY jobpostings.id ASC';
            }
        }

        // query to fetch data for paginated page and ... spread operator is used to copy one a array to a new one
        const [data] = await db.query(filterQuery, [...whereValues ]);

        return res.status(200).json({ jobpostings: data });
    } catch (error) {
        throw error;
    }
};

// getting jobpost info
const jobposting = async (req, res) => {
    try {
        const { jobpostingId } = req.query;

        const [data] = await db.query(
            `SELECT jobpostings.id, title, jobpostings.description, deadline, jobtype, companyID, jobpostings.address, jobpostings.email, jobpostings.city, 
            jobpostings.phonenumber, salary, companys.companyName, companys.jobtypes, LEFT(companys.description, 535) AS companyDescription, companys.jobpostingCount 
            FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?`,
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
        const { title, description, deadline, jobtype, salary } = req.body;

        // Fetch company details from the database
        const [companyData] = await db.query('SELECT address, city, phonenumber, email FROM companys WHERE id = ?', companyID);
        if (!companyData || companyData.length === 0) {
            const error = new Error('Kunne ikke finde virksomheds bruger');
            error.status = 404;
            throw error;
        }

        // Insert jobposting into the database
        const [queryData] = await db.query('INSERT INTO jobpostings (title, description, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            title,
            description,
            deadline,
            jobtype,
            companyID,
            companyData[0].address,
            companyData[0].city,
            companyData[0].phonenumber,
            companyData[0].email,
            salary,
        ]);

        return {success: true, id: queryData.insertId}; // Jobposting created successfully
    } catch (error) {
        throw error;
    }
};

// for updating a jobpost information
const updateJobposting = async (req) => {
    try {
        const { title, description, deadline, jobtype, salary, jobpostingId } = req.body;

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

        if (description !== undefined && description !== null) {
            fieldsForUpdates.push('description = ?');
            valuesForQuery.push(description);
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

        // Check if rows were affected and/or changed
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

        // Check if rows were affected and/or changed
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

        // Check if rows were affected and/or changed
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
