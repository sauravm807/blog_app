const router = require('express').Router();
const blogController = require('./blog.controller');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/imageupload.middleware');

class AuthRouter {
    constructor() {
        this.routes = router;
        this.core();
    }

    core() {
        // Adding all the routes here
        this.routes.use(authenticateToken);
        this.routes.get("/", blogController.getAllBlogs);
        this.routes.get("/:id", blogController.getBlogById);
        this.routes.get("/search", blogController.searchBlog);
        this.routes.post("/", upload.single('imageLink'), blogController.createBlog);
        this.routes.put("/", upload.single('imageLink'), blogController.updateBlog);
        this.routes.delete("/:id", blogController.deleteBlog);
    }

    getRouters() {
        return this.routes;
    }
}

module.exports = new AuthRouter();