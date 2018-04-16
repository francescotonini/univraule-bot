const config            = require('./config');
const TelegramServer    = require('./telegram').TelegramServer;
const TelegramProcessor = require('./telegram').TelegramProcessor;

// Create the HTTP server for handling tg messages
let serverPort = config('telegram').serverPort;
let server = new TelegramServer({ port: serverPort });

// Start the server
server.start();

// Process incoming message
server.on('update', (update) => {
	let pro = new TelegramProcessor(update);
	pro.process();
});
