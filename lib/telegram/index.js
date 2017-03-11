const express      = require('express');
const bodyParser   = require('body-parser');
const request      = require('request');
const EventEmitter = require('events').EventEmitter;
const logger       = require('./../logger.js');

class Telegram extends EventEmitter {
	constructor(port, token) {
		super();

		this.port = port;
		this.token = token;
		this.baseUrl = `https://api.telegram.org/bot${this.token}`;
	}

	start() {
		this.server = express();
		this.server.use(bodyParser.json());

		this.server.post('/', this._handleIncomingMessage.bind(this));
		this.server.listen(this.port);
		
		logger.info(`Server listening on port ${this.port}`);
	}

	_handleIncomingMessage(req, res, next) {
		let body = req['body'];
		if (!body['message'] || !body['update_id']) {
			return res.sendStatus(400);
		}

		let payload = body['message'];
		if (payload['text']) {
			logger.debug(`Incoming message from ${payload['chat_id']}`);

			this.emit('message', payload);
		}

		res.json({ });
	}

	send(chatId, text, cb) {
		let body = {
			chat_id: chatId,
			text: text,
			disable_web_page_preview: true,
			parse_mode: 'Markdown'
		};

		let options = {
			url: `${this.baseUrl}/sendMessage`,
			method: 'POST',
			json: body
		};

		request(options, (err, status, body) => {
			if (err) {
				logger.error(err);
				cb && cb(err);
			}
			else if (status['statusCode'] != 200) {
				cb && cb(new Error(`Unable to send message. Response code is ${status['statusCode']} --> ${JSON.stringify(body) || 'no body on response'}`));
			}
		});
	}
}

module.exports.Telegram = Telegram;
