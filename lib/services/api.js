const request      = require('request');
const async        = require('async');
const config       = require('../config');
const logger       = require('bole')('api');

const BASE_URL  = config('api')['baseUrl'];
const GET_ROOMS = BASE_URL + '/offices/{officeId}/rooms';

let doRequest = (options, cb) => {
	request(options, (err, status, body) => {
		if (err) {
			logger.error('Network error', err);
			cb && cb(err);

			return;
		}

		if (status['statusCode'] != 200) {
			logger.error('Response error', body);
			cb && cb(new Error('Response error'));

			return;
		}

		cb(null, body);
	});
};

module.exports = {
	getRooms: (cb) => {
		let officeIds = config('api')['officeIds'];
		async.map(officeIds, (officeId, cb) => {
			let options = {
				url: GET_ROOMS.replace('{officeId}', officeId),
				method: 'GET',
				json: true
			};

			doRequest(options, cb);
		}, (err, arrayOfArrayOfRooms) => {
			if (err) {
				cb && cb(err);
				return;
			}

			// Flatten array, sort alphabetically and exclude rooms with name "ufficio"
			let rooms = [].concat.apply([], arrayOfArrayOfRooms)
				.sort((x, y) => x['name'].localeCompare(y['name']))
				.filter(x => x['name'].toLowerCase().indexOf('ufficio') == -1);

			cb(null, rooms);
		});
	},
	getFreeRooms: (cb) => {
		let officeIds = config('api')['officeIds'];
		async.map(officeIds, (officeId, cb) => {
			let options = {
				url: GET_ROOMS.replace('{officeId}', officeId),
				method: 'GET',
				json: true
			};

			doRequest(options, cb);
		}, (err, arrayOfArrayOfRooms) => {
			if (err) {
				cb && cb(err);
				return;
			}

			// Flatten array, sort alphabetically and exclude rooms with name "ufficio"
			let rooms = [].concat.apply([], arrayOfArrayOfRooms)
				.sort((x, y) => x['name'].localeCompare(y['name']))
				.filter(x => x['name'].toLowerCase().indexOf('ufficio') == -1);
			
			cb(null, rooms.filter(x => x['isFree']));
		});
	}
};
