const expressMongoSanitize = require('@exortek/express-mongo-sanitize');
const AppError = require('../utils/appError');

const mongoSanitize = expressMongoSanitize();
const githubRawPattern =
  /^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\/.+$/;

module.exports = () => {
  return (req, res, next) => {
    const original = {
      ...req.body,
      coverImage: req.body.coverImage,
      avatarImage: req.body.avatarImage,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    };

    mongoSanitize(req, res, () => {
      req.body.coverImage = original.coverImage;
      req.body.avatarImage = original.avatarImage;
      req.body.startTime = original.startTime;
      req.body.endTime = original.endTime;

      ['coverImage', 'avatarImage'].forEach((field) => {
        ['body', 'query', 'params'].forEach((loc) => {
          const val = req[loc]?.[field];
          if (val && !githubRawPattern.test(val)) {
            return next(
              new AppError(`${field} must be a valid GitHub raw URL`, 400)
            );
          }
        });
      });

      ['startTime', 'endTime'].forEach((field) => {
        const val = req.body[field];
        if (val && isNaN(Date.parse(val))) {
          return next(new AppError(`${field} must be valid ISO date`, 400));
        }
      });

      next();
    });
  };
};
