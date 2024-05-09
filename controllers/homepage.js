const db = require('../utils/DB');

const allCompanys = (req, res) => {
    db.query('SELECT companyName , companyDescription, address, phonenumber, email, numberOfEmployees, cvrNumber FROM companys', (err, data) => {
        if (err) {
            //resolve false if error
            return res.status(500).json('server not responing')
        } else {
            return res.status(200).json(data);
        }
    });
};

const allJobpostings = (email) => {
    return new Promise((resolve) => {
        db.query('SELECT * FROM users WHERE email = ?', email, (err, data) => {
            if (err) {
                //resolve false if error
                resolve({ success: false });
            } else {
                //resolve with true or false based on the query result
                resolve(data.length > 0);
            }
        });
    });
};

module.exports = {
    allCompanys,
    allJobpostings,

};