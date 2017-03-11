class Processor {
	constructor(message) {
		this.message = message;
	}

	process(cb) {
		cb && cb(null, this.message);
	}
}

module.exports.Processor = Processor;
