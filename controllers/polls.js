var express = require('express');
var mongojs = require('mongojs');
var db = mongojs('poll_genius_db',['polls']);
var router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});


router.get('/polls', function (req, res) {
	db.polls.find(function (err, docs) {
		res.json(docs);
	});
});


router.post('/polls', function (req, res) {

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

router.delete('/polls/:id', function (req, res) {
	var id = req.params.id;
	db.polls.remove({_id: mongojs.ObjectId(id)},function (err, doc) {
		res.json(doc);
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

	socket.on('voted',function(incrementedValue,indexToIncrement){

		// // // set data equal to new data that after it has been incremented
		req.body.data[indexToIncrement] = incrementedValue;
					
		// // POST the updated data to DB
		$http.put('/polls/' + $scope.polls[index]._id, $scope.polls[index]);

		console.log($scope.polls[index].data);
		console.log(indexToIncrement);
		
	});

	db.polls.findAndModify({query: {_id: mongojs.ObjectId(id)},
			update: {
				$set: {
							title: req.body.title,
						    options: req.body.options,
					 		data: req.body.data,
					 		labels: req.body.labels,
				 		}},
						new: true},

		function (err,doc) {
			res.json(doc);
		});
});

module.exports = router;