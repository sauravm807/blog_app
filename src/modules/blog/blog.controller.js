const path = require('path');
const validation = require('./blog.validation');
const model = require('./blog.model');
const { s3, bucketName } = require('../../services/aws.service');

class BlogController {
    /**
     * getAllBlogs- To get all blogs
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async getAllBlogs(req, res, next) {
        try {
            const { id } = req.user;

            // validation
            const { error, value } = validation.skipLimit(req.body);
            if (error) return next({ status: 403, message: error.details[0].message });

            const { skip, limit } = value;
            const [blogs] = await model.getAllBlogs({ id, skip, limit });

            if (!blogs.length) return next({ status: 404, message: 'No blog found.' });

            res.status(200).json({ status: 200, message: "Blog list found", data: blogs });
        } catch (error) {
            next(error);
        }
    }

    /**
     * getBlogById- To get blog by id
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async getBlogById(req, res, next) {
        try {
            const { id: uid } = req.user;

            // validation
            const { error, value } = validation.params(req.params);
            if (error) return next({ status: 403, message: error.details[0].message });

            const { id } = value;

            const [blogs] = await model.getBlogById({ id, uid });

            if (!blogs.length) return next({ status: 404, message: 'No blog found.' });

            res.status(200).json({ status: 200, message: "Blog found successfully", data: blogs });
        } catch (error) {
            next(error);
        }
    }

    /**
     * searchBlog- Search blog by title
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async searchBlog(req, res, next) {
        try {
            // validation
            const { error, value } = validation.title(req.query);
            if (error) return next({ status: 403, message: error.details[0].message });

            const { title } = value;

            const [blogs] = await model.searchBlogByTitle({ title });

            if (!blogs.length) return next({ status: 404, message: 'No blog found.' });

            res.status(200).json({ status: 200, message: "Blog found successfully", data: blogs });
        } catch (error) {
            next(error);
        }
    }

    /**
     * createBlog - To create a new blog
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async createBlog(req, res, next) {
        try {
            const { id } = req.user;

            // validation
            const { error, value } = validation.create(req.body);
            if (error) return next({ status: 403, message: error.details[0].message });

            if (!req.file?.fieldname) return next({ status: 403, message: 'Image field is required.' });

            if (req.file?.mimetype != 'image/jpeg' && req.file?.mimetype != 'image/png' && req.file?.mimetype != 'image/jpg') {
                return next({ status: 403, message: 'Invalid image type.' });
            }

            const { title, description } = value;

            const [ifBlogAlreadyExist] = await model.getBlogByTitle({ title, id });
            if (ifBlogAlreadyExist.length) return next({ status: 400, message: 'Title already exists.' });

            // Access the uploaded file from req.file.buffer
            const fileContent = req.file.buffer;


            const key = `images/${Date.now().toString()}-${path.basename(req.file.originalname)}`;

            // Set up the S3 parameters for the upload
            const params = {
                Bucket: bucketName,
                Key: key,
                Body: fileContent,
                ACL: 'public-read', // Make the uploaded file publicly accessible (optional)
            };

            // Upload the image to S3
            s3.upload(params, async (err, data) => {
                if (err) return next({ status: 400, message: 'Failed to upload image to AWS S3' });

                console.log("===uploaded successfully====");
                
                const imageUrl = data.Location;

                const [insertBlog] = await model.createBlog({ title, description: description.replace(/'/g, "''"), imageLink: imageUrl, id });

                if (!insertBlog.affectedRows) return next({ status: 400, message: 'Blog not created.' });

                res.status(200).json({
                    status: 200,
                    message: "Blog created successfully.",
                    data: {
                        id: insertBlog.insertId,
                        title,
                        description,
                        imageUrl
                    }
                });
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * updateBlog - To update a blog
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async updateBlog(req, res, next) {
        try {
            const { id: uid } = req.user;

            // validation
            const { error, value } = validation.update(req.body);
            if (error) return next({ status: 403, message: error.details[0].message });

            if (req.file?.fieldname && req.file?.mimetype != 'image/jpeg' && req.file?.mimetype != 'image/png' && req.file?.mimetype != 'image/jpg') {
                return next({ status: 403, message: 'Invalid image type.' });
            }

            const { title, description, id } = value;

            const [ifBlogExist] = await model.getBlogById({ id });
            if (!ifBlogExist.length || ifBlogExist[0].created_by !== uid) return next({ status: 400, message: `Blog doesn't exist.` });

            if (title) {
                const [ifBlogTitlePresent] = await model.getBlogByTitleID({ title, uid });
                if (ifBlogTitlePresent.length) return next({ status: 400, message: 'Blog title already present.' });
            }


            if (req.file) {
                // Access the uploaded file from req.file.buffer
                const fileContent = req.file.buffer;

                const key = `images/${Date.now().toString()}-${path.basename(req.file.originalname)}`;

                // Set up the S3 parameters for the upload
                let params = {
                    Bucket: bucketName,
                    Key: key,
                    Body: fileContent,
                    ACL: 'public-read', // Make the uploaded file publicly accessible (optional)
                };

                s3.upload(params, (err, uploadData) => {
                    if (err) return next({ status: 400, message: 'Failed to update image. Something went wrong.' });

                    console.log("===uploaded successfully====");

                    params = {
                        Bucket: bucketName,
                        Key: ifBlogExist[0].image_link,
                    };

                    // Delete the image from S3
                    s3.deleteObject(params, async (err, data) => {
                        if (err) return next({ status: 400, message: 'Failed to update image. Something went wrong.' });

                        console.log("===deleted successfully====");

                        const imageLink = uploadData.Location;

                        const [updateBlog] = await model.updateBlog({
                            id,
                            title,
                            description: description ? description.replace(/'/g, "''") : null,
                            imageLink
                        });

                        if (!updateBlog.affectedRows) return next({ status: 400, message: 'Blog not updated.' });

                        res.status(200).json({ status: 200, message: "Blog updated", data: { id, title, description, imageLink } });
                    });
                });
            } else {
                const [updateBlog] = await model.updateBlog({
                    id,
                    title,
                    description: description ? description.replace(/'/g, "''") : null
                });

                if (!updateBlog.affectedRows) return next({ status: 400, message: 'Blog not updated.' });

                res.status(200).json({ status: 200, message: "Blog updated", data: { id, title, description } });
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     * deleteBlog - To delete a blog
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async deleteBlog(req, res, next) {
        try {
            const { id: uid } = req.user;

            // validation
            const { error, value } = validation.params(req.params);
            if (error) return next({ status: 403, message: error.details[0].message });

            const { id } = value;

            const [blog] = await model.getBlogByIdAndUid({ id, uid });

            if (!blog.length) return next({ status: 404, message: 'No blog found.' });

            const params = {
                Bucket: bucketName,
                Key: blog[0].image_link,
            };

            // Delete the image from S3
            s3.deleteObject(params, async (err, data) => {
                if (err) return next({ status: 400, message: 'Failed to delete image. Something went wrong.' });

                console.log("===deleted successfully====");

                const deleted = await model.deleteBlog({ id });

                if (!deleted[0].affectedRows) return next({ status: 400, message: 'Blog not deleted.' });

                res.status(200).json({ status: 200, message: "Blog deleted", data: null });
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BlogController();