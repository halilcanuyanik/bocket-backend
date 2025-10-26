const expressMongoSanitize = require('@exortek/express-mongo-sanitize');

const mongoSanitize = expressMongoSanitize();
const githubRawPattern =
  /^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\/.+$/;

module.exports = () => {
  return (req, res, next) => {
    mongoSanitize(req, res, () => {
      ['coverImage', 'avatarImage'].forEach((field) => {
        ['body', 'query', 'params'].forEach((loc) => {
          const val = req[loc]?.[field];
          if (val && !githubRawPattern.test(val)) {
            return next(
              new AppError(`${field} must be a valid GitHub raw URL`, 400)
            );
            // req[loc][field] = null;
          }
        });
      });
      next();
    });
  };
};
