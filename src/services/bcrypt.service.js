"use strict;"
const bcrypt = require('bcrypt');
const saltRounds = 10;

class BycryptService {
    encryptPassword(password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds)
                .then(hash => resolve(hash))
                .catch(err => reject("Internal server error."));
        });
    }

    async matchPassword({ password, hash }) {
        return await bcrypt.compare(password, hash);
    }
};

module.exports = new BycryptService();