'use strict';

const { validateEvent, constructFileText } = require('./src/common/utils');
const s3Service = require('./src/service/s3-service');
const extractorService = require('./src/service/text-service');
const {
  UnsupportedS3FileExtensionError,
  NoFileFoundError,
  UnrecoverableError
} = require('./src/common/custom-error');

const { buildResponse } = require('./src/common/utils');
const { SUCCESS_STATUS, FAILURE_STATUS } = require('./src/common/constants');

exports.handler = async event => {
  console.log(`Received event: ${JSON.stringify(event)}`);

  try {
    const s3FileKey = validateEvent(event);
    const s3Data = await s3Service.downloadFile(s3FileKey);
    const texts = await extractorService.processFile(s3Data, s3FileKey);
    const fileText = constructFileText(s3FileKey, texts);
    await s3Service.uploadTextsToS3(fileText);

    return buildResponse(SUCCESS_STATUS, 'Success');
  } catch (error) {
    switch (error.constructor) {
      case UnsupportedS3FileExtensionError:
      case UnrecoverableError:
        console.warn(`Invalid request: ${error.message}...`);
        return buildResponse(SUCCESS_STATUS, error.message);
      case NoFileFoundError:
      default:
        console.error(error.message);
        return buildResponse(FAILURE_STATUS, error.message);
    }
  }
};
