const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const htmlSanitizeMiddleware = require('./utils/htmlSanitize');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');
const hpp = require('hpp');

const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.use(helmet());

app.use(express.static(`${__dirname}/public`));

app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

app.use(htmlSanitizeMiddleware);

app.use(xss());

app.use(expressMongoSanitize());

app.use(hpp());

app.use(cookieParser());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/', limiter);

app.use('/users', userRouter);
app.use('/events', eventRouter);

app.use('/test', (req, res) => {
  res.send(req.body);
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
