const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require('dotenv').config()

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

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
