const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || 'some_secret';

class JwtService {
    createToken({ id, email, firstName, lastName }) {
        return new Promise((resolve, reject) => {
            jwt.sign({ id, email, firstName, lastName }, ACCESS_TOKEN_SECRET_KEY, { expiresIn: 1 * 60 * 60 }, function (err, token) {
                if (err) reject("Internal server error");
                resolve(token);
            });
        });
    }

    verifyToken({ token }) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, ACCESS_TOKEN_SECRET_KEY, function (err, decoded) {
                if (err) resolve(false)
                resolve(decoded);
            });
        });
    }
}

module.exports = new JwtService();