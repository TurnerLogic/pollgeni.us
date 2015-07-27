var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('./lib/sockets').listen(http);
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('polls_db', ['polls']);
var path = require('path');
var session = require('express-session');
var methodOverride = require('method-override');
var Poll = require('./models/Poll');
var env = require('./.env');
var Logger = require('./lib/logger');
var app_root = __dirname;
var log_directory = app_root + '/log';
var totalActiveUsers = 0; // active total

process.env['RECAPTCHA_SECRET_KEY'] = env['RECAPTCHA_SECRET_KEY'];
process.env['SESSION_SECRET'] = env['SESSION_SECRET'];
process.env['RECAPTCHA_SITE_KEY'] = env['RECAPTCHA_SITE_KEY'];

app.use(session({
	secret: process.env['SESSION_SECRET'],
	resave: true,
	saveUninitialized: true
}));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', require('hogan-express'));
app.set('layout', 'layouts/default');
app.set('partials', {navbar: 'includes/navbar', footer: 'includes/footer'});

app.get('/', function (req, res) {
	var meta = {};
	var count = 0;
	var activeUsers = totalActiveUsers;
	Poll.all(function (err, polls) {
		if (err) {
			logger.error('Unable to locate meta data.');
			res.status(500).send('Unable to process your request at this time.');
		}

		polls.forEach(function (element, index) {
			element.data.responses.forEach(function (element, index) {
				count += element.count;
			});
		});

		meta['totalSubmissions'] = count;
		meta['totalPolls'] = polls.length;
		meta['activeUsers'] = activeUsers;
		res.render("index", {title: 'Welcome to Pollgeni.us!', meta: meta});
	});

});

app.use('/polls', require('./controllers/polls'));


app.post('/', function (req, res) {
	var code = req.body.code;
	var redirectUrl = '/polls/' + code;

	res.redirect(redirectUrl);
});

app.get('/:code', function (req, res) {
	var code = req.query.code;
	var redirectUrl = '/polls/' + code;

	res.redirect(redirectUrl);
});

app.use(function (req, res, next) {
	res.status(404);

	if (req.accepts('html')) {
		res.render('404');
	}
});


var usernames = {};
var numUsers = []; // per room

io.on('connection', function (socket) {
	++totalActiveUsers;

	socket.on('index', function () {
		socket.rooms.forEach(function (element, index) {
			socket.leave(element);
		});
		socket.join('index');
		socket.to('index').emit('meta-connection', totalActiveUsers);
	});
	socket.on('public', function () {
		socket.rooms.forEach(function (element, index) {
			console.log(element);
			socket.leave(element);
		});
		socket.join('public');
	});

	socket.on('subscribe', function (room) {
		socket.join(room);
		socket.leave('public');
		socket.leave('index');
	});

	socket.on('disconnect', function () {
		--totalActiveUsers;
		socket.to('index').emit('meta-disconnect', totalActiveUsers);
	});
});

app.use(express.static(app_root + "/public"));

http.listen(3000, function() {
  console.log('listening on *:3000');
});
