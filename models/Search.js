var db = require('../db');

exports.all = function(cb) {
	var collection = db.get().collection('tasks');

	collection.find().sort({ _id : -1 }).toArray(function(err, docs){
		cb(err, docs);
	});
}


exports.create = function(name, cb) {
	var collection = db.get().collection('tasks');
	var now = Date.now();
	collection.insert({name: name, created_at: now }, function(err, result) {
		cb(err, result);
	});
}


exports.toggleComplete = function(id, cb) {

	var collection = db.get().collection('tasks');
	var targetTask;
	collection.findOne({ _id : id }, function(err, result) {
		if(result.is_complete) {
			collection.update( { _id : id }, { is_complete: false, name: result.name }, function(err, result) {
				cb(err, result);
			});
		} else {
			collection.update({ _id : id }, { is_complete: true, name: result.name }, function(err, result) {
				cb(err, result);
			});
		}
	});



}

exports.clearComplete = function(cb) {
	var collection = db.get().collection('tasks');
	collection.remove({is_complete: true}, function(err, result) {
		cb(err, result);
	});
}

exports.newFunction = function (req, cb) {
	var collection = db.get().collection('tasks');
	collection.insert(req, function(err, result) {
		cb(err, result);
	});
}