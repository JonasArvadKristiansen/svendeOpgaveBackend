const db = require('../utils/DB');

const allCompanys = (req, res) => {
    db.query('SELECT companyName, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes.name AS jobtype FROM companys INNER JOIN jobtypes ON jobtypes.companyID = companys.id;', (err, data) => {
        if (err) {
            //resolve false if error
            return res.status(500).json('server ikke aktiv');
        } else {
            return res.status(200).json(data);
        }
    });
};

const allJobpostings = (req, res) => {
    db.query('SELECT *, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id', (err, data) => {
        if (err) {
            //resolve false if error
            return res.status(500).json('server ikke aktiv')
        } else {
            //resolve with true or false based on the query result
            return res.status(200).json(data);
        }
    });
};

const companyProfile = (req, res) => {
    const { companyID } = req.body;

    db.query('SELECT companyName , companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys WHERE id = ?', companyID, (err, data) => {
        if (err) {
            //resolve false if error
            return res.status(500).json('server ikke aktiv')
        } else {
            return res.status(200).json(data);
        }
    });
};

const jobposting = (req, res) => {
    const { jobpostingId } = req.body;

    db.query('SELECT * FROM jobpostings WHERE id = ?', jobpostingId, (err, data) => {
        if (err) {
            //resolve false if error
            return res.status(500).json('server ikke aktiv')
        } else {
            //resolve with true or false based on the query result
            return res.status(200).json(data);
        }
    });
};

module.exports = {
    allCompanys,
    allJobpostings,
    jobposting,
    companyProfile,
};