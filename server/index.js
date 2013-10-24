var express = require('express');
var http = require('http');
var proxy = require('simple-http-proxy');
var path = require('path');
var hbs = require('express3-handlebars');

var routes = require('./routes');
var helpers = require('./helpers');
var app = express();


app.set('port', process.env.PORT || 3000);

app.engine('html', hbs({
  extname: '.html',
  defaultLayout: 'wallboard',
  helpers: helpers
}));
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}

// Set default route
app.get('/', routes.home);
app.get('/apis/weather', routes.weather);

app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/img', express.static(path.join(__dirname, '../img')));
app.use('/js', express.static(path.join(__dirname, '../js')));

app.use('/uploads', proxy("http://wallboard2013.staging.barrelclient.com/new/uploads"));


// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Wallboard server listening on port %d in %s mode', app.get('port'), app.get('env'));
});