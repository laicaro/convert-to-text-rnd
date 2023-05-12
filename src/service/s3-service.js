'user strict';

const Joi = require('node_modules/joi');
const { validateObject } = require('src/common/utils');
const { S3, GetObjectCommand } = require('node_modules/@aws-sdk/client-s3');

//constants
const S3_FILE_RAW_BUCKET = process.env['S3_FILE_RAW_BUCKET'];
const S3_FILE_CONVERTED_BUCKET = process.env['S3_FILE_CONVERTED_BUCKET'];
const s3Client = new S3();

function validateS3FileKey(params) {
  const schema = Joi.object({
    Bucket: Joi.any().valid(S3_FILE_RAW_BUCKET),
    Key: Joi.string().required()
  });

  validateObject(schema, params);
}

const downloadFile = async s3FileKey => {
  console.info(
    `Downloading S3 file bucket: ${S3_FILE_RAW_BUCKET} key: ${s3FileKey}`
  );
  const params = {
    Bucket: S3_FILE_RAW_BUCKET,
    Key: s3FileKey
  };
  validateS3FileKey(params);

  const data = await s3Client.send(new GetObjectCommand(params));
  return data;
};

const uploadTextsToS3 = async fileText => {
  console.info(
    `Uploading extracted texts, number of files: ${fileText.texts.length}`
  );

  const params = fileText.texts.map((text, index) =>
    constructS3PutParams(text, index, fileText)
  );

  function constructS3PutParams(text, index, { filename }) {
    var file_data = { file_name: filename, file_data: text };
    var body = Buffer.from(JSON.stringify(file_data));

    var s3Data = {
      Bucket: S3_FILE_CONVERTED_BUCKET,
      Key: `${filename}_${index + 1}.json`,
      Body: body,
      ContentEncoding: 'base64',
      ContentType: 'application/json'
    };

    return s3Data;
  }

  await Promise.all(
    params.map(param => {
      console.info(`Uploading file: ${param.Key}.`);
      return s3Client.putObject(param);
    })
  )
    .then(res => console.info(`Total number of uploaded files: ${res.length}`))
    .catch(error => {
      throw error;
    });
};

module.exports = {
  downloadFile,
  uploadTextsToS3
};
