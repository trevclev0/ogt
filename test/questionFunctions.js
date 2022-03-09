var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var logger = require('../logger.js');
var config = require('../config.js');
var port = config.port;

var url = 'http://localhost:' + port;

module.exports = {
	
	"getQuestionList" : function(testCase, callback) {
		var questionPostData = {
			"question_during_class" : "0"
		};

		request(url)
		.post('/api/question/getQuestionList')
		.send(questionPostData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var questionList = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getQuestionList: " + error);
				return callback(error, questionList);
			}

			res.body.should.have.property("questionList");

			for(id in res.body.questionList) {
				res.body.questionList[id].should.have.property("question_text");
				res.body.questionList[id].should.have.property("question_type");
				if(res.body.questionList[id].question_type == "multipleChoice") {
					res.body.questionList[id].should.have.property("potential_answers");
				}
			}

			questionList = res.body.questionList;

			callback(error, questionList);
		}); 
	},

	"getAssignedSurveyQuestionList" : function(testCase, callback) {
		request(url)
		.post('/api/question/getAssignedSurveyQuestionList')
		.send()
		.expect(200)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var assignedSurveyQuestionList = {};
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getAssignedSurveyQuestionList: " + err);
				return callback(error, assignedSurveyQuestionList);
			}

			res.body.should.have.property("assignedSurveyQuestionList");
			assignedSurveyQuestionList = res.body.assignedSurveyQuestionList;

			callback(error, assignedSurveyQuestionList);
		});
	},

	"getQuestionInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/getQuestionInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";
			var questionInfo = [];

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getQuestionInfo: " + error);
				return callback(error, questionInfo);
			}

			res.body.should.have.property("questionInfo");
			questionInfo = res.body.questionInfo;

			callback(error, questionInfo);
		});
	},

	"createQuestion" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/createQuestion')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if (err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function createQuestion: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");
			callback(error);
		});
	},

	"updateQuestionInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/updateQuestionInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateQuestionInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"createPotentialAnswers" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/createPotentialAnswers')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function createPotentialAnswers: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");
			callback(error);
		});
	},

	"updatePotentialAnswerInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/updatePotentialAnswerInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updatePotentialAnswerInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"createAndAssignAnswers" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/createAndAssignAnswers')
		.send(postData)
		.expect(expect) 
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function createAndAssignAnswers: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");
			res.body.error.should.equal("");
			callback(error);
		});
	},

	"getAssignedAnswersList" : function(testCase, callback) {
		request(url)
		.post('/api/question/getAssignedAnswersList')
		.send()
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var assignedAnswersList = [];

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getAssignedAnswersList: " + error);
				return callback(error, assignedAnswersList);
			}

			res.body.should.have.property("assignedAnswersList");
			assignedAnswersList = res.body.assignedAnswersList;

			callback(error, assignedAnswersList);
		});
	},

	"getPotentialAnswerList" : function(testCase, callback) {
		request(url)
		.post('/api/question/getPotentialAnswerList')
		.send()
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(200)
		.end(function(err, res) {
			var error = "";
			var potentialAnswerList = [];

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getPotentialAnswerList: " + error);
				return callback(error, potentialAnswerList);
			}

			res.body.should.have.property("potentialAnswerList");
			potentialAnswerList = res.body.potentialAnswerList;

			callback(error, potentialAnswerList);
		});
	},

	"assignAnswersToQuestion" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/assignAnswersToQuestion')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function assignAnswersToQuestion: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"assignQuestionsToSurvey" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/assignQuestionsToSurvey')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function assignQuestionsToSurvey: " + error);
				return callback(error);
			}

			callback(error);
		});
	},

	"unassignAnswersFromQuestion" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/unassignAnswersFromQuestion')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function unassignAnswersFromQuestion: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"answerClassQuestion" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/answerClassQuestion')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function answerClassQuestion: " + err);
				return callback(error);
			}

			if(expect == 500) {
				res.body.should.have.property("error");
			}

			callback(error);
		});
	},

	"deactivateQuestion" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/deactivateQuestion')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateQuestion: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			if(expect == 500) {
				res.body.error.should.not.be.empty;
			} else {
				res.body.error.should.be.empty;
			}

			callback(error);
		});
	},

	"reactivateQuestion" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/reactivateQuestion')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateQuestion: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			if(expect == 500) {
				res.body.error.should.not.be.empty;
			} else {
				res.body.error.should.be.empty;
			}

			callback(error);
		});
	},

	"deactivatePotentialAnswers" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/deactivatePotentialAnswers')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivatePotentialAnswers: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			if(expect == 500) {
				res.body.error.should.not.be.empty;
			} else {
				res.body.error.should.be.empty;
			}

			callback(error);
		});
	},

	"reactivatePotentialAnswers" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/question/reactivatePotentialAnswers')
		.send(postData)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivatePotentialAnswers: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			if(expect == 500) {
				res.body.error.should.not.be.empty;
			} else {
				res.body.error.should.be.empty;
			}

			callback(error);
		});
	},

	"questionExists" : function(question_text, question_type, questionList) {
		var questionExists = false;
		var retQuestion = [];

		for(question in questionList) {
			if(	questionList[question].question_text == question_text && 
				questionList[question].question_type == question_type ) {

				questionExists = true;
				retQuestion = questionList[question];
				break;
			}
		}

		return {"questionExists" : questionExists, "questionInfo" : retQuestion};
	},

	"objectExists" : function(searchFields, searchList) {
		var exists = false;
		var retInfo = {};

		for(entry in searchList) {

			var middleExists = false;
			for(field in searchFields) {
				if(searchList[entry][field] == searchFields[field]) {
					middleExists = true;
				} else {
					middleExists = false;
					break;
				}
			}

			exists = middleExists;
			if(exists) {
				retInfo = searchList[entry];
				break;
			}
		}

		return {"exists" : exists, "info" : retInfo};
	}

}
