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

		// TODO: handlebars

		telegram.send(chatId, text, (err) => {
			if (err) {
				logger.error(err);
			}

			return;
		});
	});
});
