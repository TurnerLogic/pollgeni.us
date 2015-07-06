var mongojs = require('mongojs');
var db = mongojs('polls_db',['polls']);

var Poll = function(data)
{
	this.data = data;
};

Poll.prototype.data = {};

Poll.findByCode = function(code, callback)
{
	db.polls.findOne({code: code}, function(err, data)
	{
		if(err) return callback(err);
		callback(null, new Poll(data));
	});
};

Poll.prototype.save = function(callback)
{
	var self = this;

	console.log(this);
	console.log(self.data);

	db.polls.findOne({code: self.data.code}, function(err, doc)
	{
		console.log('inside findeOne');
		console.log(err);
		if( !doc )
		{
			db.polls.save(self.data, function(error, doc)
			{
				return callback(null, doc);
			});
		} else {
			db.polls.update({code: self.data.code}, self.data, function(error, doc)
			{
				return callback(null, doc);
			});
		}
	});
// 	db.polls.findAndModify({
// 		query: {code: this.code},
// 		update: { $set: JSON.stringify(this.data) },
// 		new: true
// 		},
// 		function(err, doc, lastErrorObject)
// 		{
// 			console.log('anon function from save poll model');
// 			if(err) return callback(lastErrorObject);
// 			console.log(self);
// 			callback(null, self);
// 		});
// };
};


Poll.prototype.get = function(key)
{
	return this.data[key];
};

Poll.prototype.set = function(key, value)
{
	this.data[key] = value;
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


var getRandomInt = function(max, min)
{
	return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = Poll;