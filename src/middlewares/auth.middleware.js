const jwtService = require("../services/jwt.service");

module.exports = {
    authenticateToken: async function (req, res, next) {
        try {
            let tokenFromReq = req.body.token || req.query.token || req.headers['x-access-token'];
            if (req.headers['authorization']) {
                const authHeader = req.headers['authorization'];
                if (!authHeader) return next({ status: 401, message: 'Access Denied token required' });
                tokenFromReq = authHeader.split(" ")[1];
            }

            if (tokenFromReq == null) return next({ status: 401, message: 'Access Denied' });

            const payload = await jwtService.verifyToken({ token: tokenFromReq });

            if (!payload) return next({ status: 401, message: 'Invalid token Access Denied' });
            delete payload.iat;
            delete payload.exp;
            req.user = payload;
            next();
        } catch (error) {
            next({ status: 401, message: 'Unauthorised' });
        }
    }
}