'use strict';

class UnrecoverableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class UnsupportedS3FileExtensionError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NoFileFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = {

  UnsupportedS3FileExtensionError: UnsupportedS3FileExtensionError,
  NoFileFoundError: NoFileFoundError,
  UnrecoverableError: UnrecoverableError
};
