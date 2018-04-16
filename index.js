const bole  = require('bole');

// Initialize the logger
bole.output([{ level: 'debug', stream: process.stdout }]);

const logger = bole('index');
logger.info('UniVRAule is booting...');

process.on('uncaughtException', (err) => {
	logger.error(err);
	process.exit(1);
});

require('./lib/bot.js');
