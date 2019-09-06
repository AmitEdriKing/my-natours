const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users: users }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)create an error if user posts password Data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updating please use updateMyPassword',
        400
      )
    );
  }
  //2)filtered out unwanted field names that are not allowed to be updated
  //we didnt send the req.body as a second argument because then the user then can his role and other things we dont want him to change
  const filteredBody = filterObject(req.body, 'name', 'email');

  //3) update User document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
  next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'err', message: 'this route is not yet defined' });
};
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'err', message: 'this route is not yet defined' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'err', message: 'this route is not yet defined' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'err', message: 'this route is not yet defined' });
};
