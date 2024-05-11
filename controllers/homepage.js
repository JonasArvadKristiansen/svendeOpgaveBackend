const db = require('../utils/DB');

const allCompanys = (req, res) => {
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(
                'SELECT id, companyName, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys',
                (err, data) => {
                    if (err) {
                        console.error('Fejl i companys: ', err);
                    } else {
                        resolve(data);
                    }
                }
            );
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT name, companyID FROM jobtypes', (err, data) => {
                if (err) {
                    console.error('Fejl i jobtypes: ', err);
                } else {
                    resolve(data);
                }
            });
        }),
    ])
        .then(([companyProfilesData, jobtypesData]) => {
            return res.status(200).json({ companyProfilesData: companyProfilesData, jobtypesData: jobtypesData });
        })
        .catch((error) => {
            console.error('Fejl i companyProfile controller:', error);
            return res.status(500).json('Server fejl');
        });
};

const allJobpostings = (req, res) => {
    db.query('SELECT *, companys.companyName FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id', (err, data) => {
        if (err) {
            return res.status(500).json('server ikke aktiv');
        } else {
            return res.status(200).json(data);
        }
    });
};

const companyProfile = (req, res) => {
    const { companyID } = req.body;

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(
                'SELECT companyName, companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys WHERE id = ?',
                [companyID],
                (err, data) => {
                    if (err) {
                        console.error('Fejl i companys: ', err);
                    } else {
                        resolve(data);
                    }
                }
            );
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT * FROM jobpostings WHERE companyID = ?', [companyID], (err, data) => {
                if (err) {
                    console.error('Fejl i jobtypes: ', err);
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
            console.error('Fejl i companyProfile controller:', error);
            return res.status(500).json('Server fejl');
        });
};

const jobposting = (req, res) => {
    const { companyID, jobpostingId } = req.body;

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(
                'SELECT *, companys.companyName, companys.companyDescription FROM jobpostings INNER JOIN companys ON jobpostings.companyID = companys.id WHERE jobpostings.id = ?',
                [jobpostingId],
                (err, data) => {
                    if (err) {
                        console.error('Fejl i companys: ', err);
                    } else {
                        resolve(data);
                    }
                }
            );
        }),
        new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS count FROM jobpostings WHERE companyID = ?', [companyID], (err, data) => {
                if (err) {
                    console.error('Fejl i jobtypes: ', err);
                } else {
                    resolve(data);
                }
            });
        }),
    ])
        .then(([jobpostingData, companyJobpostingsCount]) => {
            return res.status(200).json({ jobpostingData: jobpostingData, companyJobpostingsCount: companyJobpostingsCount });
        })
        .catch((error) => {
            console.error('Fejl i companyProfile controller:', error);
            return res.status(500).json('Server fejl');
        });
};

module.exports = {
    allCompanys,
    allJobpostings,
    jobposting,
    companyProfile,
};
