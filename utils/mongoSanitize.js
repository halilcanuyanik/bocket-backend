const expressMongoSanitize = require('@exortek/express-mongo-sanitize');

const mongoSanitize = expressMongoSanitize();
const githubRawPattern =
  /^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\/.+$/;

module.exports = () => {
  return (req, res, next) => {
    try {
      ['coverImage', 'avatarImage'].forEach((field) => {
        ['body', 'query', 'params'].forEach((loc) => {
          const val = req[loc]?.[field];
          if (val && !githubRawPattern.test(val)) {
            throw new AppError(`${field} must be a valid GitHub raw URL`, 400);
          }
        });
      });
    } catch (error) {
      return next(error);
    }

    const dateFields = ['startTime', 'endTime'];
    const imageFields = ['coverImage', 'avatarImage'];
    const savedValues = {};

    ['body', 'query', 'params'].forEach((loc) => {
      if (req[loc]) {
        dateFields.forEach((field) => {
          const val = req[loc][field];
          if (
            val &&
            typeof val === 'string' &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)
          ) {
            if (!savedValues[loc]) savedValues[loc] = {};
            savedValues[loc][field] = val;
          }
        });

        imageFields.forEach((field) => {
          const val = req[loc][field];
          if (val && typeof val === 'string' && githubRawPattern.test(val)) {
            if (!savedValues[loc]) savedValues[loc] = {};
            savedValues[loc][field] = val;
          }
        });
      }
    });

    mongoSanitize(req, res, () => {
      Object.keys(savedValues).forEach((loc) => {
        Object.keys(savedValues[loc]).forEach((field) => {
          if (req[loc]) {
            req[loc][field] = savedValues[loc][field];
          }
        });
      });

      next();
    });
  };
};
