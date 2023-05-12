'use strict';

const textract = require('textract');

const TEXTS_CHUNK_SIZE = process.env['TEXTS_CHUNK_SIZE'];
const DELIMITER = process.env['DELIMITER'];
const MIME_TYPE_MAPPINGS = {
  pdf: 'application/pdf',
  pptx:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

const processFile = async (s3Data, s3FileKey) => {
  console.info('Starting extraction of texts from file...');
  const fileExtension = s3FileKey.split('.').pop();
  const extractResult = await extractTextFromFile(
    s3Data,
    MIME_TYPE_MAPPINGS[fileExtension]
  );
  console.info('Completed extraction of texts from file...');
  const re = new RegExp(`(?<=${DELIMITER})`, 'gi');
  const texts = extractResult.split(re).filter(entry => {
    return entry.trim() != '';
  });
  return chunkTexts(texts, TEXTS_CHUNK_SIZE);
};

function chunkTexts(textSplits, chunkSize) {
  const chunks = [];
  let i = 0;
  let n = textSplits.length;

  while (i < n) {
    chunks.push(textSplits.slice(i, (i += Number(chunkSize))).join(''));
  }

  return chunks;
}

async function extractTextFromFile(s3Data, mimeType) {
  return new Promise(async (resolve, reject) => {
    const inputStream = s3Data.Body;

    var bufs = [];
    inputStream.on('data', function (d) {
      bufs.push(d);
    });
    inputStream.on('end', function () {
      var buf = Buffer.concat(bufs);
      textract.fromBufferWithMime(mimeType, buf, function (error, text) {
        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });
  });
}

module.exports = {
  processFile
};
