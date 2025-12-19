const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const authenticateSocket = require('./utils/socketAuth');
const setupSeatLockSocket = require('./sockets/seatLockSocket');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<username>',
  process.env.DB_USERNAME
).replace('<password>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection established!');
  })
  .catch((err) => {
    console.error(err);
  });

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  },
});

io.use((socket, next) => authenticateSocket(socket, next));

setupSeatLockSocket(io);

server.listen(port, () => {
  console.log(`The server is listening on ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
