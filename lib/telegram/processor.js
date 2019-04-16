const logger         = require('./../logger.js');
const TelegramClient = require('./client.js');
const api            = require('./../services/api.js');
const tg = new TelegramClient();

class TelegramProcessor {
	constructor(update) {
		this.update = update;
	}
	
	process() {
		// Only text is allowed
		if (!this.update['message']) {
			return;
		}

		this._handleMessage(this.update['message']);
	}
	
	_handleMessage(message) {
		this.message = message;
		this.chat = message['chat'];

		if (!message['text']) {
			logger.debug('Message is not text');

			tg.sendMessage({
				key: 'dunno',
				type: 'sendMessage',
				chat: this.chat['id']
			});

			return;
		}

		logger.debug(`Incoming <text> from <${this.chat.id}>: ${this.message['text']}`);
		let text = this.message['text'];
		let cmd = text.replace(/\/ /, '').replace(' ', '').toLowerCase();
		
		if (cmd.includes('start') || cmd.includes('avvia')) {
			tg.sendMessage({
				key: 'start',
				type: 'sendMessage',
				chat: this.chat['id'],
				data: {
					name: this.chat['first_name']
				}
			});
		}
		else if (cmd.includes('aiuto') || cmd.includes('help')) {
			tg.sendMessage({
				key: 'help',
				type: 'sendMessage',
				chat: this.chat['id']
			});
		}
		else if (cmd.includes('aulelibere')) {
			api.getFreeRooms((err, rooms) => {
				if (err) {
					tg.sendMessage({
						key: 'error',
						type: 'sendMessage',
						chat: this.chat['id']
					});

					return;
				}

				if (!rooms['length']) {
					tg.sendMessage({
						key: 'no_rooms',
						type: 'sendMessage',
						chat: this.chat['id']
					});

					return;
				}

				tg.sendMessage({
					key: 'free_rooms',
					type: 'sendMessage',
					chat: this.chat['id'],
					data: {
						rooms: rooms
					}
				});
			});
		}
		else if (cmd.includes('aule')) {
			api.getRooms((err, rooms) => {
				if (err) {
					tg.sendMessage({
						key: 'error',
						type: 'sendMessage',
						chat: this.chat['id']
					});

					return;
				}

				if (!rooms['length']) {
					tg.sendMessage({
						key: 'no_rooms',
						type: 'sendMessage',
						chat: this.chat['id']
					});

					return;
				}

				tg.sendMessage({
					key: 'rooms',
					type: 'sendMessage',
					chat: this.chat['id'],
					data: {
						rooms: rooms
					}
				});
			});
		}
		else {
			tg.sendMessage({
				key: 'dunno',
				type: 'sendMessage',
				chat: this.chat['id']
			});
		}
	}
}

module.exports = TelegramProcessor;
