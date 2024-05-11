const db = require('../utils/DB');

const allCompanys = (req, res) => {
    db.query('SELECT companyName, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes.name AS jobtype FROM companys INNER JOIN jobtypes ON jobtypes.companyID = companys.id;', (err, data) => {
        if (err) {
            return res.status(500).json('server ikke aktiv');
        } else {
            return res.status(200).json(data);
        }
    });
};

const allJobpostings = (req, res) => {
    db.query('SELECT *, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id', (err, data) => {
        if (err) {
            return res.status(500).json('server ikke aktiv')
        } else {
            return res.status(200).json(data);
        }
    });
};

const companyProfile = (req, res) => {
    const { companyID } = req.body;

    Promise.all([
        new Promise((resolve, reject) => {
            db.query('SELECT companyName, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys WHERE id = ?', [companyID], (err, data) => {
                if (err) {
                    console.error("Fejl i companys: ", err);
                } else {
                    resolve(data);
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT name FROM jobtypes WHERE companyID = ?', [companyID], (err, data) => {
                if (err) {
                    console.error("Fejl i jobtypes: ", err);
                } else {
                    resolve(data);
                }
            });
        })
    ]).then(([companyProfileData, jobtypesData]) => {
        return res.status(200).json({ companyProfileData: companyProfileData, jobtypesData: jobtypesData });
    }).catch(error => {
        console.error("Fejl i companyProfile controller:", error);
        return res.status(500).json('Server fejl');
    });
};

const jobposting = (req, res) => {
    const { jobpostingId } = req.body;

    db.query('SELECT *, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?', [jobpostingId], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json('Server ikke aktiv');
        } else {
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