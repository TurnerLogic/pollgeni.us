var fs = require('fs');

var Logger = function(path) {
	this.wstream = fs.createWriteStream(path);
};

Logger.prototype.log = function(msg, level) {

	var date = new Date();
	var today = '['+ date.getDate() + "/" + date.getMonth() + '/' + date.getFullYear() + ']';
	switch(level) {
		case 'error':
			level = '[ERROR]';
			break;
		case 'debug':
			level = '[DEBUG]';
			break;
		case 'warn':
			level = '[WARNING]';
			break;
		default:
			level = '[INFO]';
	}

	this.wstream.write(level + ' ' + today + ' ' + msg + '\n');
};

Logger.prototype.error = function(msg) {
	this.log(msg, '[ERROR]');
};

Logger.prototype.end = function() {
	this.wstream.end();
};

module.exports = Logger;