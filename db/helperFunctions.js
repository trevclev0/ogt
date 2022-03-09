// Helper functions for all of the DAOs

var mysql = require('mysql');
var fs = require('fs');
var logger = require('../logger.js');
var connection = require('./dbConnection.js').createConnection();


module.exports = {

	"getUserList" : function(callback) {
		var functionName = "getUserList";
		var error = "";
		var userList = [];

		var queryString = "SELECT user_id, user_first_name, user_last_name, user_email, user_profile_picture, user_type, user_bio, user_username, user_status FROM user_info";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Unable to get user list. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
			} else {
				if(result.length != 0) {
					for(user in result) {
						userList.push({
							"user_id" : result[user].user_id,
							"user_first_name" : result[user].user_first_name,
							"user_last_name" : result[user].user_last_name,
							"user_email" : result[user].user_email,
							"user_profile_picture" : result[user].user_profile_picture,
							"user_type" : result[user].user_type,
							"user_bio" : result[user].user_bio,
							"user_username" : result[user].user_username,
							"user_status" : result[user].user_status,
						});
					}
				}
			}

			callback(error, userList);
		});
	},

	"getAddressList" : function (user_id, callback) {
		var functionName = "getAddressList";
		var error = "";
		var addressList = [];

		var queryString = 	"SELECT user_addr_id, user_id, user_addr_street, user_addr_city" + 
							", user_addr_state, CONVERT(user_addr_zip, CHAR(10)) AS user_addr_zip" + 
							", CONVERT(user_addr_is_billing, DECIMAL(1)) AS user_addr_is_billing, user_addr_status" + 
							" FROM user_addrs WHERE user_id = " + mysql.escape(user_id);

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting user's address info. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, addressList);
			}

			if(result.length != 0) {
				for(address in result) {
					addressList.push({
						"user_addr_id" : result[address].user_addr_id,
						"user_id" : result[address].user_id,
						"user_addr_street" : result[address].user_addr_street,
						"user_addr_city" : result[address].user_addr_city,
						"user_addr_state" : result[address].user_addr_state,
						"user_addr_zip" : result[address].user_addr_zip,
						"user_addr_is_billing" : result[address].user_addr_is_billing,
						"user_addr_status" : result[address].user_addr_status
					});
				}
			}

			callback(error, addressList);
		});
	},

	"getBillingList" : function (user_id, callback) {
		var functionName = "getBillingList";
		var error = "";
		var billingList = [];

		var queryString = "SELECT billing_id, user_id, billing_cc" + 
							", DATE_FORMAT(billing_cc_exp, '%Y-%m-%d') AS billing_cc_exp, billing_cc_type, billing_status" + 
							" FROM user_billing WHERE user_id = " + mysql.escape(user_id);

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting user's billing info. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, billingList);
			}

			if(result.length != 0) {
				for(billing in result) {
					billingList.push({
						"billing_id" : result[billing].billing_id,
						"user_id" : result[billing].user_id,
						"billing_cc" : result[billing].billing_cc,
						"billing_cc_exp" : result[billing].billing_cc_exp,
						"billing_cc_type" : result[billing].billing_cc_type,
						"billing_status" : result[billing].billing_status
					});
				}
			}

			callback(error, billingList);
		});
	},

	"getSurveyList" : function (callback) {
		var functionName = "getSurveyList";
		var error = "";
		var surveyList = [];

		var queryString = "SELECT survey_id, survey_name, survey_status FROM surveys";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Unable to get survey list. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, surveyList);
			}

			if(result.length != 0) {
				for(survey in result) {
					surveyList.push({
						"survey_id" : result[survey].survey_id,
						"survey_name" : result[survey].survey_name,
						"survey_status" : result[survey].survey_status,
					});
				}
			}

			callback(error, surveyList);
		});
	},

	"getQuestionList" : function (question_during_class, callback) {
		var functionName = "getQuestionList";
		var questionList = [];
		var error = "";

		var queryString = 	"SELECT q.question_id AS question_id, q.question_text AS question_text" + 
							", q.question_type AS question_type, q.question_during_class AS question_during_class" + 
							", pa.potential_answer_id AS potential_answer_id, pa.potential_answer_response AS potential_answer_response" +
							" FROM questions q" + 
							" LEFT JOIN multiple_choice_question_answers_list al ON (q.question_id = al.question_id)" +
							" LEFT JOIN multiple_choice_potential_answers pa ON (al.potential_answer_id = pa.potential_answer_id)";

		if(question_during_class == 1) { // Grab only the in-class questions
			queryString += " AND question_during_class = 1";
		}

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Error getting question list. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				callback(error, questionList);
			}

			if(result.length != 0) {
				var lastQuestionId = 0;
				var questionObj = {};
				var i = 0;

				for(row in result) {
					if(lastQuestionId != result[row].question_id) { // It's a new question
						if(i != 0) { // Push the last questionObj on, and reset it
							questionList.push(questionObj);
							questionObj = {};
						}

						questionObj.question_id = result[row].question_id;
						questionObj.question_text = result[row].question_text;
						questionObj.question_type = result[row].question_type;
						questionObj.question_status = result[row].question_status;
						questionObj.question_during_class = result[row].question_during_class;

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

				questionList.push(questionObj);
			} // End if result.length != 0

			callback(error, questionList);
		});
	},

	"getAssignedAnswersList" : function (callback) {
		var functionName = "getAssignedAnswersList";
		var error = "";
		var assignedAnswersList = [];

		var queryString = 	"SELECT al.qa_id, al.question_id, q.question_text, al.potential_answer_id" + 
							", pa.potential_answer_response FROM multiple_choice_question_answers_list al" + 
							" JOIN multiple_choice_potential_answers pa ON (pa.potential_answer_id = al.potential_answer_id)" + 
							" JOIN questions q ON (q.question_id = al.question_id)";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting assignedAnswersList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, assignedAnswersList);
			}

			if(result.length != 0) {
				for(row in result) {
					assignedAnswersList.push({
						"qa_id" : result[row].qa_id,
						"question_id" : result[row].question_id,
						"queston_text" : result[row].question_text,
						"potential_answer_id" : result[row].potential_answer_id,
						"potential_answer_response" : result[row].potential_answer_response
					});
				}
			}

			callback(error, assignedAnswersList);
		});
	},

	"getAssignedSurveyQuestionList" : function (callback) {
		var functionName = "getAssignedSurveyQuestionList";
		var error = "";
		var assignedSurveyQuestionList = [];

		var queryString = "SELECT survey_id, question_id FROM survey_questions_list";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Unable to get assignedSurveyQuestionList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
			} 

			if(result.length != 0) {
				for(row in result) {
					assignedSurveyQuestionList.push({
						"survey_id" : result[row].survey_id,
						"question_id" : result[row].question_id
					});
				}
			}

			callback(error, assignedSurveyQuestionList);
		});
	},

	"getMediaList" : function (callback) {
		var functionName = "getMediaList";
		var error = "";
		var mediaList = [];

		var queryString = "SELECT media_id, media_name, media_path, media_length, media_status FROM class_media";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Unable to get media list. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
			} else {
				if(result.length != 0) {
					for(media in result) {
						mediaList.push({
							"media_id" : result[media].media_id,
							"media_name" : result[media].media_name,
							"media_path" : result[media].media_path,
							"media_length" : result[media].media_length,
							"media_status" : result[media].media_status,
						});
					}
				}
			}

			callback(error, mediaList);
		});
	},

	"getAssignedMediaList" : function (callback) {
		var functionName = "getAssignedMediaList";
		var error = "";
		var assignedMediaList = [];

		var queryString = 	"SELECT cml.class_media_id AS class_media_id, cml.class_session_id AS class_session_id," +
							" cml.media_id AS media_id, cm.media_name AS media_name, cs.class_session_name AS class_session_name" + 
							" FROM class_media_list cml" + 
							" JOIN class_media cm ON (cml.media_id = cm.media_id)" + 
							" JOIN class_sessions cs ON (cml.class_session_id = cs.class_session_id)";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Unable to get assigned media list. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, assignedMediaList);
			}

			if(result.length != 0) {
				for(media in result) {
					assignedMediaList.push({
						"class_media_id" : result[media].class_media_id,
						"class_session_id" : result[media].class_session_id,
						"media_id" : result[media].media_id,
						"media_name" : result[media].media_name,
						"class_session_name" : result[media].class_session_name,
					});
				}
			}

			callback(error, assignedMediaList);
		});
	},

	"getClassList" : function (callback) {
		var functionName = "getClassList";
		var error = "";
		var classList = [];

		var queryString = 	"SELECT c.class_id, c.therapist_id, u.user_first_name AS therapist_first_name, u.user_last_name AS therapist_last_name" + 
							", c.class_name, c.class_size, c.class_start_date, c.class_end_date, c.class_status, COALESCE(cr.num_registrants, 0) AS num_registrants" +
							" FROM classes c " + 
							" JOIN user_info u ON (c.therapist_id = u.user_id)" + 
							" LEFT JOIN (" + 
								"SELECT class_id, COUNT(user_id) AS num_registrants FROM class_registration GROUP BY(class_id)" + 
							") cr ON (c.class_id = cr.class_id)";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, classList);
			}

			if(result.length != 0) {
				for(klass in result) {
					classList.push({
						"class_id" : result[klass].class_id,
						"therapist_id" : result[klass].therapist_id,
						"therapist_first_name" : result[klass].therapist_first_name,
						"therapist_last_name" : result[klass].therapist_last_name,
						"class_name" : result[klass].class_name,
						"class_size" : result[klass].class_size,
						"class_start_date" : result[klass].class_start_date,
						"class_end_date" : result[klass].class_end_date,
						"class_status" : result[klass].class_status,
						"num_registrants" : result[klass].num_registrants
					});
				}
			}

			callback(error, classList);
		});
	},

	"getClassSessionList" : function (class_id, callback) {
		var functionName = "getClassSessionList";
		var error = "";
		var classSessionList = [];

		var queryString = "	SELECT class_session_id, class_id, class_session_name, class_session_date, class_session_time" + 
							", class_session_users_attended, class_session_status" + 
							" FROM class_sessions";

		if(class_id != 0) {
			queryString += " WHERE class_id = " + mysql.escape(class_id);
		}

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSessionList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, classSessionList);
			}

			if(result.length != 0) {
				for(classSession in result) {
					classSessionList.push({
						"class_session_id" : result[classSession].class_session_id,
						"class_id" : result[classSession].class_id,
						"class_session_name" : result[classSession].class_session_name,
						"class_session_date" : result[classSession].class_session_date,
						"class_session_time" : result[classSession].class_session_time,
						"class_session_users_attended" : result[classSession].class_session_users_attended,
						"class_session_status" : result[classSession].class_session_status
					});
				}
			}

			callback(error, classSessionList);
		});
	},

	"getRegistrationList" : function (class_id, user_id, callback) {
		var functionName = "getRegistrationList";
		var error = "";
		var registrationList = [];

		var queryString = "SELECT reg_id, class_id, user_id, reg_date FROM class_registration";

		if(class_id != 0 || user_id != 0) {
			queryString += " WHERE ";

			if(class_id != 0) {
				queryString += "class_id = " + mysql.escape(class_id);
			}

			if(class_id != 0 && user_id != 0) {
				queryString += " AND ";
			}

			if(user_id != 0) {
				queryString += "user_id = " + mysql.escape(user_id);	
			}
		}

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting registrationList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, registrationList);
			}

			if(result.length != 0) {
				for(registration in result) {
					registrationList.push({
						"reg_id" : result[registration].reg_id,
						"class_id" : result[registration].class_id,
						"user_id" : result[registration].user_id,
						"reg_date" : result[registration].reg_date,
					});
				}
			}

			callback(error, registrationList);
		});
	},

	"getClassSurveyList" : function (callback) {
		var functionName = "getClassSurveyList";
		var error = "";
		var classSurveyList = [];

		var queryString = "SELECT class_survey_id, class_id, survey_id FROM class_survey_list";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSurveyList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, classSurveyList);
			}

			if(result.length != 0) {
				for(classSurvey in result) {
					classSurveyList.push({
						"class_survey_id" : result[classSurvey].class_survey_id,
						"class_id" : result[classSurvey].class_id,
						"survey_id" : result[classSurvey].survey_id
					});
				}
			}

			callback(error, classSurveyList);
		});
	},

	"getPotentialAnswerList" : function (callback) {
		var functionName = "getPotentialAnswerList";
		var error = "";
		var potentialAnswerList = [];

		var queryString = 	"SELECT potential_answer_id, potential_answer_response, potential_answer_status" + 
							" FROM multiple_choice_potential_answers";

		connection.query(queryString, function(err, result) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting potentialAnswerList. " + error);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				return callback(error, potentialAnswerList);
			}

			if(result.length != 0) {
				for(pa in result) {
					potentialAnswerList.push({
						"potential_answer_id" : result[pa].potential_answer_id,
						"potential_answer_response" : result[pa].potential_answer_response,
						"potential_answer_status" : result[pa].potential_answer_status
					});
				}
			}

			callback(error, potentialAnswerList);
		});
	},

	"objectExists" : function(searchFields, searchList) {
		var exists = false;

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
				break;
			}
		}

		return exists;
	},

	"getTodayPadDate" : function () {
		return padDate(new Date());
	}

}

function padDate(dateObj) {
	var dd = dateObj.getUTCDate();
	var mm = dateObj.getUTCMonth() + 1; //January is 0!
	var yyyy = dateObj.getUTCFullYear();

	if(dd < 10) {
		dd = '0' + dd;
	} 

	if(mm < 10) {
		mm = '0' + mm;
	} 

	return yyyy + '-' + mm + '-' + dd;
}
