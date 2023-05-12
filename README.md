# convert-to-text-rnd

## Overview

- This is an R&D Lambda function to convert pptx/pdf to pure text (textract) and store them to json object
- Test object structure validation (joi) and json structure
- Test S3 aws-sdk v3 and stream piping with textract 

### Challenge

Because JP doesn't have spaces and kanji/hiragana changes meaning depending on order and characters next to them,
we need to split the texts in a way that the sentences retain their structure.

### Solution

Solution is to use `。` as `DELIMITER` which is a japanese `.`, and `TEXTS_CHUNK_SIZE` is how many sentences we want to store in 1 json file.

# Installation

### Prerequisite

1. Docker
2. AWS SAM CLI
3. AWS CLI is already setup with role/user who has access to target S3s in `template.yaml`.

### How to run

1. run `npm install`
2. Configure `devfiles/template.yaml` with desired behavior
3. Point `file_key` on `devfiles/pptx-file.json` to a valid S3 Object with pptx or pdf file type
4. run `npm run sam:test`
