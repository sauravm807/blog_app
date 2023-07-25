const express = require('express');
const morgan = require('morgan');
const Routes = require('./modules/modules');
require('dotenv').config();

class App {
    constructor() {
        // getting from process.env object, specified in .env file
        this.port = process.env.PORT || 3000;
        // express app initialization
        this.app = express();
    }

    core() {
        this.addRoutesAndMiddleWares(this.app);
        this.listenToPort(this.app, this.port);
    }

    async addRoutesAndMiddleWares(app) {
        app.use(express.json(), express.urlencoded({ extended: true }));
        app.use(morgan('dev'));

        app.use('/api', new Routes().getRouters());

        app.use((err, req, res, next) => {
            console.log({ err })
            return res.status(err.status || 500).json({
                error: {
                    status: err.status || 500,
                    message: !err.status || err.status === 500 ? "Internal server error" : err.message
                }
            });
        });

        app.use("*", (req, res) => {
            return res.status(404).json({
                code: 404,
                data: null,
                message: "Not found.",
                error: 'Not found'
            });
        });
    }


    listenToPort(app, port) {
        app.listen(port, () => console.log(`== Application started at ${port} ==`));
    }
}

module.exports = App;