const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const htmlSanitizeMiddleware = require('./utils/htmlSanitize');
const mongoSanitizeMiddleware = require('./utils/mongoSanitize');
const hpp = require('hpp');
const cors = require('cors');
const qs = require('qs');

app.set('query parser', (str) => qs.parse(str));

const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const performerRouter = require('./routes/performerRoutes');
const venueRouter = require('./routes/venueRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.use(helmet());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.static(`${__dirname}/public`));

app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

app.use(htmlSanitizeMiddleware);

app.use(xss());

app.use(mongoSanitizeMiddleware());

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
app.use('/performers', performerRouter);
app.use('/venues', venueRouter);

app.use('/test', (req, res) => {
  res.send(req.body);
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
