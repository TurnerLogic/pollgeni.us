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

	// socket.on('add user', function(username, code)
	// {
	// 	console.log(username);
	// 	socket.username = username;
	// 	socket.room = code;

	// 	if(usernames[code]) {
	// 		usernames[code].push(username);
	// 		++numUsers[code];
	// 	} else {
	// 		usernames[code] = [];
	// 		usernames[code].push(username);
	// 		numUsers[code] = 1;
	// 	}
	// 	addedUser = true;
	// 	io.to(code).emit('login', {
	// 		numUsers: numUsers[code]
	// 	});

	// 	socket.broadcast.to(code).emit('user joined', {
	// 		username: socket.username,
	// 		numUsers: numUsers[code]
	// 	});
	// });

	// socket.on('typing', function(code)
	// {
	// 	socket.broadcast.to(code).emit('typing', {
	// 		username: socket.username
	// 	});
	// });


	// socket.on('stop typing', function(code)
	// {
	// 	socket.broadcast.to(code).emit('stop typing', {
	// 		username: socket.username
	// 	});
	// });


	// socket.on('new message', function(data, code)
	// {
	// 	console.log(data);
	// 	console.log(code);
	// 	console.log(socket.rooms);
	// 	socket.broadcast.to(code).emit('new message', {
	// 		username: socket.username,
	// 		message: data
	// 	});
	// });

	// socket.on('disconnect', function()
	// {
	// 	console.log(socket.username);
	// 	console.log(socket.room + ' this is the poll\'s room');
	// 	var room = socket.room || null;
	// 	if(addedUser) {
	// 		console.log('true added user');
	// 		delete usernames[room][socket.username];
	// 		--numUsers[room];
	// 	}

	// 	socket.broadcast.to(room).emit('user left', {
	// 		username: socket.username,
	// 		numUsers: numUsers[room]
	// 	});

	// 	socket.leave(room);
	// 	console.log('disconnecting');
	// });
});


app.use(express.static(app_root + "/public"));


http.listen(3000, function() {
  console.log('listening on *:3000');
});
