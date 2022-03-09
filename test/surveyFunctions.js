var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var logger = require('../logger.js');
var config = require('../config.js');
var port = config.port;

var url = 'http://localhost:' + port;

module.exports = {

	"getSurveyInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/getSurveyInfo')
		.send(postData)
		.expect(expect)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var error = "";
			var surveyExists = false;
			var surveyInfo = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getSurveyInfo: " + error);
				return callback(error, surveyExists, surveyInfo);
			}

			res.body.should.have.property("error");

			if(res.body.error == "") {
				surveyExists = true;
				surveyInfo = res.body.surveyInfo;
			}

			callback(error, surveyExists, surveyInfo);
		});
	},

	"getSurveyList" : function(testCase, callback) {
		request(url)
		.post('/api/survey/getSurveyList')
		.send()
		.expect(200)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var surveyList = {};
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getSurveyList: " + err);
				return callback(error, surveyList);
			}

			res.body.should.have.property("surveyList");
			surveyList = res.body.surveyList;

			callback(error, surveyList);
		});
	},

	"getClassSurveyList" : function(testCase, callback) {
		request(url)
		.post('/api/survey/getClassSurveyList')
		.send()
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var classSurveyList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getClassSurveyList: " + error);
				return callback(error, classSurveyList);
			}

			res.body.should.have.property("classSurveyList");
			classSurveyList = res.body.classSurveyList;

			callback(error, classSurveyList);
		});
	},

	"addSurvey" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/addSurvey')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addSurvey: " + error);
				return callback(error);
			}

			callback(error);
		});
	},

	"reactivateSurvey" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/reactivateSurvey')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateSurvey: " + error);
				return callback(error);
			}

			callback(error);
		});
	},

	"deactivateSurvey" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/deactivateSurvey')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateSurvey: " + error);
				return callback(error);
			}

			callback(error);
		});
	},

	"updateSurveyInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/updateSurveyInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateSurveyInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"assignSurveyToClass" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/assignSurveyToClass')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function assignSurveyToClass: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"unassignSurveyFromClass" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/survey/unassignSurveyFromClass')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function unassignSurveyFromClass: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"classSurveyAssigned" : function(class_id, survey_id, classSurveyList) {
		var classSurveyAssigned = false;

		for(classSurvey in classSurveyList) {
			if(	classSurveyList[classSurvey].class_id == class_id && 
				classSurveyList[classSurvey].survey_id == survey_id) {

				classSurveyAssigned = true;
				break;
			}
		}

		return classSurveyAssigned;
	},

	"surveyExists" : function(survey_name, surveyList) {
		var surveyExists = false;
		var retSurvey = [];

		for(survey in surveyList) {
			if(surveyList[survey].survey_name == survey_name) {
				surveyExists = true;
				retSurvey = surveyList[survey];
				break;
			}
		}

		return {"surveyExists" : surveyExists, "surveyInfo" : retSurvey};
	}
	
}
