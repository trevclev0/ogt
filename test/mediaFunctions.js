var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var logger = require('../logger.js');
var config = require('../config.js');
var port = config.port;

var url = 'http://localhost:' + port;

module.exports = {

	"getMediaList" : function(testCase, callback) {
		request(url)
		.post('/api/media/getMediaList')
		.send()
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var mediaList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getMediaList: " + error);
				return callback(error, mediaList);
			}

			res.body.should.have.property("mediaList");
			mediaList = res.body.mediaList;

			callback(error, mediaList);
		});
	},

	"getAssignedMediaList" : function(testCase, callback) {
		request(url)
		.post('/api/media/getAssignedMediaList')
		.send()
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var assignedMediaList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getAssignedMediaList: " + error);
				return callback(error, assignedMediaList);
			}

			res.body.should.have.property("assignedMediaList");
			assignedMediaList = res.body.assignedMediaList;

			callback(error, assignedMediaList);
		});
	},

	"getMediaInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/media/getMediaInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";
			var mediaInfo = [];

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getMediaInfo: " + error);
				return callback(error, mediaInfo);
			}

			res.body.should.have.property("mediaInfo");
			mediaInfo = res.body.mediaInfo;

			callback(error, mediaInfo);
		});	
	},

	"addMedia" : function(testCase, expect, filename, callback) {
		request(url)
		.post('/api/media/addMedia')
		.attach('presentation', filename)
		.expect(expect)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addMedia: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"deactivateMedia" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/media/deactivateMedia')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateMedia: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"reactivateMedia" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/media/reactivateMedia')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateMedia: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"updateMediaInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/media/updateMediaInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateMediaInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"assignMediaToSession" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/media/assignMediaToSession')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function assignMediaToSession: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"unassignMediaFromSession" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/media/unassignMediaFromSession')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function unassignMediaFromSession: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"mediaExists" : function(media_name, mediaList) {
		var mediaExists = false;
		var retMedia = [];

		for(media in mediaList) {
			if(mediaList[media].media_name == media_name) {
				mediaExists = true;
				retMedia = mediaList[media];
				break;
			}
		}

		return {"mediaExists" : mediaExists, "mediaInfo" : retMedia};
	}
	
}
