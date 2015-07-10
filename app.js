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
app.set('partials', {header: 'includes/navbar'});

app.get('/', function(req, res) {
	res.render("index");
});

app.get('/:code', function(req, res) {
	var code = req.params.code;
	var redirectUrl = '/polls/' + code;

	res.redirect(redirectUrl);
});

var usernames = {};
var numUsers = 0;

io.on('connection', function(socket)
{
	var addedUser = false;
	console.log('37');
	socket.on('subscribe', function(code)
	{
		console.log('somebody subscribed');
		socket.join(code);
	});
	console.log('43');
	socket.on('add user', function(username, code)
	{
		socket.username = username;

		usernames[username] = username;
		++numUsers;
		addedUser = true;
		socket.broadcast.to(code).emit('login', {
			username: socket.username,
			numUsers: numUsers
		});
	});
	console.log('56');
	socket.on('typing', function(code)
	{
		socket.broadcast.to(code).emit('typing', {
			username: socket.username
		});
	});

	console.log('64');
	socket.on('stop typing', function(code)
	{
		socket.broadcast.to(code).emit('stop typing', {
			username: socket.username
		});
	});

	console.log('72');
	socket.on('new message', function(data, code)
	{
		console.log(data);
		console.log(code);
		socket.broadcast.to(code).emit('new message', {
			username: socket.username,
			message: data
		});
	});
	console.log('82');
	socket.on('unsubscribe', function(code)
	{
		console.log('somebody unsubscribed');
		socket.leave(code);
	});
	console.log('88');
	socket.on('disconnect', function()
	{
		console.log('disconnecting');
	});
});

app.use('/polls', require('./controllers/polls'));


app.use(express.static(app_root + "/public"));

// app.use('/models', express.static('models'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});
