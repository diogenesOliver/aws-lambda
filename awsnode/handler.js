'use strict';

const AWS = require('aws-sdk')
const sharp = require('sharp')
const { basename, extname } = requiser('path')

const S3 = new AWS.S3()

module.exports.hello = async ({ Records: records }) => {
  try {

    await Promise.all(records.map(async record => {
      const { key } = record.s3.object

      const image = await S3.getObject({
        Bucket: process.env.bucket,
        Key: key
      }).promise()

      const optimized = await sharp(image.body)
        .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg', { progressive: true, quality: 50 })
        .toBuffer()

      await S3.putObject({
        Body: optimized,
        Bucket: process.env.bucket,
        ContentType: 'image/jpeg',
        key: `compressed/${basename(key, extname(key))}.jpeg`
      }).promise()
      
    }))

    return {
      statusCode: 200,
      body: {}
    }

  }catch(err){
    return err
  }
};
