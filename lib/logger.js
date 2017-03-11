const winston = require('winston');
require('winston-papertrail').Papertrail;

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			level: 'info',
			timestamp: true,
			colorize: true,
			handleExceptions: true,
			humanReadableUnhandledException: true
		})
	]
});

module.exports = logger;
