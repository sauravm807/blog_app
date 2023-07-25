const router = require('express').Router();
const authRouter = require("./auth/auth.router");
const blogRouter = require("./blog/blog.router");

class Modules {
    constructor() {
        this.modules = router;
        this.core();
    }

    core() {
        // Adding all the routes here
        this.modules.use('/auth', authRouter.getRouters());
        this.modules.use('/blog', blogRouter.getRouters());

        this.modules.get('*', function (req, res) {
            res.json({
                code: 400,
                data: null,
                message: 'Not Found.',
                error: null
            });
        });
    }

    getRouters() {
        return this.modules;
    }
}

module.exports = Modules;