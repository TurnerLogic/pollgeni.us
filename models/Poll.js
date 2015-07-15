var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);
var randToken = require('rand-token');

var Poll = function(data) {
	this.data = data;
};

Poll.prototype.data = {};

Poll.findByCode = function(code, callback) {
	db.polls.findOne({code: code}, function (err, data) {
		console.log(data);
		console.log('this is the data from findbyCode');
		if(err) return callback(err);
		callback(null, new Poll(data));
	});
};

Poll.prototype.save = function(callback) {
	var self = this;

	db.polls.findOne({code: self.data.code}, function (err, doc) {
		if (!doc) {
			db.polls.save(self.data, function (error, doc) {
				return callback(null, doc);
			});
		} else {
			db.polls.update({code: self.data.code}, self.data, function (error, doc) {
				return callback(null, doc);
			});
		}
	});
};

Poll.prototype.delete = function(callback)
{
	console.log('detele from model');
	db.polls.remove({code: this.data.code}, function(err, data)
	{
		if(err) return callback(err);
		return callback(null, data);
	});
};


Poll.prototype.get = function(key) {
	return this.data[key];
};

Poll.prototype.set = function(key, value) {
	this.data[key] = value;
};

Poll.all = function(callback) {
	var polls = [];
	db.polls.find(function (err, docs) {
		if (err) {
			return callback(err);
		}
		docs.forEach(function (element, index) {
			console.log(element);
			polls.push(new Poll(element));
		});

		return callback(null, polls);
	});
};

Poll.generateCode = function()
{
	var code = '';

	var validChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	var validDigits = ['2', '3', '4', '5', '6', '7', '8', '9'];

	for(var i = 0; i < 5; i++)
	{
		if(Math.random() > 0.5)
		{
			code += validChars[getRandomInt(0, validChars.length - 1)];
		} else {

			code += validDigits[getRandomInt(0, validDigits.length - 1)];
		}
	}

	return code;
};

Poll.generateToken = function()
{
	return randToken.generate(16);
}


var getRandomInt = function(max, min)
{
	return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = Poll;