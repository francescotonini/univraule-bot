// Converts unix timpestamp in hh:mm
const moment = require('moment-timezone');

module.exports.unixToPrettyTime = (unix) => {
	// unix is in seconds, set to milliseconds
	let date = moment.tz(unix, 'x', 'Europe/Rome');

	return date.format('H:m');
};

// Converts a boolean to emoji
module.exports.isFreeToEmoji = (isFree) => {
	return isFree ? ':white_check_mark:' : ':no_entry:';
};
