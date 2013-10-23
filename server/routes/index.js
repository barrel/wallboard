var async = require('async');

var API = require('../api');

module.exports.home = function(req, res, next) {
  var wallboardAPI = new API();
  var locals = {};

  async.parallel([
    function(callback) {
      wallboardAPI.getPhotos(function(err, photos) {
        if (err) return callback(err);
        locals.photos = photos;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getCleaningCrew(function(err, cleaningCrew) {
        if (err) return callback(err);
        locals.cleaningCrew = cleaningCrew;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getNextHoliday(function(err, nextHoliday) {
        if (err) return callback(err);
        locals.nextHoliday = nextHoliday;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getBirthdays(function(err, birthdays) {
        if (err) return callback(err);
        locals.birthdays = birthdays;
        callback();
      });
    },
    function(callback) {
      wallboardAPI.getUpcomingEvent(function(err, upcoming) {
        if (err) return callback(err);
        locals.upcoming = upcoming;
        callback();
      });
    }
  ], function(err) {
    if (err) return next(err);

    res.render('home', {
      title: 'Home',
      now: new Date().toString(),
      photos: locals.photos,
      cleaningCrew: locals.cleaningCrew,
      nextHoliday: locals.nextHoliday,
      birthdays: locals.birthdays,
      upcoming: locals.upcoming
    });

    wallboardAPI.connection.end();
  });
};