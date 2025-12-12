const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const authenticateSocket = catchAsync(async (socket, next) => {
  let token = null;
  if (
    socket.handshake &&
    socket.handshake.auth &&
    socket.handshake.auth.token
  ) {
    token = socket.handshake.auth.token;
  } else if (
    socket.handshake &&
    socket.handshake.headers &&
    socket.handshake.headers.authorization
  ) {
    token = socket.handshake.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Token not provided!', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  socket.user = {
    id: decoded.id,
    email: decoded.email,
  };
  return next();
});

module.exports = authenticateSocket;
