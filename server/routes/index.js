var async = require('async');
var API = require('../api');

module.exports.home = function(req, res, next) {
  var wallboardAPI = new API();

  // Load data asynchronously, then render page
  async.parallel([
    function(callback) {
      wallboardAPI.getPhotos(function(err, photos) {
        if (err) return callback(err);
        res.locals.photos = photos;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getCleaningCrew(function(err, cleaningCrew) {
        if (err) return callback(err);
        res.locals.cleaningCrew = cleaningCrew;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getNextHoliday(function(err, nextHoliday) {
        if (err) return callback(err);
        res.locals.nextHoliday = nextHoliday;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getBirthdays(function(err, birthdays) {
        if (err) return callback(err);
        res.locals.birthdays = birthdays;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getUpcomingEvent(function(err, upcoming) {
        if (err) return callback(err);
        res.locals.upcoming = upcoming;
        callback();
      });
    }
  ], function(err) {
    if (err) return next(err);

    res.render('home', {
      title: 'Home',
      now: new Date().toString()
    });

    wallboardAPI.connection.end();
  });
};

module.exports.weather = function(req, res, next) {
  var wallboardAPI = new API();

  wallboardAPI.getWeather(function(err, weather) {
    if (err) return next(err);
    
    res.json(weather);

    wallboardAPI.connection.end();
  });
};
