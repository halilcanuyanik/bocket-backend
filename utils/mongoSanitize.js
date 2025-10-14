const expressMongoSanitize = require('@exortek/express-mongo-sanitize');

module.exports = () => {
  const mongoSanitize = expressMongoSanitize();

  return (req, res, next) => {
    const coverImageBody = req.body?.coverImage;
    const coverImageQuery = req.query?.coverImage;
    const coverImageParams = req.params?.coverImage;

    mongoSanitize(req, res, () => {
      if (coverImageBody !== undefined) req.body.coverImage = coverImageBody;
      if (coverImageQuery !== undefined) req.query.coverImage = coverImageQuery;
      if (coverImageParams !== undefined)
        req.params.coverImage = coverImageParams;

      next();
    });
  };
};
