var mysql = require('mysql');
var fs = require('fs');
var logger = require('../logger.js');
var connection = require('./dbConnection.js').createConnection();
var helperFunctions = require('./helperFunctions.js');

// Make the functions available in another file as a require
module.exports = {

	"getSurveyList" : function(callback) {
		var functionName = 'getSurveyList';
		var error = "";

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
			}

			callback(error, surveyList);
		});
	},

	"getClassSurveyList" : function(callback) {
		var functionName = "getClassSurveyList";
		var error = "";
		var classSurveyList = [];

		helperFunctions.getClassSurveyList(function(err, classSurveyList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSurveyList. " + error);
				return callback(error, classSurveyList);
			}

			callback(error, classSurveyList);
		});
	},

	"getSurveyInfo" : function(survey_name, callback) {
		var functionName = 'getSurveyInfo';
		var error = "";
		var surveyInfo = {};

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
				return callback(error, surveyInfo);
			} 

			if(helperFunctions.objectExists({"survey_name" : survey_name}, surveyList)) {
				for(survey in surveyList) {
					if(surveyList[survey].survey_name == survey_name) {
						surveyInfo = surveyList[survey];
						break;
					}
				}

				// Get the list of questions attached to the survey
				var queryString = 	"SELECT s.survey_id, s.survey_name, s.survey_status" + 
									", q.question_id, q.question_text, q.question_type, q.question_status" + 
									", mcpa.potential_answer_id, mcpa.potential_answer_response" + 
									" FROM `surveys` s" + 
									" JOIN survey_questions_list sq ON (s.survey_id = sq.survey_id)" + 
									" JOIN questions q ON (sq.question_id = q.question_id)" + 
									" LEFT JOIN multiple_choice_question_answers_list mcqa ON (q.question_id = mcqa.question_id)" + 
									" LEFT JOIN multiple_choice_potential_answers mcpa ON (mcqa.potential_answer_id = mcpa.potential_answer_id)" +
									" WHERE s.survey_id = " + mysql.escape(surveyInfo.survey_id);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem getting survey question info. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					}

					if(result.length != 0) {
						var lastQuestionId = 0;
						var questionObj = {};
						var i = 0;
						surveyInfo.questions = [];

						for(row in result) {
							if(lastQuestionId != result[row].question_id) { // It's a new question
								if(i != 0) { // Push the last questionObj on, and reset it
									surveyInfo.questions.push(questionObj);
									questionObj = {};
								}

								questionObj.question_id = result[row].question_id;
								questionObj.question_text = result[row].question_text;
								questionObj.question_type = result[row].question_type;
								questionObj.question_status = result[row].question_status;

								if(result[row].question_type == "multipleChoice") { // If it's MC, set up array for potential answers
									questionObj.potential_answers = [];
								}
							}

							if(result[row].question_type == "multipleChoice") { // If it's MC, put the potential answer in the obj
								var potentialAnswerObj = {
									"potential_answer_id" : result[row].potential_answer_id,
									"potential_answer_response" : result[row].potential_answer_response
								}
								questionObj.potential_answers.push(potentialAnswerObj);
							}

							lastQuestionId = result[row].question_id; // Set the lastQuestionId to the current question_id
							i++;
						} // End for loop

						surveyInfo.questions.push(questionObj);
					} // End if result.length != 0

					callback(error, surveyInfo);
				});
			} else { // Survey doesn't exist
				error = "Error: Survey doesn't exist.";
				callback(error, surveyInfo);
			}
		});
	},

	"addSurvey" : function(survey_name, callback) {
		var functionName = "addSurvey";
		var error = "";

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
				return callback(err);
			} 

			if(!helperFunctions.objectExists({"survey_name" : survey_name}, surveyList)) {
				var queryString = "INSERT INTO surveys (survey_name) VALUES (" + mysql.escape(survey_name) + ")";

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem adding survey. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Created survey '" + survey_name + "'");
					}

					callback(error);
				});	
			} else { // Survey already exists
				error = "Error: Survey already exists.";
				callback(error);
			}
		});
	},

	"deactivateSurvey" : function(survey_name, callback) {
		var functionName = "deactivateSurvey";
		var error = "";

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
				return callback(error);
			}

			if(helperFunctions.objectExists({"survey_name" : survey_name}, surveyList)) {
				var queryString = "UPDATE surveys SET survey_status = 'Inactive' WHERE survey_name = " + mysql.escape(survey_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Error deactivating survey. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Survey '" + survey_name + "' deactivated.");
					}

					callback(error);
				});
			} else {
				error = "Error: Survey not found.";
				callback(error);
			}
		});
	},

	"reactivateSurvey" : function(survey_name, callback) {
		var functionName = "reactivateSurvey";
		var error = "";

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
				return callback(error);
			}

			if(helperFunctions.objectExists({"survey_name" : survey_name}, surveyList)) {
				var queryString = "UPDATE surveys SET survey_status = 'Active' WHERE survey_name = " + mysql.escape(survey_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Error reactivating survey. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Survey '" + survey_name + "' reactivated.");
					}

					callback(error);
				});
			} else {
				error = "Error: Survey not found.";
				callback(error);
			}
		});
	},

	"assignSurveyToClass" : function(class_id, survey_id, callback) {
		var functionName = "assignSurveyToClass";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_id" : class_id}, classList)) { // Class exists
				helperFunctions.getSurveyList(function(err, surveyList) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem getting surveyList. " + error);
						return callback(error);
					}

					if(helperFunctions.objectExists({"survey_id" : survey_id}, surveyList)) { // Survey exists
						helperFunctions.getClassSurveyList(function(error, classSurveyList) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem getting classSurveyList. " + error);
								return callback(error);
							}

							if(!helperFunctions.objectExists({"class_id" : class_id, "survey_id" : survey_id}, classSurveyList)) { // Survey not already assigned
								var queryString = 	"INSERT INTO class_survey_list (`class_id`, `survey_id`) VALUES" + 
													"( " + mysql.escape(class_id) + ", " + mysql.escape(survey_id) + ")";


								connection.query(queryString, function(err, result) {
									if(err) {
										error = err;
										logger.error("Function: '" + functionName + "'. Problem assigning survey to class. " + error);
										logger.error("Function: '" + functionName + "'. Query: " + queryString);
									} else {
										logger.info("Function: '" + functionName + "'. Survey: " + survey_id + " assigned for class " + class_id);
									}

									callback(error);
								});
							} else {
								error = "Error: Survey is already assigned for specified class";
								callback(error);
							}
						});
					} else {
						error = "Error: Survey doesn't exist";
						callback(error);
					}
				});
			} else {
				error = "Error: Class doesn't exist";
				callback(error);
			}
		});
	},

	"unassignSurveyFromClass" : function(class_id, survey_id, callback) {
		var functionName = "unassignSurveyFromClass";
		var error = "";

		helperFunctions.getClassSurveyList(function(err, classSurveyList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSurveyList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_id" : class_id, "survey_id" : survey_id}, classSurveyList)) { 
				var queryString = 	"DELETE FROM class_survey_list WHERE class_id = " + mysql.escape(class_id) + 
									" AND survey_id = " + mysql.escape(survey_id);


				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem unassigning survey from class. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Survey: " + survey_id + " unassigned from class " + class_id);
					}

					callback(error);
				});
			} else {
				error = "Error: Survey is not assigned for specified class";
				callback(error);
			}
		});
	},

	"updateSurveyInfo" : function (survey_id, surveyInfo, callback) {
		var functionName = "updateSurveyInfo";
		var error = "";

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
				return callback(error);
			} 

			if(helperFunctions.objectExists({"survey_id" : survey_id}, surveyList)) {
				// Make sure the one it's updating to isn't taken
				if(typeof surveyInfo.survey_name != 'undefined' && helperFunctions.objectExists({"survey_name" : surveyInfo.survey_name}, surveyList)) {
					error = "Error: New survey name already exists";
					return callback(error);
				}

				var queryString = "UPDATE surveys SET ";

				// Dynamically create the queryString
				var i = 0;
				for(fieldName in surveyInfo) {
					if(fieldName == "survey_id") {
						continue; // Invalid field for this function - skip it
					}

					if(i != 0) {
						queryString += ", ";
					}

					queryString += fieldName + " = " + mysql.escape(surveyInfo[fieldName]);
					i++;
				}

				queryString += " WHERE survey_id = " + mysql.escape(survey_id);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem updating survey info. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Updated survey info for survey_id: " + survey_id);
					}

					callback(error);
				});
			} else { // Survey doesn't exist
				error = "Error: Survey doesn't exist.";
				callback(error);
			}
		});	
	},

};
