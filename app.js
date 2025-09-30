const express = require('express');
const app = express();

const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.use(express.json());

app.use('/users', userRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
