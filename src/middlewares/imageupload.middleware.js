const multer = require('multer');

// Configure Multer to store the uploaded images in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (adjust as needed)
});

module.exports = upload;