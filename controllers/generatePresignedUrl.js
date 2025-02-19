const { PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const s3Client = require('../config/s3Client')

const generatePresignedUrl = async (fileName, fileType, userId) => {
    const bucketName = process.env.S3_TEMP_BUCKET_NAME
    const key = `${userId}/${fileName}`
  
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType
    })
  
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 })
    return url
  }
  
  module.exports = generatePresignedUrl