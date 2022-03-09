var winston = require('winston');

var customLogLevels = {
	levels : {
		info : 0,
		warn : 1,
		debug : 2,
		error : 3,
		
	},

	colors : {
		info : "cyan",
		warn : "yellow",
		debug : "magenta",
		error : "red"
	}
}

// "level" specifies the lowest level of logging that will be logged.
// e.g. {"level" : "warn"} will NOT log info, but WILL log warn, debug, and error
var logger = new (winston.Logger)({
	transports : [ 
		new (winston.transports.Console)({
			"colorize" : true,
			"level" : "info",
			"timestamp" : true
		}),
		new (winston.transports.File)({
			"filename" : "./serverLog.log",
			"level" : "info",
			"timestamp" : true
		})
	],
	levels : customLogLevels.levels,
	colors : customLogLevels.colors,
	exitOnError : false
});

module.exports = logger;