const request  = require('request');
const config   = require('../config');
const compiler = require('./compiler.js');
const logger   = require('bole')('tg');
const TOKEN = config('telegram').token;

if (!TOKEN) {
	throw new Error('Missing token');
}

const BASE_URL = 'https://api.telegram.org/bot' + TOKEN;

const ENDPOINTS = {
	sendMessage: BASE_URL + '/sendMessage',
	sendPhoto: BASE_URL + '/sendPhoto',
	editMessage: BASE_URL + '/editMessageText',
	answerCallbackQuery: BASE_URL + '/answerCallbackQuery',
	sendChatAction: BASE_URL + '/sendChatAction',
	getFile: BASE_URL + '/getFile'
};

config['baseFileUrl'] = 'https://api.telegram.org/file/bot' + TOKEN;

class TelegramClient {
	constructor() {
		
	}

	/**
	 * Send a message
	 */
	sendMessage(options, cb) {
		let chatId = options['chat'];
		let text = options['text'];
		let keyboard = options['keyboard'];
		let inline = options['inline'];
		let smallKeyboard = options['smallKeyboard'];
		
		if (!text) {
			text = compiler(options['key'], options['data']);
		}
		
		let body = {
			chat_id: chatId,
			text: text,
			disable_web_page_preview: true,
			parse_mode: 'Markdown'
		};
		
		let req = {
			method: 'POST',
			body: body,
			json: true,
			url: ENDPOINTS['sendMessage']
		};
		
		request(req, (err, res, resBody) => {
			// Network error
			if (err) {				
				logger.error('Network error', err);
			}
			// Response code is not OK
			else if (res.statusCode != 200) {
				logger.error('Response error: ', res.statusCode);
			}
			// Response content not ok and for some reason statusCode is 200 OK
			else if (body['ok'] === false) {
				logger.error('Response error');
			}

			cb && cb();
		});
	}
}

module.exports = TelegramClient;
