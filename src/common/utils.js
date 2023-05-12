'use script';

const Joi = require('node_modules/joi');
const {
  UnsupportedS3FileExtensionError,
  UnrecoverableError
} = require('./custom-error');

const SUPPORTED_FILE_EXTENSIONS = process.env[
  'SUPPORTED_FILE_EXTENSIONS'
].split(',');

const validateEvent = event => {
  const custom = Joi.extend(joi => {
    return {
      type: 'object',
      base: joi.object(),
      coerce(value, schema) {
        if (value[0] !== '{' && !/^\s*\{/.test(value)) {
          return;
        }
        try {
          return { value: JSON.parse(value) };
        } catch (err) {
          console.error(err);
        }
      }
    };
  });

  const recordSchema = Joi.object({
    body: custom.object({
      file_key: Joi.string()
        .custom((value, helperes) => {
          if (!isSupportedFile(value)) {
            return helperes.message({
              custom: 'UnsupportedS3FileExtension'
            });
          }
          return value;
        })
        .label('file_key')
        .required()
    })
  });

  const eventSchema = Joi.object({
    Records: Joi.array().items(recordSchema).max(1).required()
  });

  try {
    const validatedEvent = validateObject(eventSchema, event);
    return validatedEvent.Records[0].body.file_key;
  } catch (error) {
    if (error.message.includes('UnsupportedS3FileExtension')) {
      throw new UnsupportedS3FileExtensionError(
        `Only ${SUPPORTED_FILE_EXTENSIONS} extensions are supported. Skipping process...`
      );
    }

    throw error;
  }
};

const constructFileText = (s3FileKey, texts) => {
  const fileKeys = s3FileKey.split('/');
  console.log(s3FileKey);
  const s3FileName = removeExtension(fileKeys[fileKeys.length - 1]);

  return {
    filename: s3FileName,
    texts: texts
  };
};

const isSupportedFile = file => {
  const fileExtension = file.split('.').pop();
  return SUPPORTED_FILE_EXTENSIONS.includes(fileExtension);
};

const removeExtension = filename => {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
};

const isEmptyOrNull = value => {
  return (
    value === null ||
    typeof value == 'undefined' ||
    (typeof value == 'string' && !value.trim()) ||
    (value instanceof Array && value.length == 0)
  );
};

const buildResponse = (status, body) => {
  console.info('Lambda execution complete.');
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  };
};

const validateObject = (
  schema,
  target,
  options = {
    abortEarly: false,
    stripUnknown: true
  }
) => {
  try {
    const validation = schema.validate(target, options);

    //Check if there are invalid values in the event
    if (validation.error) {
      //Extract error message to not clutter the log
      const parsedErrorMessage = JSON.stringify(
        validation.error.details.map(error => error.message)
      );
      throw new UnrecoverableError(parsedErrorMessage);
    }

    return validation.value;
  } catch (e) {
    throw new UnrecoverableError(e.message);
  }
};

module.exports = {
  validateEvent,
  constructFileText,
  validateObject,
  buildResponse,
  isEmptyOrNull
};
