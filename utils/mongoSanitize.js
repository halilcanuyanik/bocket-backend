const expressMongoSanitize = require('@exortek/express-mongo-sanitize');

module.exports = () => {
  const mongoSanitize = expressMongoSanitize();

  return (req, res, next) => {
    const coverImageBody = req.body?.coverImage;
    const coverImageQuery = req.query?.coverImage;
    const coverImageParams = req.params?.coverImage;
    const avatarImageBody = req.body?.avatarImage;
    const avatarImageQuery = req.query?.avatarImage;
    const avatarImageParams = req.params?.avatarImage;

    mongoSanitize(req, res, () => {
      if (coverImageBody !== undefined) req.body.coverImage = coverImageBody;
      if (coverImageQuery !== undefined) req.query.coverImage = coverImageQuery;
      if (coverImageParams !== undefined)
        req.params.coverImage = coverImageParams;
      if (avatarImageBody !== undefined) req.body.avatarImage = avatarImageBody;
      if (avatarImageQuery !== undefined)
        req.body.avatarImage = avatarImageQuery;
      if (avatarImageParams !== undefined)
        req.body.avatarImage = avatarImageParams;
      next();
    });
  };
};
