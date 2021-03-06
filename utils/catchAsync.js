module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
    //the same fn(req, res, next).catch(next);
  };
};
