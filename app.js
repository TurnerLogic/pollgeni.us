var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('./lib/sockets').listen(http);
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('polls_db', ['polls']);
var path = require('path');
var methodOverride = require('method-override');
var env = require('./.env.js');
var app_root = __dirname;

process.env['RECAPTCHA_SECRET_KEY'] = env['RECAPTCHA_SECRET_KEY'];
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', require('hogan-express'));
app.set('layout', 'layouts/default');
app.set('partials', {navbar: 'includes/navbar', footer: 'includes/footer'});

app.get('/', function (req, res) {
	res.render("index", {title: 'Welcome to Pollgeni.us!'});
});

app.use('/polls', require('./controllers/polls'));

app.get('/:code', function (req, res) {
	var code = req.params.code;
	var redirectUrl = '/polls/' + code;

	res.redirect(redirectUrl);
});

var usernames = {};
var numUsers = [];

io.on('connection', function (socket) {
	var addedUser = false;

	socket.on('subscribe', function(code)
	{
		console.log('somebody subscribed');
		socket.join(code);
		console.log(code);
	});

	socket.on('to public',function(room) {
		socket.join(room);
		console.log(room);
	});
});


app.use(express.static(app_root + "/public"));


http.listen(3000, function() {
  console.log('listening on *:3000');
});
