var fs = require('fs');
var mysql = require('mysql');
var logger = require('../logger.js');

// DB Connection
function createConnection() {
	var connection;
	var fileName = "./db/dbInfo.json";

	var dbInfo = fs.readFileSync(fileName);
	dbInfo = JSON.parse(dbInfo);

	connection = mysql.createConnection(dbInfo);
	connection.connect(function(dbConnectErr) {
		if(dbConnectErr) {
			logger.error("Unable to establish connection to database. " + dbConnectErr);
			process.exit(1);
		}
	});

	return connection;
}

module.exports.createConnection = createConnection;