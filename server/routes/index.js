var async = require('async');

var DB = require('../apis').API;

module.exports.home = function(req, res, next) {
  var wallboardDB = new DB();
  var locals = {};

  async.parallel([
    function(callback) {
      wallboardDB.getPhotos(function(err, photos) {
        if (err) return callback(err);
        locals.photos = photos;
        callback();
      });
    },
    function(callback) {
      wallboardDB.getCleaningCrew(function(err, cleaningCrew) {
        if (err) return callback(err);
        locals.cleaningCrew = cleaningCrew;
        callback();
      });
    },
    function(callback) {
      wallboardDB.getNextHoliday(function(err, nextHoliday) {
        if (err) return callback(err);
        locals.nextHoliday = nextHoliday;
        callback();
      });
    },
    function(callback) {
      wallboardDB.getBirthdays(function(err, birthdays) {
        if (err) return callback(err);
        locals.birthdays = birthdays;
        callback();
      });
    },
    function(callback) {
      wallboardDB.getUpcomingEvent(function(err, upcoming) {
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

    wallboardDB.connection.end();
  });
};