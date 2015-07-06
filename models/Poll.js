var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);

var Poll = function(data)
{
	this.data = data;
};

Poll.prototype.data = {};

Poll.prototype.changeQuestion = function(question)
{
	this.data.question = question;
};


Poll.prototype.findByCode = function(code, callback)
{
	db.polls.findOne({code: code}, function(err, data)
	{
		if(err) return callback(err);
		callback(null, new User(data));
	});
};

Poll.prototype.save = function(callback)
{
	var self = this;
	db.polls.findAndModify({
		query: {code: this.code},
		update: { $set: JSON.stringify(this.data) },
		new: true
		},
		function(err, result)
		{
			if(err) return callback(err);
			callback(null, self);
		});
};


Poll.prototype.get = function(key)
{
	return this.data[key];
};

Poll.prototype.set = function(key, value)
{
	this.data[key] = value;
};

module.exports = Poll;