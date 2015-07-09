var express = require('express');
var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);
var router = express.Router();
var path = require('path');
var Poll = require('../models/Poll');

router.get('/create', function (req, res) {
	console.log('This is the get polls/create route');
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

	poll.save(function(err, result)
	{
		if(err) res.status(404).send('Poll unable to save. Please try again.');
		console.log('post create');
		console.log(result);

		// TODO: create a successful creation page with links to share via social media
		// res.sendFile(path.join(__dirname, '../public', 'results.html'));
		return res.status(200).send(code);
		// return res.render('poll', {poll: result});
	});
});

router.get('/:code', function (req, res)
{
	var code = req.params.code;

	Poll.findByCode(code, function(err, poll)
	{
		if(err) res.status(404).send('Poll not found.');
		console.log(poll);
		console.log('found poll');
		res.render("poll", {poll: poll.data});
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