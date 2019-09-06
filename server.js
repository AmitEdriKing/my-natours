const mongoose = require('mongoose');
const dotenv = require('dotenv');

//handeling uncaught exception
process.on('uncaughtException', err => {
  console.log('uncatught exception! 💥 shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successfully'));

//console.log(process.env);
//4)SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port:${port}`);
});

//when error occured last safety net
process.on('unhandledRejection', err => {
  console.log('unhandled rejection 💥 shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
