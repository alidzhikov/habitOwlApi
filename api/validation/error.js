const { validationResult } = require('express-validator').check;

exports.validationCheck = (req) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
}

exports.isUserAuthorized = (req) => {
  if (req.body.creator.toString() !== req.userId) {
    const error = new Error('Not authorized!');
    error.statusCode = 403;
    throw error;
  }
}

exports.isItemFound = (item, name) => {
  if (!item) {
    const error = new Error('Could not find ' + name.trim() + '.');
    error.statusCode = 404;
    throw error;
  }
}