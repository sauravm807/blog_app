const { mysql } = require('../../database/connection');

class Modal {
    getUser({ email }) {
        return mysql.query(`
                    SELECT 
                        id, first_name, last_name, password 
                    FROM users 
                    WHERE email = '${email}';
                `);
    }

    createUser({ email, password, firstName, lastName }) {
        return mysql.query(`
                    INSERT INTO users 
                        (email, password, first_name, last_name) 
                    VALUES 
                        ('${email}', '${password}', '${firstName}', '${lastName}');
                `);
    }
}

module.exports = new Modal();