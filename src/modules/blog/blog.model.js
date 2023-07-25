const { mysql } = require('../../database/connection');

class Modal {
    getBlogByTitle({ title, id }) {
        return mysql.query(`
                    SELECT 
                        id
                    FROM blogs 
                    WHERE title = '${title}' AND created_by = ${id};
                `);
    }

    searchBlogByTitle({ title }) {
        return mysql.query(`
                    SELECT 
                    b.id, b.created_by, CONCAT(u.first_name, ' ', u.last_name) AS created_by_name, b.title, b.description, b.image_link, b.created_at, b.updated_at
                    FROM blogs b
                    JOIN users u ON b.created_by = u.id 
                    WHERE b.title like '%${title}%';
                `);
    }

    getBlogByTitleID({ title, uid }) {
        return mysql.query(`
                    SELECT 
                        id
                    FROM blogs 
                    WHERE title = '${title}' AND created_by <> ${uid};
                `);
    }

    createBlog({ title, description, imageLink, id }) {
        return mysql.query(`
                    INSERT INTO blogs 
                        (created_by, title, description, image_link) 
                    VALUES 
                        (${id}, '${title}', '${description}', '${imageLink}');
                `);
    }

    getAllBlogs({ id, skip, limit }) {
        let query = `
                    SELECT
                    b.id, CONCAT(u.first_name, ' ', u.last_name) AS created_by, b.title, b.description, b.image_link, b.created_at, b.updated_at
                    FROM blogs b
                    JOIN users u ON b.created_by = u.id
                    WHERE b.created_by <> ${id}
                `;

        if (limit) {
            query += ` LIMIT ${limit} `;
            if (skip) query += `OFFSET ${skip}`;
        }

        return mysql.query(query);
    }

    getBlogById({ id }) {
        return mysql.query(`
                SELECT
                    b.id, b.created_by, CONCAT(u.first_name, ' ', u.last_name) AS created_by_name, b.title, b.description, b.image_link, b.created_at, b.updated_at
                FROM blogs b
                JOIN users u ON b.created_by = u.id
                WHERE b.id = ${id};
                `);
    }

    getBlogByIdAndUid({ id, uid }) {
        return mysql.query(`
                SELECT
                    b.id, b.image_link
                FROM blogs b
                WHERE b.id = ${id} AND b.created_by = ${uid};
                `);
    }

    updateBlog({ id, title, description, imageLink }) {
        let str = '';

        if (title) str += str ? `, title = '${title}'` : `SET title = '${title}'`;

        if (description) str += str ? `, description = '${description}'` : `SET description = '${description}'`;

        if (imageLink) str += str ? `, image_link = '${imageLink}'` : `SET image_link = '${imageLink}'`;

        return mysql.query(`UPDATE blogs ${str} WHERE id = ${id};`);
    }

    deleteBlog({ id }) {
        return mysql.query(`DELETE FROM blogs WHERE id = ${id};`);
    }
}

module.exports = new Modal();