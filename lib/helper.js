// Converts unix timpestamp in hh:mm
module.exports.unixToPrettyTime = (unix) => {
	// unix is in seconds, set to milliseconds
	let date = new Date(unix);

	let hour = date.getHours();
	let minutes = date.getMinutes();
	minutes = ('0' + minutes).slice(-2); // pad zero to the left
	
	return `${hour}:${minutes}`;
};

// Converts a boolean to emoji
module.exports.isFreeToEmoji = (isFree) => {
	return isFree ? ':white_check_mark:' : ':no_entry:';
};
