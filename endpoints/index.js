/**
 * This module loads dynamically all endpoints modules located in the endpoitns/
 * directory.
 */
'use strict';
var fs = require('fs');
var path = require('path');

module.exports = function (app) {
	fs.readdirSync('./endpoints').forEach(function (file) {
		// Avoid to read this current file.
		if (file === path.basename(__filename)) { return; }

		// Load the endpoint file.
		require('./' + file)(app);
	});
};