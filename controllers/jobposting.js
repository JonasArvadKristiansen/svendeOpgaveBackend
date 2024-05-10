const db = require('../utils/DB');

const createJobposting = (req, companyID) => {
    const { title, DESCRIPTION, deadline, jobtype, salary} = req.body;
    return new Promise((resolve, reject) => {
        db.query('SELECT address, phonenumber, email FROM companys WHERE id = ?', companyID, (err, data) => {
            if (err) {
                resolve({ success: false });
            } else {
                db.query(
                    'INSERT INTO jobpostings (title, DESCRIPTION, deadline, jobtype, companyID, address, phonenumber, email, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [title, DESCRIPTION, deadline, jobtype, companyID, data[0].address, data[0].phonenumber, data[0].email, salary], (err, data) => {
                        if(err) {
                            resolve({ success: false })
                        } else {
                            resolve({ success: true })
                        }
                    });
            }
        });
    });
}

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

    updateQuery += fieldsForUpdates.join(', ');
    updateQuery += ' WHERE id = ?';

    valuesForQuery.push(req.body.jobpostingId);

    return new Promise((resolve, reject) => {
        db.query(updateQuery, valuesForQuery, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

const deleteJobposting = (jobpostingId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE from jobpostings WHERE id = ?', jobpostingId, (err, result) => {
            if (err) {
                resolve({ success: false });
            } else {
                resolve({ success: true });
            }
        });
    });
};

module.exports = {
    createJobposting,
    updateJobposting,
    deleteJobposting,
};