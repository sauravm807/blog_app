const router = require('express').Router();
const authController = require('./auth.controller');

class AuthRouter {
    constructor() {
        this.routes = router;
        this.core();
    }

    core() {
        // Adding all the routes here
        this.routes.post("/register", authController.register);
        this.routes.post("/login", authController.login);
    }

    getRouters() {
        return this.routes;
    }
}

module.exports = new AuthRouter();