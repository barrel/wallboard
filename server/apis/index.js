var mysql = require('mysql');
var moment = require('moment');
var request = require('request');
var FeedParser = require('feedparser');

var API = function() {
  this.connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'wallboard'
  });

  this.connection.connect();
};


API.prototype.getPhotos = function(next) {
  this.connection.query('SELECT * FROM photos', function(err, rows) {
    next(err, rows);
  });
};

API.prototype.getCleaningCrew = function(next) {
  var dayID = moment().day();

  if(dayID == '6' || dayID == '0') {
    dayID = '1';
  }

  this.connection.query('SELECT * FROM cleaning_meta LEFT JOIN users ON cleaning_meta.user_id = users.id WHERE cleaning_day_id = ' + dayID + ' ORDER BY users.name ASC LIMIT 4', function(err, rows) {
    next(err, rows);
  });
};

API.prototype.getNextHoliday = function(next) {
  this.connection.query('SELECT content FROM options WHERE name = "holidays_feed_url"', function(err, rows) {
    var feedURL = rows[0].content,
        holidays = [];

    request(feedURL+'?orderby=starttime&sortorder=ascending&futureevents=true&singleevents=true')
      .pipe(new FeedParser())
      .on('error', function(err) {
        next(err);
      })
      .on('readable', function() {
        var stream = this,
            item;

        while(item = stream.read()) {
          holidays.push(item);
        }
      }).on('end', function() {
        var date = holidays[0].summary;

        date = date.substring(6);
        date = date.substring(0, date.indexOf('<br>'));

        date = moment(date).format('MMMM Do, YYYY');

        var nextHoliday = {
          name: holidays[0].title,
          date: date
        }

        next(err, nextHoliday);
      });
  });
};

API.prototype.getBirthdays = function(next) {
  this.connection.query('SELECT content FROM options WHERE name = "calendar_feed_url"', function(err, rows) {
    var feedURL = rows[0].content,
        today = moment().startOf('day'),
        nextBirthdayIndex = 0,
        birthdays = [];

    request(feedURL+'?orderby=starttime&sortorder=ascending&singleevents=true&q=Birthday&max-results=100')
      .pipe(new FeedParser())
      .on('error', function(err) {
        next(err);
      })
      .on('readable', function() {
        var stream = this,
            item;

        while(item = stream.read()) {
          if(item.title.toLowerCase().indexOf('birthday') != -1) {
            var name = item.title.substring(0, item.title.indexOf('&#39;'));
            var date = item.summary;
            
            date = date.substring(6);
            date = date.substring(0, date.indexOf('<br>'));
            date = moment(date).startOf('day');

            var birthday = {
              name: item.title.substring(0, item.title.indexOf('&#39;')),
              date: date
            };

            birthdays.push(birthday);

            if(date.unix() > today.unix() && nextBirthdayIndex == 0) {
              nextBirthdayIndex = birthdays.length - 1;
            }
          }
        }
      }).on('end', function() {
        var nextBirthdays = {
          past: {
            name: birthdays[nextBirthdayIndex-1].name,
            date: birthdays[nextBirthdayIndex-1].date.format('MMMM Do')
          },
          next: {
            isToday: (today.unix() == birthdays[nextBirthdayIndex].date.unix()),
            name: birthdays[nextBirthdayIndex].name,
            date: birthdays[nextBirthdayIndex].date.format('MMMM Do')
          },
          future: {
            name: birthdays[nextBirthdayIndex+1].name,
            date: birthdays[nextBirthdayIndex+1].date.format('MMMM Do')
          }
        };

        next(err, nextBirthdays);
      });
  });
};

API.prototype.getUpcomingEvent = function(next) {
  this.connection.query('SELECT content FROM options WHERE name = "events_feed_url"', function(err, rows) {
    var feedURL = rows[0].content,
        upcoming;

    request(feedURL+'?orderby=starttime&sortorder=ascending&futureevents=true&singleevents=true')
      .pipe(new FeedParser())
      .on('error', function(err) {
        next(err);
      })
      .on('readable', function() {
        var stream = this,
            item;

        while(item = stream.read()) {
          if(!upcoming) {
            var date = item['gd:when']['@'].starttime;
            date = moment(date);

            upcoming = {
              title: item.title,
              date: date.format('MMM. DD')
            };
          }
        }
      }).on('end', function() {
        next(err, upcoming);
      });
  });
};

module.exports.API = API;