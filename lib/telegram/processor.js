const Wit     = require('node-wit').Wit;
const config  = require('./../config'); 
const logger  = require('./../logger.js');
const request = require('request');

class Processor {
	constructor(message) {
		this.message = message;
		this.client = new Wit({ accessToken: config(['wit', 'token'])});
	}

	process(cb) {
		this.client.message(this.message, { })
		.then((data) => {
			console.log(data);

			let entities = data['entities'];
			let intent = this._getIntent(entities);
			if (!intent) {
				cb && cb(null, 'NO INTENT');
				return;
			}

			this[`_${intent}`](entities, cb);
		})
		.catch((err) => {
			logger.error(err);

			cb && cb(null, 'ERROR');
		});
	}

	_getBestResultByConfidence(data) {
		return data.sort((x, y) => x['confidence'] - y['confidence'])[0];
	}

	_getIntent(data) {
		if (!data['intent']) {
			return null;
		}

		let intent = this._getBestResultByConfidence(data['intent']);

		logger.debug(`Confidence is ${intent['confidence']}`);
		return intent['value'];
	}

	_getBooleanRoomStatus(data, cb) {
		// TODO:
		cb && cb(null, this.message);
	}

	_getRoomStatus(data, cb) {
		// TODO:
		cb && cb(null, this.message);
	}

	_getRoomsStatus(data, cb) {
		// TODO:
		cb && cb(null, this.message);
	}
}

module.exports.Processor = Processor;
