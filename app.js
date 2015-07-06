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
app.set('view engine', 'html');
app.engine('html', require('hogan-express'));

app.get('/', function(req, res) {
	res.render("index");
});

app.get('/:code', function(req, res) {
	var code = req.params.code;
	var redirectUrl = '/polls/' + code;

	res.redirect(redirectUrl);
});

app.use('/polls', require('./controllers/polls'));


app.use(express.static(app_root + "/public"));

// app.use('/models', express.static('models'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});
