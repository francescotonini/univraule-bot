const Client = require('ssh2').Client;
const net    = require('net');
const config = require('./config.json');

var conn = new Client();

conn.on('ready', function() {
	console.log('[WH] connection established');
	
	conn.forwardIn('', config['ports']['in'], function(err) {
		if (err) {
			throw err;
		}
		
		console.log(`[WH] Server is listening to connections on port ${config['ports']['in']}`);
		console.log(`[WH] HTTP requests are being forwaded to receiver:${config['ports']['out']}`);
	});
});

conn.on('tcp connection', function(info, accept, reject) {
	console.log(`[WH] Incoming request from IP ${info.srcIP}, forwarding to localhost:${config['ports']['out']}`);
	
	var stream = accept();
	
	// Create connection to the localhost endpoint
	var local = net.createConnection(config['ports']['out'], 'localhost');
	
	// Pipe incoming request to localhost
	stream.pipe(local);
	
	// Pipe responses to the incoming stream
	local.pipe(stream);
});

conn.connect({
	host: config['host'],
	port: config['port'],
	username: config['username'],
	privateKey: require('fs').readFileSync(config['privateKeyPath'])
});