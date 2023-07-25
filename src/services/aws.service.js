const AWS = require('aws-sdk');

// Configure AWS SDK with your credentials and S3 bucket region
AWS.config.update({
    accessKeyId: process.env.YOUR_ACCESS_KEY,
    secretAccessKey: process.env.YOUR_SECRET_KEY,
    region: process.env.YOUR_S3_BUCKET_REGION
});

// Create an S3 instance
const s3 = new AWS.S3();

// Define the S3 bucket name and the key (filename) to store the image
const bucketName = process.env.S3_BUCKET_NAME;

module.exports = { s3, bucketName };