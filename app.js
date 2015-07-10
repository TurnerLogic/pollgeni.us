var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('./lib/sockets').listen(http);
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('polls_db', ['polls']);
var path = require('path');
var methodOverride = require('method-override');
var app_root = __dirname;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'hjs');
app.engine('hjs', require('hogan-express'));
app.set('layout', 'layouts/default');
app.set('partials', {navbar: 'includes/navbar'});
// app.set('partials', {footer: 'includes/footer'});

app.get('/', function(req, res) {
	res.render("index", {title: 'Welcome to Pollgeni.us!'});
});

app.get('/:code', function(req, res) {
	var code = req.params.code;
	var redirectUrl = '/polls/' + code;

	res.redirect(redirectUrl);
});

var usernames = {};
var numUsers = [];

io.on('connection', function(socket)
{
	var addedUser = false;

	socket.on('subscribe', function(code)
	{
		console.log('somebody subscribed');
		socket.join(code);
	});

	socket.on('add user', function(username, code)
	{
		socket.username = username;
		socket.room = code;

		if(usernames[code]) {
			usernames[code].push(username);
			++numUsers[code];
		} else {
			usernames[code] = [];
			usernames[code].push(username);
			numUsers[code] = 1;
		}
		addedUser = true;
		socket.broadcast.to(code).emit('login', {
			username: socket.username,
			numUsers: numUsers[code]
		});
	});

	socket.on('typing', function(code)
	{
		socket.broadcast.to(code).emit('typing', {
			username: socket.username
		});
	});


	socket.on('stop typing', function(code)
	{
		socket.broadcast.to(code).emit('stop typing', {
			username: socket.username
		});
	});


	socket.on('new message', function(data, code)
	{
		console.log(data);
		console.log(code);
		console.log(socket.rooms)
		socket.broadcast.to(code).emit('new message', {
			username: socket.username,
			message: data
		});
	});

	socket.on('disconnect', function()
	{
		console.log(socket.username);
		console.log(socket.room + ' this is the poll\'s room');
		var room = socket.room || null;
		if(addedUser) {
			console.log('true added user');
			delete usernames[room][socket.username];
			--numUsers[room];
		}

		socket.broadcast.to(room).emit('user left', {
			username: socket.username,
			numUsers: numUsers[room]
		});

		socket.leave(room);
		console.log('disconnecting');
	});
});

app.use('/polls', require('./controllers/polls'));


app.use(express.static(app_root + "/public"));

// app.use('/models', express.static('models'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});
