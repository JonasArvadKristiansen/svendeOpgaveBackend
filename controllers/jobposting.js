const db = require('../utils/DB');

const createJobposting = (req, companyID) => {
    let title = req.body.title;
    let DESCRIPTION = req.body.DESCRIPTION;
    let deadline = req.body.deadline;
    let jobtype = req.body.jobtype;
    let løn = req.body.løn;

    return new Promise((resolve) => {
        db.query('SELECT address, phonenumber, email FROM companys WHERE id = ?', companyID, (err, data) => {
            if (err) {
                //resolve false if error
                resolve({ success: false });
            } else {
                db.query(
                    'INSERT INTO jobpostings (title, DESCRIPTION, deadline, jobtype, companyID, address, phonenumber, email, løn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [title, DESCRIPTION, deadline, jobtype, companyID, data[0].address, data[0].phonenumber, data[0].email, løn], (err, data) => {
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

const deleteJobposting = (jobpostingId) => {
    return new Promise((resolve) => {
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
    deleteJobposting,
};