var express = require('express');
var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);
var router = express.Router();
var path = require('path');
var request = require('request');
var Poll = require('../models/Poll');
var Logger = require('../lib/Logger.js');
var logger = new Logger('log/poll.log');
var session;


router.use(function (req, res, next) {
	session = session || req.session;
	session.voted = session.voted || [];
	console.log(session);
	logger.log(req.method + ' ' + req.path);
	next();
});

router.get('/', function (req, res) {
	Poll.all(function (err, polls) {
		if (err) res.status(500).send('Unable to load all polls at this time.');
		return res.render('all', {polls: polls});
	});
});

router.get('/meta', function (req, res) {

});

router.get('/create', function (req, res) {
	logger.log('From the polls/create route');
	res.render('create');
	// res.sendFile('create.html', { root: path.join(__dirname, '../public') });
});

router.post('/create', function (req, res) {
	var data = {
		question: req.body.question,
		choices: req.body.choices
	};
	var responses = [];
	var poll = new Poll(data);
	var created_at = Date.now();
	var expires_at = created_at + 2592000000; // 30 days equivalent in ms
	var code = Poll.generateCode();
	var token = Poll.generateToken();
	var reCaptchaEndpoint = 'https://www.google.com/recaptcha/api/siteverify';
	var reCaptchaResponse = req.body.recaptchaResponse;

	// construct the responses object from the choices
	poll.get('choices').forEach(function(element, index) {
		responses[index] = {
			count: 0,
			choice: element
		};
	});

	poll.set('responses', responses);
	poll.set('code', code);
	poll.set('created_at', created_at);
	poll.set('expires_at', expires_at);
	poll.set('token', token);

	poll.save(function(err, result) {
		if (err) res.status(404).send('Poll unable to save. Please try again.');
		request.post(reCaptchaEndpoint, {form: {secret: process.env['RECAPTCHA_SECRET_KEY'], response: reCaptchaResponse }},  function (error, response, body) {
			var body = JSON.parse(body);
			var error = JSON.parse(error);
			if (error) return res.status(403).send('Failed reCatptcha Test. Are you sure you\'re not a bot?');
			if (body.success) {
				logger.log('New poll created with code: ' + code + '.');
				return res.status(200).send({code: code, token: token}); //response to Angular App Poll Create
			}
		});
	});
});

router.get('/:code', function (req, res) {
	var code = req.params.code;
	var token = req.query.token || false;
	var poll = null;
	var creator = false; // whether client created, i.e. unique token is present in URL, the displayed poll

	Poll.findByCode(code, function (err, instance) {
		if (err) res.status(404).send('Poll not found.');
		poll = instance;

		if (poll.get('token') === token) {
			creator = true;
		}
		res.render("poll", {poll: poll.data, title: 'Pollgeni.us', creator: creator});
	});
});

router.put('/:code', function (req, res) {

	var code = req.params.code;
	var poll = null;
	var countToIncrement = null;
	var redirectUrl = '/polls/' + code + '/results';

	console.log(session.voted.indexOf(code));
	console.log('result above');
	if(session.voted.indexOf(code) >= 0) {
		logger.log('Attempted second vote on poll: ' + code, 'warn');
		return res.redirect(redirectUrl);
	}

	session.voted.push(code);

	io.to(code).emit('poll submission', code);
	io.to('public').emit('poll submission', code);
	io.to('index').emit('poll submission');

	Poll.findByCode(code, function (err, instance) {
		if (err) res.status(500).send('Unable to locate the poll on which you voted.');

		poll = instance;
		var choices = poll.get('choices');
		var newResponses = poll.get('responses');

		poll.get('responses').forEach(function(element, index) {
			if (req.body.pollChoice === element.choice) {
				newResponses[index].count = element.count + 1;
				newResponses[index].choice = element.choice;
			} else {
				newResponses[index] = element;
			}
		});

		poll.set('responses', newResponses);
		poll.save(function(err, result) {
			if (err) res.status(500).send('Unable to persist your vote to the database');
			return res.redirect(redirectUrl);
		});
	});

});

router.delete('/:code', function (req, res) {
	var token = req.body.token; //not from url params to avoid hacking
	var code = req.params.code;
	var poll = null;

	Poll.findByCode(code, function(err, instance) {
		if (err) return res.status(404).send('Poll not found.');
		poll = instance;
		if (poll.get('token') === token) {
			poll.delete(function(err, status) {
				if (err) {
					logger.error(JSON.parse(err));
					logger.error('Failed to delete poll with code: ' + code);
					return res.status(500).send('Unable to delete your poll. Please contact Turner Logic.');
				}
				return res.redirect('/');
			});
		} else {
			logger.log('Attempt to delete poll with improper token', 'warn');
			return res.status(403).send('Your token does not match that of the poll.');
		}
	});
});


router.get('/:code/results', function (req, res)
{
	return res.render('results');
});

router.get('/:code/json-results', function (req, res) {
	var code = req.params.code;

	Poll.findByCode(code, function(err, poll) {
		if (err) res.status(404).send('JSON data unavailable');
		res.json(poll.data);
	});
});

module.exports = router;