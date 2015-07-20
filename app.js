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
var env = require('./.env');
var Logger = require('./lib/Logger');
var app_root = __dirname;
var log_directory = app_root + '/log';

process.env['RECAPTCHA_SECRET_KEY'] = env['RECAPTCHA_SECRET_KEY'];
process.env['SESSION_SECRET'] = env['SESSION_SECRET'];

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
	console.log(req.session);
	res.render("index", {title: 'Welcome to Pollgeni.us!'});
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



var usernames = {};
var numUsers = [];

io.on('connection', function (socket) {
	console.log('User connected');
	var addedUser = false;

	socket.on('subscribe', function(code)
	{
		console.log('somebody subscribed');
		socket.join(code);
		socket.join('public');
	});
});


app.use(express.static(app_root + "/public"));


http.listen(3000, function() {
  console.log('listening on *:3000');
});
