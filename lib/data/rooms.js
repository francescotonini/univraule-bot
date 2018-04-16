let getFirstEmptySpace = (events) => {
	events = events.filter(x => x['endTimestamp'] > Date.now() / 1000);

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

	let lastEvent = events[events['length'] - 1];
	let timeLastEvent = new Date(lastEvent['endTimestamp'] * 1000);
	let closingTime = new Date();
	closingTime.setHours(19);
	closingTime.setMinutes(30);
	if (timeLastEvent.getHours() != closingTime.getHours() ||
		timeLastEvent.getMinutes() != closingTime.getMinutes()) {

		return {
			from: lastEvent['endTimestamp'],
			until: closingTime.getTime() / 1000
		};
	}

	return;
};


module.exports = {
	getRooms: (rooms) => {
		// Find free rooms
		let roomsOutput = [];
		rooms.forEach((room) => {
			let now = new Date();
			if (now.getDay() == 0) {
				// Today is sunday
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
					let closingTime = new Date();
					closingTime.setHours(19);
					closingTime.setMinutes(30);

					roomsOutput.push({
						name: room['name'],
						isFree: false,
						until: closingTime.getTime()
					});

					return;
				}

				roomsOutput.push({
					name: room['name'],
					isFree: false,
					until: firstEmptySpace['from'] * 1000
				});
			}
		});

		return roomsOutput;
	},
	getFreeRooms: (rooms) => {
		// Find free rooms
		let freeRooms = [];
		rooms.forEach((room) => {
			let now = new Date();
			if (now.getDay() == 0) {
				// Today is sunday
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

		return freeRooms;
	}
};