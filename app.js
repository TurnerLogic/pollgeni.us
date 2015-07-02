var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', require('hogan-express'));

app.use('/', require('./controllers/polls'));

app.use('/', require('./controllers/search'));

app.use(express.static(__dirname + "/public"));

app.use('/models', express.static('models'));

io.on('connection', function(socket){
	console.log('a user connected');
	socket.join('mainRoom');
	  	socket.on('voted', function(vote){
	    	console.log('vote: ' + vote);
	    	io.emit('voted', vote);
		});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
