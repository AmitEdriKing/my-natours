const rateLimit = require('express-rate-limit');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHanler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1)Global MIDDLEWARES - to manipulate requests
//Set Security http
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip ,please try again in a hour!'
});

app.use('/api', limiter);

//body parser reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //use middleware must have

//DATA sanitization against NoSQL query injection
//it removes all th $ signs and . and no longer work to write a query
app.use(mongoSanitize());

//Data sanitization agains XSS
app.use(xss());

//prevent parameter pullotion
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
  req.rquestTime = new Date().toISOString(); //to print date time in the process of request response
  //console.log(req.headers);
  next();
});

//3)mount ROUTES --also middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//all routs that never exist
app.all('*', (req, res, next) => {
  //as long as next has an argument it is sent to err middleware not metter on next middleware
  // const err = new Error(`can't find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});

//express know as we define 4 variables
app.use(globalErrorHanler);

module.exports = app;
