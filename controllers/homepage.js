const db = require('../utils/DB');

const allCompanys = (req, res) => {
    db.query('SELECT id, companyName, companyDescription, jobpostingCount FROM companys', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('server ikke aktiv');
        } else {
            return res.status(200).json({companys: data});
        }
    });
};

const allJobpostings = (req, res) => {
    db.query('SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('server ikke aktiv');
        } else {
            return res.status(200).json({jobpostings: data});
        }
    });
};

const companyProfile = (req, res) => {
    const { companyID } = req.body;

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
            db.query('SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.companyID = ?', [companyID], (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    resolve(data);
                }
            });
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
    const {jobpostingId } = req.body;

    db.query('SELECT title, DESCRIPTION, deadline, jobtype, jobpostings.address, companys.companyName, companys.companyDescription, companys.jobpostingCount FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?', 
    [jobpostingId], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('server ikke aktiv');
        } else {
            return res.status(200).json({jobposting: data});
        }
    });
};

module.exports = {
    allCompanys,
    allJobpostings,
    jobposting,
    companyProfile,
};
