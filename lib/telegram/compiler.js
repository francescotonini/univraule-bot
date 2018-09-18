const Handlebars = require('handlebars');
const emoji      = require('node-emoji');
const strings    = require('./strings.js');
const helper     = require('../helper.js');

Handlebars.registerHelper('unixToPrettyTime', helper.unixToPrettyTime);
Handlebars.registerHelper('isFreeToEmoji', helper.isFreeToEmoji);

function compile(key, data) {
	let template = Handlebars.compile(strings.get(key), { noEscape: true });
	let compiled = template(data || { });
	return emoji.emojify(compiled);
}

module.exports = compile;
