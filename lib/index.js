const request   = require('request');
const config    = require('./config');
const Telegram  = require('./telegram').Telegram;
const Processor = require('./telegram/processor.js').Processor;
const logger    = require('./logger.js');

// Initialize an instance of Telegram
let telegram = new Telegram(config(['telegram', 'port']), config(['telegram', 'token']));

// Start the server
telegram.start();

// Process incoming messages
telegram.on('message', (message) => {
	let processor = new Processor(message['text']);
	processor.process((err, text) => {
		if (err) {
			logger.error(err);
			return;
		}

		let chatId = message['chat']['id'];
		telegram.send(chatId, text, (err) => {
			if (err) {
				logger.error(err);
			}

			return;
		});
	});
});

// Get rooms status every minute
setInterval(() => {
	let options = {
		url: config(['api', 'endpoint']),
		method: 'GET',
		timeout: 60 * 1000,
		json: true
	};

	request(options, (err, status, body) => {
		if (err) {
			logger.error(err);
			return;
		}

		if (status['statusCode'] != 200) {
			logger.error(new Error(`Response status code is ${status['statusCode']}`));
			return;
		}

		global.rooms = body['data'];
	});
}, 1 * 60 * 1000);
