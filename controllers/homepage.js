const db = require('../utils/DB');

const allCompanys = (res) => {
    db.query('SELECT companyName , companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys', (err, data) => {
        if (err) {
            //resolve false if error
            return res.status(500).json('server ikke aktiv')
        } else {
            return res.status(200).json(data);
        }
    });
};

const allJobpostings = (res) => {
    db.query('SELECT * FROM jobpostings', (err, data) => {
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
    let companyID = req.body.companyID;

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
    let jobpostingId = req.body.jobpostingId;

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