const request  = require('request');
const async    = require('async');
const config   = require('../config');
const logger   = require('bole')('api');

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

let getFirstEmptySpace = (events) => {
	for (let i = 0; i < events['length'] - 1; i++) {
		let thisEvent = events[i];
		let nextEvent = events[i + 1];

		let endTimestampThisEvent = new Date(thisEvent['endTimestamp'] * 1000);
		let startTimestampNextEvent = new Date(nextEvent['startTimestamp'] * 1000);

		if (endTimestampThisEvent.getHours() != startTimestampNextEvent.getHours() ||
			endTimestampThisEvent.getMinutes() != startTimestampNextEvent.getMinutes()) {

			return {
				from: thisEvent['endTimestamp'],
				until: nextEvent['startTimestamp']
			};
		}
	}

	return;
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

			// Flatten array and sort alphabetically
			let rooms = [].concat.apply([], arrayOfArrayOfRooms)
				.sort((x, y) => x['name'].localeCompare(y['name']));

			
			// Find free rooms
			let roomsOutput = [];
			rooms.forEach((room) => {
				let now = new Date();
				if (now.getDay() == 0) {
					// Today is sunday
					return;
				}

				if (now.getHours() == 7 && now.getMinutes() < 30) {
					// Uni is closed
					return;
				}

				if (now.getHours() == 19 && now.getMinutes() > 30) {
					// Uni is closed
					return;
				}

				let currentEvent = room['events'].find(x => x['startTimestamp'] * 1000 <= now.getTime() && now.getTime() <= x['endTimestamp'] * 1000);
				let nextEvent = room['events'].find(x => x['startTimestamp'] * 1000 >= now.getTime());

				if (!currentEvent && nextEvent) {
					roomsOutput.push({
						name: room['name'],
						isFree: true,
						until: nextEvent['startTimestamp']  * 1000
					});
				}
				else if (!currentEvent && !nextEvent) {
					let closingTime = new Date();
					closingTime.setHours(19);
					closingTime.setMinutes(30);

					roomsOutput.push({
						name: room['name'],
						isFree: true,
						until: closingTime.getTime()
					});
				}
				else if (currentEvent) {
					let firstEmptySpace = getFirstEmptySpace(room['events']);
					if (!firstEmptySpace) {
						return;
					}

					roomsOutput.push({
						name: room['name'],
						isFree: false,
						until: firstEmptySpace['until'] * 1000
					});
				}
			});

			cb(null, roomsOutput);
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

			// Flatten array and sort alphabetically
			let rooms = [].concat.apply([], arrayOfArrayOfRooms)
				.sort((x, y) => x['name'].localeCompare(y['name']));
			
			// Find free rooms
			let freeRooms = [];
			rooms.forEach((room) => {
				let now = new Date();
				if (now.getDay() == 0) {
					// Today is sunday
					return;
				}

				if (now.getHours() == 7 && now.getMinutes() < 30) {
					// Uni is closed
					return;
				}

				if (now.getHours() == 19 && now.getMinutes() > 30) {
					// Uni is closed
					return;
				}

				let currentEvent = room['events'].find(x => x['startTimestamp'] * 1000 <= now.getTime() && now.getTime() <= x['endTimestamp'] * 1000);
				let nextEvent = room['events'].find(x => x['startTimestamp'] * 1000 >= now.getTime());

				if (!currentEvent && nextEvent) {
					freeRooms.push({
						name: room['name'],
						until: nextEvent['startTimestamp']  * 1000
					});
				}
				else if (!currentEvent && !nextEvent) {
					let closingTime = new Date();
					closingTime.setHours(19);
					closingTime.setMinutes(30);

					freeRooms.push({
						name: room['name'],
						until: closingTime.getTime()
					});
				}
			});

			cb(null, freeRooms);
		});
	}
};
