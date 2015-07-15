var express = require('express');
var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);
var router = express.Router();
var path = require('path');
var Poll = require('../models/Poll');

router.get('/create', function (req, res) {
	console.log('This is the get polls/create route');
	var token = Poll.generateToken();
	// req.session.token = token;
	// res.locals = {token: token};
	// res.render('create');
	res.sendFile('create.html', { root: path.join(__dirname, '../public') });
});

router.post('/create', function (req, res)
{
	var data = req.body;
	var responses = [];
	var poll = new Poll(data);
	var created_at = Date.now();
	var expires_at = created_at + 2592000000;
	var code = Poll.generateCode();
	var token = Poll.generateToken();
	// console.log(req.session.token + ' this is from the post create route');

	poll.get('choices').forEach(function(element, index)
	{
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

	poll.save(function(err, result)
	{
		if(err) res.status(404).send('Poll unable to save. Please try again.');
		console.log('post create');
		console.log(result);

		// TODO: create a successful creation page with links to share via social media
		// res.sendFile(path.join(__dirname, '../public', 'results.html'));
		return res.status(200).send({code: code, token: token});
		// return res.render('poll', {poll: result});
		// return res.redirect('/' + code + '?token=' + token);
	});
});

router.get('/:code', function (req, res)
{
	var code = req.params.code;
	var token = req.query.token || null;
	var poll = null;
	var deletePoll = false;

	Poll.findByCode(code, function(err, instance)
	{
		if(err) res.status(404).send('Poll not found.');
		poll = instance;
		console.log(poll);
		if(poll.get('token') === token)
		{
			deletePoll = true;
			// poll.delete(function(err, status)
			// {
			// 	if(err) res.status(500).send('Unable to delete your poll.');
			// 	res.send(status);
			// });
		}
		console.log(poll);
		console.log('found poll');
		res.render("poll", {poll: poll.data, title: 'Pollgeni.us', delete: deletePoll});
	});
});

router.put('/:code', function (req, res) {
	console.log('made it to the put action');
	var code = req.params.code;
	var poll = null;
	var countToIncrement = null;
	var redirectUrl = '/polls/' + code + '/results';

	console.log("Connection from the polls/create get route");
	console.log(io);

	io.to(code).emit('poll submission', code);


	Poll.findByCode(code, function(err, instance)
	{
		if(err) res.status(500).send('Unable to locate the poll on which you voted.');

		poll = instance;
		var choices = poll.get('choices');
		var newResponses = poll.get('responses');

		poll.get('responses').forEach(function(element, index)
		{
			if(req.body.pollChoice === element.choice)
			{
				newResponses[index].count = element.count + 1;
				newResponses[index].choice = element.choice;
			} else {
				newResponses[index] = element;
			}

		});

		poll.set('responses', newResponses);
		poll.save(function(err, result)
		{
			console.log('redirecting: ' + redirectUrl);
			if(err) res.status(500).send('Unable to persist your vote to the database');
			return res.redirect(redirectUrl);
		});

	});

});

router.delete('/:code', function(req, res)
{
	console.log(req.body);
	console.log('dis da body');
	var token = req.body.token; //not from url params to avoid hacking
	var code = req.params.code;
	var poll = null;

	Poll.findByCode(code, function(err, instance)
	{
		if(err) return res.status(404).send('Poll not found.');
		poll = instance;
		if(poll.get('token') === token)
		{
			poll.delete(function(err, status)
			{
				if(err) return res.status(500).send('Unable to delete your poll. Please contact Turner Logic.');

				return res.redirect('/');
			});
		}

		return res.status(403).send('Quit trying to hack us, asshole.');

	});
});


router.get('/:code/results', function (req, res)
{
	res.sendFile('results.html', { root: path.join(__dirname, '../public') });
});

router.get('/:code/json-results', function (req, res)
{
	var code = req.params.code;

	Poll.findByCode(code, function(err, poll)
	{
		if(err) res.status(404).send('JSON data unavailable');
		res.json(poll.data);
	});

});

module.exports = router;