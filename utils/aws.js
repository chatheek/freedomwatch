// utils/aws.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadImage = (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  return s3.upload(params).promise();
};

module.exports = { uploadImage };
