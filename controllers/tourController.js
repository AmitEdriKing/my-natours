const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/*//using sync version because doesnt affect on the event loop
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);*/

//2)ROUTE HANDLES
exports.createTour = catchAsync(async (req, res, next) => {
  //const newTours= new Tour({})
  //newTour.save()//call from the document
  //if things doesnt showed in schema we won't able to see them in the DB
  const newTour = await Tour.create(req.body); //call right in the model

  res.status(201).json({
    status: 'success',
    data: { tour: newTour }
  });

  //   //const newTours= new Tour({})
  //   //newTour.save()//call from the document
  //   //if things doesnt showed in schema we won't able to see them in the DB
  //   const newTour = await Tour.create(req.body); //call right in the model
});

exports.getAllTours = catchAsync(async (req, res) => {
  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //to read parameters from URL's:req.params
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({_id: req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour: tour }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('No Tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that id', 404));
  }

  //204 no content because it deleted
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        //_id: '$ratingsAverage',
        //_id: '$difficulty',
        numOfTours: { $sum: 1 },
        numOfRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minprice: { $min: '$price' },
        maxprice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats
    }
  });
});

exports.getMonthlyplan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfToursStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numOfToursStarts: -1 }
    },
    {
      $limit: 6
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan: plan
    }
  });
});
