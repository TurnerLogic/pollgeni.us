var express = require('express'),
	ObjectID = require('mongodb').ObjectID;
	router  = express.Router();

var Task = require('../models/Task');

router.get('/contactList',function (req,res) {
	console.log('i got a request');

});	

router.post('/contactList',function (req, res){
	console.log(req.body);
	Task.newFunction(req.body);
});

	router.get('/', function(req, res) {
		Task.all(function(err, docs) {
			res.render('index', {tasks: docs} );
		});
	});

	router.post('/tasks/:id/toggle-complete', function(req, res) {
		var id = new ObjectID(req.params.id);
		Task.toggleComplete(id, function(err, result) {
			if(result) {
				res.redirect('/');
			} else {
				res.send(err);
			}

		});


	});

	router.post('/tasks/clear-complete', function(req, res) {
		Task.clearComplete(function(err, result) {
			if(result) {
				res.redirect('/');
			} else {
				res.send(err);
			}
		});
	});

	router.post('/tasks' ,function(req, res) {
		if(req.body.name) {
			Task.create(req.body.name, function(err, result){
				if(result) {
					res.redirect('/');
				} else {
					res.send(err);
				}
				console.log(name);
			});
		}
	});

module.exports = router;