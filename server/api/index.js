var mysql = require('mysql');
var moment = require('moment');
var request = require('request');
var FeedParser = require('feedparser');
var async = require('async');

var API = function() {
  // Load config from config.json or config.default.json
  try {
    var config = require('../config.json');
  } catch(err) {
    console.log('File "config.json" not found. Using "config.default.json"...');
    var config = require('../config.default.json');
  }

  this.connection = mysql.createConnection(config['db']);
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

API.prototype.getWeather = function(next) {
  var weather = {},
      icons = {
        'sky_is_clear': 'B',
        'few_clouds': 'H',
        'scattered_clouds': 'N',
        'overcast_clouds': 'N',
        'broken_clouds': 'Y',
        'shower_rain': 'R',
        'moderate_rain': 'R',
        'rain': '8',
        'thunderstorm': '6',
        'snow': 'W',
        'mist': 'Q',
        'heavy_intensity_rain': '8',
        'light_rain': 'R',
        'light_intensity_drizzle': 'R',
        'drizzle': 'R',
        'heavy_intensity_drizzle': 'R',
        'very_heavy_rain': '8',
        'extreme_rain': '8',
        'freezing_rain': '8',
        'light_intensity_shower_rain': 'R',
        'heavy_intensity_shower_rain': '8'
      };

  async.parallel([
    function(callback) { // Current weather data
      request('http://api.openweathermap.org/data/2.5/weather?id=5128581&units=imperial&APPID=4039c138d3a75fe829894408af96b78b', function(err, res, body) {
        var weatherData = JSON.parse(body),
            condition = weatherData.weather[0].description;
        
        condition = condition.replace(' ', '_');

        weather.now_high = Math.round(weatherData.main.temp_max);
        weather.now_low = Math.round(weatherData.main.temp_min);
        weather.now_temperature = Math.round(weatherData.main.temp);
        weather.now_icon = icons[condition];

        callback();
      });
    },
    function(callback) { // Next hour weather data
      request('http://api.openweathermap.org/data/2.5/forecast?id=5128581&units=imperial&APPID=4039c138d3a75fe829894408af96b78b', function(err, res, body) {
        var weatherData = JSON.parse(body),
            condition = weatherData.list[0].weather[0].description;

        condition = condition.replace(' ', '_');

        weather.next_hour_temperature = Math.round(weatherData.list[0].main.temp);
        weather.next_hour_icon = icons[condition];

        callback();
      });
    },
    function(callback) { // Future weather data
      request('http://api.openweathermap.org/data/2.5/forecast/daily?q=manhattan,ny&units=imperial&cnt=3&APPID=4039c138d3a75fe829894408af96b78b', function(err, res, body) {   
        var weatherData = JSON.parse(body),
            condition = weatherData.list[0].weather[0].description;

        condition = condition.replace(' ', '_');

        weather.tomorrow_temperature = Math.round(weatherData.list[0].temp.day);
        weather.tomorrow_icon = icons[condition];

        condition = weatherData.list[1].weather[0].description;
        condition = condition.replace(' ', '_');

        weather.next_temperature = Math.round(weatherData.list[1].temp.day);
        weather.next_icon = icons[condition];

        callback();
      });
    }
  ], function(err) {
    weather.date = moment().format('MMM. D @ h:mma');

    next(err, weather);
  });
};

module.exports = API;