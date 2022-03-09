var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var logger = require('../logger.js');
var config = require('../config.js');
var port = config.port;

var url = 'http://localhost:' + port;

module.exports = {

	"getClassList" : function(testCase, callback) {
		request(url)
		.post('/api/class/getClassList')
		.send()
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var classList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getClassList: " + error);
				return callback(error, classList);
			}

			res.body.should.have.property("classList");
			classList = res.body.classList;

			for(klass in classList) {
				classList[klass].should.have.property("class_id");
				classList[klass].should.have.property("therapist_id");
				classList[klass].should.have.property("therapist_first_name");
				classList[klass].should.have.property("therapist_last_name");
				classList[klass].should.have.property("class_name");
				classList[klass].should.have.property("class_size");
				classList[klass].should.have.property("class_start_date");
				classList[klass].should.have.property("class_end_date");
				classList[klass].should.have.property("class_status");
				classList[klass].should.have.property("num_registrants");
			}

			callback(error, classList);
		});
	},

	"getClassInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/getClassInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";
			var classInfo = [];

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getClassInfo: " + error);
				return callback(error, classInfo);
			}

			res.body.should.have.property("classInfo");
			classInfo = res.body.classInfo;

			callback(error, classInfo);
		});	
	},

	"addClass" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/addClass')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addClass: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"deactivateClass" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/deactivateClass')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateClass: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"reactivateClass" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/reactivateClass')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateClass: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"updateClassInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/updateClassInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateClassInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"getRegistrationList" : function(testCase, postData, callback) {
		request(url)
		.post('/api/class/getRegistrationList')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var registrationList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getRegistrationList: " + error);
				return callback(error, registrationList);
			}

			res.body.should.have.property("registrationList");
			registrationList = res.body.registrationList;

			callback(error, registrationList);
		});
	},

	"register" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/register')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function register: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"unregister" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/unregister')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function unregister: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"getClassSessionList" : function(testCase, postData, callback) {
		request(url)
		.post('/api/class/getClassSessionList')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var classSessionList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getClassSessionList: " + error);
				return callback(error, classSessionList);
			}

			res.body.should.have.property("classSessionList");
			classSessionList = res.body.classSessionList;

			callback(error, classSessionList);
		});
	},

	"getClassSessionInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/getClassSessionInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";
			var classSessionInfo = [];

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getClassSessionInfo: " + error);
				return callback(error, classSessionInfo);
			}

			res.body.should.have.property("classSessionInfo");
			classSessionInfo = res.body.classSessionInfo;

			callback(error, classSessionInfo);
		});	
	},

	"addClassSession" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/addClassSession')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addClassSession: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});	
	},

	"deactivateClassSession" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/deactivateClassSession')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateClassSession: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});	
	},

	"reactivateClassSession" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/class/reactivateClassSession')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateClassSession: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});	
	},

	"classExists" : function(class_name, classList) {
		var classExists = false;
		var retClass = [];

		for(klass in classList) {
			if(classList[klass].class_name == class_name) {
				classExists = true;
				retClass = classList[klass];
				break;
			}
		}

		return {"classExists" : classExists, "classInfo" : retClass};
	},

	"classSessionExists" : function(class_session_name, classSessionList) {
		var classSessionExists = false;
		var retClassSession = [];

		for(class_session in classSessionList) {
			if(classSessionList[class_session].class_session_name == class_session_name) {
				classSessionExists = true;
				retClassSession = classSessionList[class_session];
				break;
			}
		}

		return {"classSessionExists" : classSessionExists, "classSessionInfo" : retClassSession};
	},

	"isRegistered" : function(class_id, user_id, registrationList) {
		var isRegistered = false;

		for(registration in registrationList) {
			if(	registrationList[registration].class_id == class_id && 
				registrationList[registration].user_id == user_id) {

				isRegistered = true;
				break;
			}
		}

		return isRegistered;
	},

	

	"getDatePlusDays" : function(days) {
		var today = new Date();
		var milliseconds = days * 24 * 60 * 60 * 1000; // Convert days into milliseconds

		today.setTime(today.getTime() + milliseconds);

		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd < 10) {
			dd = '0' + dd;
		} 

		if(mm < 10) {
			mm = '0' + mm;
		} 

		return yyyy + '-' + mm + '-' + dd;
	}
}