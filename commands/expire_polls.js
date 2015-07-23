var mongojs = require('mongojs');
var db = mongojs('polls_db', ['polls']);
var Logger = require('../lib/logger');
var logger = new Logger('log/cron.log');

var today = Date.now();
logger.log('Removing all polls with an expires_at attribute less than ' + today + '.');
db.polls.find( {expires_at: {$lt: today} }, function (err, results) {
	if(err) logger.error('Unable to locate desired polls.');
	logger.log(results.length + ' polls will be removed.');
	results.forEach(function (element, index) {
		logger.log('Removing poll ' + element.code + '.');
		db.polls.remove({ code: element.code }, function (err, status) {
			if(err) logger.error('Failed to delete poll ' + element.code + '.');
			logger.log(JSON.parse(status));
			logger.log('Poll successfully removed');
		});
	});
});