require("dotenv").config();
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME } =
  process.env;

const aws = require("aws-sdk");
const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const uploadToS3 = async (files, imageFieldName) => {
  // console.log(16, files);
  let fileExtend = files[imageFieldName][0].originalname.split(".")[1];
  let uploadPath;

  if (imageFieldName === "cover" || imageFieldName === "video") {
    uploadPath = `assets/${Date.now()}.${fileExtend}`;
  } else if (imageFieldName === "sideImg1") {
    uploadPath = `profile/${Date.now()}_1.${fileExtend}`;
  }

  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: uploadPath, // File name you want to save as in S3
    ContentType: files[imageFieldName][0].minetype,
    Body: files[imageFieldName][0].buffer,
  };

  const uploadedImage = await s3.upload(params).promise();
  // console.log(34, uploadedImage);
  const uploadFilenameWithFile = uploadedImage.Key;
  const uploadFilename = uploadFilenameWithFile.split("/")[1];
  // console.log(36, uploadFilename);

  return uploadFilename;
};

module.exports = {
  uploadToS3,
};
