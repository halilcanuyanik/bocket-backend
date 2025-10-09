const sanitizeHtml = require('sanitize-html');

const sanitizeRecursively = (obj) => {
  if (!obj) return;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeHtml(obj[key], {
        allowedTags: [],
        allowedAttributes: {},
      });
    } else if (typeof obj[key] === 'object') {
      sanitizeRecursively(obj[key]);
    }
  }
};

const sanitizeHtmlMiddleware = (req, res, next) => {
  sanitizeRecursively(req.body);
  sanitizeRecursively(req.query);
  sanitizeRecursively(req.params);
  next();
};

module.exports = sanitizeHtmlMiddleware;
