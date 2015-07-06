var express = require('express');
var mongojs = require('mongojs');
console.log('now attempting connection to db');
var db = mongojs('polls_db',['polls']);
var router = express.Router();
var Poll = require('../models/Poll');

router.get('/', function (req, res) {
	db.polls.find(function (err, docs) {
		res.json(docs);
	});
});


router.post('/', function (req, res) {

	for(var i = 0; i < Object.keys(req.body.option).length;i++){
		req.body.labels.push(req.body.option[i]);
	}

	for(var i = 0; i < Object.keys(req.body.option).length;i++){
		req.body.data.push(0);
	}

	db.polls.insert(req.body, function (err, doc) {
		res.json();
	});
});

router.delete('/:id', function (req, res) {
	var id = req.params.id;
	db.polls.remove({_id: mongojs.ObjectId(id)},function (err, doc) {
		res.json(doc);
	});
});

router.get('/:code', function (req, res) {
	var code = req.params.code;
	Poll.findByCode(code, function(err, poll)
	{
		if(err) res.status(404).send('Poll not found.');
		res.render("poll", {poll: poll});
	});
});

router.post('/polls/create', function (req, res)
{
	var poll = new Poll(req.body);
	var created_at = Date.now();
	var expires_at = created_at + 2592000000;

	poll.set('created_at', created_at);
	poll.set('expires_at', expires_at);

	poll.save(function(err, result)
	{
		if(err) res.send('Poll unable to save. Please try again.');

		// TODO: create a successful creation page with links to share via social media
		res.render('poll', {poll: poll});
	});
});

router.put('/:code', function (req, res) {
	var code = req.params.code;
	var poll = null;
	var countToIncrement = null;

	io.on('connection', function(socket)
	{
		console.log("Connection from the polls/create post route");
		socket.join(code);
	});

	io.to(code).emit(code);

	Poll.findByCode(code, function(err, instance)
	{
		if(err) res.status(500).send('Unable to locate the poll on which you voted.');
		poll = instance;
		var responses = poll.get('responses');

		responses.forEach(function(element, index)
		{
			if(req.params.pollChoice === element.question)
			{
				countToIncrement = element.count + 1;
				responses[index].count = countToIncrement;
			}
		});

		poll.set('responses', responses);
		poll.save(function(err, result)
		{
			if(err) res.status(500).send('Unable to persist your vote to the database');
			res.render('poll', {'poll': poll});
		});

	})

});

module.exports = router;