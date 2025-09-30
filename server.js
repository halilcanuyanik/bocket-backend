const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

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

const server = app.listen(port, () => {
  console.log(`The server is listening on ${port}...`);
});
