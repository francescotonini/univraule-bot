const Handlebars = require('handlebars');
const Wit     = require('node-wit').Wit;
const config  = require('./../config');
const logger  = require('./../logger.js');
const strings = require('./strings.json');

Handlebars.registerHelper('humanHour', (dateString) => {
	let date = new Date(dateString);
	
	return `${date.getHours()}:${date.getMinutes()}`;
});

class Processor {
	constructor(message) {
		this.message = message;
		this.client = new Wit({ accessToken: config(['wit', 'token']) });
	}

	process(cb) {
		this.client.message(this.message, { })
		.then((data) => {
			console.log(data);

			let entities = data['entities'];
			let intent = this._getIntent(entities);
			if (!intent) {
				cb && cb(null, strings['no_intent']);
				return;
			}

			this[`_${intent}`](entities, cb);
		})
		.catch((err) => {
			logger.error(err);

			cb && cb(null, strings['unknown_error']);
		});
	}

	_getBestResultByConfidence(data) {
		if (!data) {
			return null;
		}

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
		let rooms = global.rooms;
		if (!rooms['length']) {
			cb && cb(null, strings['unknown_error']);
		}

		let status = (this._getBestResultByConfidence(data['status']) || { value: 'libera' })['value'].trim();
		let room = (this._getBestResultByConfidence(data['room']) || { value: 'nope' })['value'].trim();
		let date = new Date((this._getBestResultByConfidence(data['date']) || { value: new Date().getTime() })['value']);

		logger.debug(`_getBooleanRoomStatus with status=${status} & date=${date} & room=${room}`);

		// Tiny override: if room is "Tessari", change the value to "Gino Tessari"
		if (room.toLowerCase() == 'tessari') {
			room = 'gino tessari';
		}

		let roomFromArray = rooms.find(x => x['name'].toLowerCase() == room.toLowerCase());
		if (!roomFromArray) {
			cb && cb(null, strings['room_not_found']);
			return;
		}

		// Room is now an object (was string before)
		room = roomFromArray;

		// Status is now a boolean (was string before)
		status = roomFromArray[(status == 'libera' ? 'freeTime' : 'busyTime')].find(x => new Date(x['start']).getTime() >= date.getTime() && new Date(x['end']).getTime() <= date.getTime());

		// Magic here, don't judge me pls :(
		let template = Handlebars.compile(strings[status == 'libera' ? 'room_free' : 'room_busy']);
		if (!status) {
			status = roomFromArray[(status == 'libera' ? 'busyTime' : 'freeTime')].find(x => new Date(x['start']).getTime() >= date.getTime() && new Date(x['end']).getTime() <= date.getTime());
			template = Handlebars.compile(strings[status == 'libera' ? 'room_free' : 'room_busy']);
		
			if (!status) {
				template = Handlebars.compile(strings['room_closed']);
			}
		}

		cb && cb(null, template({
			room: room['name'],
			end: !status ? null : status['end']
		}));
	}

	_getRoomStatus(data, cb) {
		let rooms = global.rooms;
		if (!rooms['length']) {
			cb && cb(null, strings['unknown_error']);
		}

		let room = (this._getBestResultByConfidence(data['room']) || { value: 'nope' })['value'].trim();
		let status = (this._getBestResultByConfidence(data['status']) || { value: 'libera' })['value'].trim();

		logger.debug(`_getRoomStatus with status=${status} & room=${room}`);

		// Tiny override: if room is "Tessari", change the value to "Gino Tessari"
		if (room.toLowerCase() == 'tessari') {
			room = 'gino tessari';
		}

		let roomFromArray = rooms.find(x => x['name'].toLowerCase() == room.toLowerCase());
		if (!roomFromArray) {
			cb && cb(null, strings['room_not_found']);
			return;
		}

		let template = Handlebars.compile(strings['room_list']);
		let list = roomFromArray[(status == 'libera' ? 'freeTime' : 'busyTime')];
		if (list['length'] == 0) {
			template = Handlebars.compile(strings[`room_always_${status == 'libera' ? 'busy' : 'free'}`]);
		}

		cb && cb(null, template({
			name: roomFromArray['name'],
			status: status == 'libera' ? 'libere' : 'occupate',
			list: list
		}));
	}

	_getRoomsStatus(data, cb) {
		let rooms = global.rooms;
		if (!rooms['length']) {
			cb && cb(null, strings['unknown_error']);
		}

		let status = (this._getBestResultByConfidence(data['status']) || { value: 'libera' })['value'].trim();
		let date = new Date((this._getBestResultByConfidence(data['date']) || { value: new Date().getTime() })['value']);

		logger.debug(`_getRoomsStatus with status=${status} & date=${date}`);

		// Normalize input
		if (status == 'libere') {
			status = 'libera';
		}

		rooms = rooms.filter(x => !!x[(status == 'libera' ? 'freeTime' : 'busyTime')].find(y => new Date(y['start']).getTime() >= date.getTime() && new Date(y['end']).getTime() <= date.getTime()));
		rooms.forEach((room) => {
			room['end'] = room[(status == 'libera' ? 'freeTime' : 'busyTime')].find(y => new Date(y['start']).getTime() >= date.getTime() && new Date(y['end']).getTime() <= date.getTime())['end'];
		});

		let template = Handlebars.compile(strings['rooms_list']);
		if (rooms['length'] == 0) {
			rooms = rooms = rooms.filter(x => !!x[(status == 'libera' ? 'busyTime' : 'freeTime')].find(y => new Date(y['start']).getTime() >= date.getTime() && new Date(y['end']).getTime() <= date.getTime()));
			template = Handlebars.compile(strings[`all_rooms_${status == 'libera' ? 'busy' : 'free'}`]);

			if (rooms['length'] == 0) {
				template = Handlebars.compile(strings['all_rooms_closed']);
			}
		}
		
		cb && cb(null, template({
			rooms: rooms,
			status: status == 'libera' ? 'libere' : 'occupate'
		}));
	}

	_getHelp(data, cb) {
		let isStart = !!this._getBestResultByConfidence(data['start']);
		if (isStart) {
			cb && cb(null, strings['start'] + '\n' + strings['help']);
			return;
		}

		cb && cb(null, strings['start']);
	}
}

module.exports.Processor = Processor;
