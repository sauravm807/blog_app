const validation = require("./auth.validation");
const modal = require("./auth.model");
const bcryptService = require('../../services/bcrypt.service');
const jwtService = require('../../services/jwt.service');

class AuthController {
    /**
     * register - To create a new user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async register(req, res, next) {
        try {
            // validation
            const { error, value } = validation.register(req.body);
            if (error) return next({ status: 403, message: error.details[0].message });

            const { email, password, first_name: firstName, last_name: lastName } = value;

            // check if email exists
            const [ifUserExist] = await modal.getUser({ email });

            if (ifUserExist.length) return next({ status: 409, message: 'Email already exist.' });

            const newPassword = await bcryptService.encryptPassword(password);

            const [insertUser] = await modal.createUser({ email, password: newPassword, firstName, lastName });

            if (!insertUser.affectedRows) return next({ status: 400, message: 'User not created.' });

            res.status(200).json({
                status: 201,
                data: {
                    id: insertUser.insertId,
                    email,
                    firstName,
                    lastName
                },
                message: "Registered successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * login - To login a user
     * @param {*} req 
     * @param {*} res 
     */
    async login(req, res, next) {
        try {
            // validation
            const { error, value } = validation.login(req.body);
            if (error) return next({ status: 403, message: error.details[0].message });

            const { email, password } = value;

            // check if email exists or not
            const [ifUserExist] = await modal.getUser({ email });
            if (!ifUserExist.length) return next({ status: 404, message: 'Email not found.' });

            const isMatch = await bcryptService.matchPassword({ password, hash: ifUserExist[0].password });

            // if password donot match
            if (!isMatch) return next({ status: 401, message: `Password doesn't match.` });

            // create token
            const token = await jwtService.createToken({
                id: ifUserExist[0].id,
                email,
                firstName: ifUserExist[0].first_name,
                lastName: ifUserExist[0].last_name
            });

            res.status(200).json({ status: 200, message: `Login successful.`, data: { token } });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();