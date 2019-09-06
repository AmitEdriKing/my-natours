const AppError = require('./../utils/appError');

const handleJWTError = () =>
  new AppError('Invalid Token please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token has expired!please log in again', 401);

const handleCastErrorDB = err => {
  const message = `inavlid ${err.path} :${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicatedErrorDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicated fields value: ${value}. please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  //Object.values to iterate on objects array
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `inavlid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrprod = (err, res) => {
  //operatinal , trusted error: send message to client

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    //programming or other unknown error :dont leak error details
  } else {
    //1)Log ErrorController
    console.error('Error 💥', err);
    //2)send generic massage
    res.status(500).json({
      status: 'Error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicatedErrorDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrprod(error, res);
  }
};
