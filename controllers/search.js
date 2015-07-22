var express = require('express');
var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);
var router = express.Router();



router.get('/test',function(req, res) {
	res.render('test');
});

router.get('/polls', function (req, res) {
	db.polls.find(function (err, docs) {
		res.json(docs);
	});
});

router.get('/polls/:id', function (req, res) {
	var id = req.params.id;
	db.polls.findOne({_id: mongojs.ObjectId(id)},function (err, doc) {
		res.json(doc);
	});
});

router.put('/polls/:id', function (req, res) {
	var id = req.params.id;

	db.polls.findAndModify({query: {_id: mongojs.ObjectId(id)},
			update: {
				$set: {
							title: req.body.title,
						  option1: req.body.option1,
					 		option2: req.body.option2,
					 		votesForOption1: req.body.votesForOption1,
					 		votesForOption2: req.body.votesForOption2,
					 		data: req.body.data,
					 		labels: req.body.labels
				 		}},
						new: true},

		function (err,doc) {
			res.json(doc);
		});
});

module.exports = router;
