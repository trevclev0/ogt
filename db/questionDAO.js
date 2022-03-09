var mysql = require('mysql');
var fs = require('fs');
var logger = require('../logger.js');
var connection = require('./dbConnection.js').createConnection();
var helperFunctions = require('./helperFunctions.js');

var validQuestionTypes = ["multipleChoice", "freeResponse", "rating"];

// Make the functions available in another file as a require
module.exports = {
	
	// Returns a list of all the available questions to ask in a class
	// JSON format
	/*{ 
		{
			question_id : #,
			question_type: "multipleChoice, freeResponse, or rating",
			question_text: "How do you feel about...",
			question_during_class: true or false,
			potential_answers : [ // Only present if type==multipleChoice
				{
					"potential_answer_id" : #,
					"potential_answer_response" : "Answer 1"
				},{
					"potential_answer_id" : #,
					"potential_answer_response" : "Answer 2"
				},
				...
			]
		}, etc...
	}*/
	"getQuestionList" : function (question_during_class, callback) {
		var functionName = "getQuestionList";
		var error = "";
		var questionList = [];

		if(question_during_class == 1 || question_during_class == true) {
			question_during_class = 1;
		} else {
			question_during_class = 0;
		}

		helperFunctions.getQuestionList(question_during_class, function(err, questionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
				return callback(error, questionList);
			}

			callback(err, questionList);
		});
	},

	"getQuestionInfo" : function(question_text, question_type, callback) {
		var functionName = "getQuestionInfo";
		var question_during_class = 0; // Get all of the questions
		var error = "";
		var questionInfo = {};

		helperFunctions.getQuestionList(question_during_class, function(err, questionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
				return callback(error, questionInfo);
			}

			if(helperFunctions.objectExists({"question_text" : question_text, "question_type" : question_type}, questionList)) {
				for(question in questionList) {
					if(questionList[question].question_type == question_type && questionList[question].question_text == question_text) {
						questionInfo = questionList[question];
						break;
					}
				}
			} else {
				error = "Error: Question doesn't exist";
			}

			callback(error, questionInfo);
		});
	},

 	// Insert a new question into the DB
	"createQuestion" : function (question_type, question_text, question_during_class, callback) {
		var functionName = "createQuestion";
		var error = "";
		var question_id = 0;

		if(validQuestionTypes.indexOf(question_type) > -1) { // Valid question type
			helperFunctions.getQuestionList(question_during_class, function(err, questionList) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
					return callback(error);
				} else {
					// Check if in DB
					if(!helperFunctions.objectExists({"question_text" : question_text, "question_type" : question_type}, questionList)) { // Wasn't found, put it in the DB
						var queryString = 	"INSERT INTO questions (question_text, question_type, question_during_class)" +
											" VALUES (" + mysql.escape(question_text) + ", " + mysql.escape(question_type) + ", " + mysql.escape(question_during_class) + ")";

						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem inserting question into database. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
							} else {
								logger.info("Function: '" + functionName + "'. Question '" + question_text + "' of type '" + question_type + "' inserted into database."); 	
							}

							question_id = result.insertId;

							callback(error, question_id);
						});
					} else { // Was found
						callback("Error: Unable to insert duplicate question into database.", question_id)
					}
				}
			});
		} else {
			callback("Error: Invalid question type: " + question_type, question_id);	
		}
	},

	"updateQuestionInfo" : function (question_id, questionInfo, callback) {
		var functionName = "updateQuestionInfo";
		var error = "";

		helperFunctions.getQuestionList(0, function(err, questionList) {
			if(err) {
				error = err;
				callback(error);
			}

			if(	typeof questionInfo.question_text != 'undefined' && typeof questionInfo.question_type != 'undefined' &&
				helperFunctions.objectExists({"question_text" : questionInfo.question_text, "question_type" : questionInfo.question_type}, questionList)) {

				error = "Error: Question with the same text and type already exists.";
				return callback(error);
			}

			if(helperFunctions.objectExists({"question_id" : question_id}, questionList)) {
				var queryString = "UPDATE questions SET ";

				// Dynamically create the queryString
				var i = 0;
				for(fieldName in questionInfo) {
					if(i != 0) {
						queryString += ", ";
					}

					queryString += fieldName + " = " + mysql.escape(questionInfo[fieldName]);
					i++;
				}

				queryString += " WHERE question_id = " + mysql.escape(question_id);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem updating question info. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Updated question info for question_id: " + question_id);
					}

					callback(error);
				});
			} else { // Question doesn't exist
				error = "Error: Question doesn't exist.";
				callback(error);
			}
		});	
	},

	"deactivateQuestion" : function (question_type, question_text, callback) {
		var functionName = "deactivateQuestion";
		var error = "";

		if(validQuestionTypes.indexOf(question_type) > -1) { // A valid question_type
			helperFunctions.getQuestionList(0, function(err, questionList) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
					return callback(error);
				}

				if(helperFunctions.objectExists({"question_text" : question_text, "question_type" : question_type}, questionList)) {
					var queryString = 	"UPDATE questions SET question_status = 'Inactive'" + 
										" WHERE question_text = " + mysql.escape(question_text) + 
										" AND question_type = " + mysql.escape(question_type);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Error deactivating question. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Question '" + question_text + "' of type '" + question_type + "' deactivated.");
						}

						callback(error);
					});
				} else {
					error = "Error: Question not found.";
					callback(error);
				}

			});
		} else {
			callback("Error: Invalid question type: " + question_type);
		}
	},

	"reactivateQuestion" : function (question_type, question_text, callback) {
		var functionName = "reactivateQuestion";
		var error = "";

		if(validQuestionTypes.indexOf(question_type) > -1) { // A valid question_type
			helperFunctions.getQuestionList(0, function(err, questionList) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
					return callback(error);
				}

				if(helperFunctions.objectExists({"question_text" : question_text, "question_type" : question_type}, questionList)) {
					var queryString = 	"UPDATE questions SET question_status = 'Active'" + 
										" WHERE question_text = " + mysql.escape(question_text) + 
										" AND question_type = " + mysql.escape(question_type);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Error activating question. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Question '" + question_text + "' of type '" + question_type + "' activated.");
						}

						callback(error);
					});
				} else {
					error = "Error: Question not found.";
					callback(error);
				}

			});
		} else {
			callback("Error: Invalid question type: " + question_type);
		}
	},

	"createPotentialAnswers" : function (potential_answers, callback) {
		var functionName = "createPotentialAnswers";
		var error = "";

		helperFunctions.getPotentialAnswerList(function(err, potentialAnswerList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting potentialAnswerList. " + error);
				return callback(error);
			}

			if(potential_answers.length != 0) {
				var insertPAs = [];
				for(pa in potential_answers) {
					if(!helperFunctions.objectExists({"potential_answer_response" : potential_answers[pa]}, potentialAnswerList)) {
						insertPAs.push(potential_answers[pa]);
					}
				}

				if(insertPAs.length != 0) {
					var queryString = "INSERT INTO multiple_choice_potential_answers (potential_answer_response) VALUES ";

					var i = 0;
					for(pa in insertPAs) {
						if(i != 0) {
							queryString += ",";
						}

						queryString += "(" + mysql.escape(insertPAs[pa]) + ")";
						i++;
					}

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Error inserting potential multipleChoice answer into database. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
							return callback(error);
						} 

						logger.info("Function: '" + functionName + "'. Created potential answer(s): " + JSON.stringify(insertPAs));
						callback(error);
					});
				} else {
					error = "Error: All submitted potential answers already exist";
					return callback(error);
				}
			} else {
				error = "Error: No potential answers submitted.";
				return callback(error);
			}
		});
	},

	"updatePotentialAnswerInfo" : function (potential_answer_id, potentialAnswerInfo, callback) {
		var functionName = "updatePotentialAnswerInfo";
		var error = "";

		helperFunctions.getPotentialAnswerList(function(err, potentialAnswerList) {
			if(err) {
				error = err;
				callback(error);
			}

			if(	typeof potentialAnswerInfo.potential_answer_response != 'undefined' && 
				helperFunctions.objectExists({"potential_answer_response" : potentialAnswerInfo.potential_answer_response}, potentialAnswerList)) {

				error = "Error: Potential answer with the same response text already exists.";
				return callback(error);
			}

			if(helperFunctions.objectExists({"potential_answer_id" : potential_answer_id}, potentialAnswerList)) {
				var queryString = "UPDATE multiple_choice_potential_answers SET ";

				// Dynamically create the queryString
				var i = 0;
				for(fieldName in potentialAnswerInfo) {
					if(i != 0) {
						queryString += ", ";
					}

					queryString += fieldName + " = " + mysql.escape(potentialAnswerInfo[fieldName]);
					i++;
				}

				queryString += " WHERE potential_answer_id = " + mysql.escape(potential_answer_id);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem updating potential answer info. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Updated potential answer info for potential_answer_id: " + potential_answer_id);
					}

					callback(error);
				});
			} else { // Potential answer doesn't exist
				error = "Error: Potential answer doesn't exist.";
				callback(error);
			}
		});	
	},

	// Associate answers with a multipleChoice question
	// Assumes that potential_answers is in valid JSON format
	// {
	// 	"potential_answers" : [
	// 		"Answer 1",
	// 		"Answer 2"	
	// 	]
	// }
	"createAndAssignAnswers" : function (question_id, potential_answers, callback) {
		var functionName = "createAndAssignAnswers";
		var error = "";

		helperFunctions.getQuestionList(0, function(err, questionList) { // Grab all the questions
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
				return callback(error);
			} else {
				helperFunctions.getPotentialAnswerList(function(err, potentialAnswerList) { // Grab all the potential answers currently in the DB
					if(err) {
						error = err;
						return callback(error);
					}

					helperFunctions.getAssignedAnswersList(function(err, assignedAnswersList) {
						if(err) {
							error = err;
							return callback(error);
						}

						var inDBNotLinked = []; // Potential answer is in the DB, but not linked to this question
						var notInDBNotLinked = []; // PA is not in the DB and not linked to this question
						var inDBLinked = []; // PA is in DB and linked to this question

						// Figure out which queries need to be run on which potential answers
						for(pa in potential_answers) {
							var inDB = (helperFunctions.objectExists({"potential_answer_response" : potential_answers[pa]}, potentialAnswerList));
							var isLinked = (helperFunctions.objectExists({"question_id" : question_id, "potential_answer_response" : potential_answers[pa]}, assignedAnswersList));

							if(inDB && isLinked) {
								inDBLinked.push(potential_answers[pa]);
							} else if(inDB && !isLinked) {
								inDBNotLinked.push(potential_answers[pa]);
							} else if(!inDB && !isLinked) {
								notInDBNotLinked.push(potential_answers[pa]);
							}
						}

						// Functions for doing the job
						function insertPAs(callback) {
							var queryString = "INSERT INTO multiple_choice_potential_answers (potential_answer_response) VALUES ";

							var i = 0;
							for(pa in notInDBNotLinked) {
								if(i != 0) {
									queryString += ",";
								}

								queryString += "(" + mysql.escape(notInDBNotLinked[pa]) + ")";
								i++;
							}

							connection.query(queryString, function(err, result) {
								if(err) {
									error = err;
									logger.error("Function: '" + functionName + "'. Error inserting potential multipleChoice answer into database. " + error);
									logger.error("Function: '" + functionName + "'. Query: " + queryString);
									return callback(error);
								} 

								logger.info("Function: '" + functionName + "'. Created potential answer(s): " + JSON.stringify(notInDBNotLinked));
								callback();
							});
						}

						function linkPAs(callback) {
							helperFunctions.getPotentialAnswerList(function(err, potentialAnswerList) {
								if(err) {
									error = err;
									return callback(error);
								}

								function getPotentialAnswerID(potential_answer_response) {
									for(pa in potentialAnswerList) {
										if(potentialAnswerList[pa].potential_answer_response == potential_answer_response) {
											return potentialAnswerList[pa].potential_answer_id;
										}
									}
									return 0;
								}

								var paToLink = [];
								for(pa in notInDBNotLinked) {
									var potential_answer_id = getPotentialAnswerID(notInDBNotLinked[pa]);
									if(potential_answer_id != 0) {
										paToLink.push(potential_answer_id);
									}
								}

								for(pa in inDBNotLinked) {
									var potential_answer_id = getPotentialAnswerID(inDBNotLinked[pa]);
									if(potential_answer_id != 0) {
										paToLink.push(potential_answer_id);
									}
								}

								var queryString = "INSERT INTO multiple_choice_question_answers_list (question_id, potential_answer_id) VALUES ";

								var i = 0;
								for(pa in paToLink) {
									if(i != 0) {
										queryString += ",";
									}

									queryString += "(" + mysql.escape(question_id) + "," + mysql.escape(paToLink[pa]) + ")";
									i++;
								}

								connection.query(queryString, function(err, result) {
									if(err) {
										error = err;
										logger.error("Function: '" + functionName + "'. Error associating answers with question. " + error);
										logger.error("Function: '" + functionName + "'. Query: " + queryString);
										return callback(error);
									}

									logger.info("Function: '" + functionName + "'. Potential answers '" + JSON.stringify(notInDBNotLinked) + "' and '" + JSON.stringify(inDBNotLinked) + "' linked to question_id: " + question_id);
									callback();
								});
							});
						}

						function finalMessage() {
							if(inDBLinked.length != 0) {
								logger.error("Function: '" + functionName + "'. Potential answers not operated on: " + JSON.stringify(inDBLinked));
							}

							callback(error);
						}

						// Put it all in the DB and return
						if(notInDBNotLinked.length != 0) {
							insertPAs(function(err) {
								if(err) {
									error = err;
									return callback(error);
								}

								linkPAs(function(err) {
									if(err) {
										error = err;
										return callback(error);
									}

									finalMessage();
								});
							});
						} else if(inDBNotLinked.length != 0) {
							linkPAs(function(err) {
								if(err) {
									error = err;
									return callback(error);
								}
								
								finalMessage();
							});
						} else {
							finalMessage();
						}
					});
				});
			}
		});

		function linkPotentialAnswer(potential_answer_id, answerText) {
			// Link the potential answer to the question
			var queryString = "INSERT INTO multiple_choice_question_answers_list (question_id, potential_answer_id)" +
							" VALUES (" + mysql.escape(question_id) + ", " + mysql.escape(potential_answer_id) + ")";

			connection.query(queryString, function(err, result) {
				if(err) {
					logger.error("Function: '" + functionName + "'. Error associating answers with question. " + err);
					logger.error("Function: '" + functionName + "'. Query: " + queryString);
					error = err;
					callback(error);
				} else {
					logger.info("Function: '" + functionName + "'. Answer '" + answerText + " inserted into database and associated with question " + question_id);	
				}
			});
		}
	},

	"assignAnswersToQuestion" : function(question_id, assign_potential_ids, callback) {
		var functionName = "assignAnswersToQuestion";
		var error = "";

		if(assign_potential_ids.length != 0) {
			helperFunctions.getQuestionList(0, function(err, questionList) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
					return callback(error);
				}

				if(helperFunctions.objectExists({"question_id" : question_id}, questionList)) {
					helperFunctions.getAssignedAnswersList(function(err, assignedAnswersList) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem getting assignedAnswersList. " + error);
							callback(error);
						}

						var answersToAssign = [];
						for(assign_potential_id in assign_potential_ids) {
							if(!helperFunctions.objectExists({"question_id" : question_id, "potential_answer_id" : assign_potential_ids[assign_potential_id]}, assignedAnswersList)) {
								answersToAssign.push(assign_potential_ids[assign_potential_id]);
							}
						}

						if(answersToAssign.length != 0) {
							var queryString = "INSERT INTO multiple_choice_question_answers_list (question_id, potential_answer_id) VALUES "; 

							var i = 0;
							for(answer in answersToAssign) {
								if(i != 0) {
									queryString += ",";
								}

								queryString += "(" + mysql.escape(question_id) + "," + mysql.escape(answersToAssign[answer]) + ")" ;
								i++;
							}

							connection.query(queryString, function(err, result) {
								if(err) {
									logger.error("Function: '" + functionName + "'. Error assigning answers to question. " + err);
									logger.error("Function: '" + functionName + "'. Query: " + queryString);
									error = err;
								}

								callback(error);
							});
						} else {
							error = "Error: No unassigned answers to assign.";
							callback(error);
						}
					});
				}
			});
		} else {
			error = "Error: No potential_answer_ids submitted.";
			callback(error);
		}

		
	},

	"unassignAnswersFromQuestion" : function(question_id, unassign_potential_ids, callback) {
		var functionName = "unassignAnswersFromQuestion";
		var error = "";

		if(unassign_potential_ids.length != 0) {
			helperFunctions.getQuestionList(0, function(err, questionList) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
					return callback(error);
				}

				if(helperFunctions.objectExists({"question_id" : question_id}, questionList)) {
					helperFunctions.getAssignedAnswersList(function(err, assignedAnswersList) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem getting assignedAnswersList. " + error);
							callback(error);
						}

						var answersToUnassign = [];
						for(unassign_potential_id in unassign_potential_ids) {
							if(helperFunctions.objectExists({"question_id" : question_id, "potential_answer_id" : unassign_potential_ids[unassign_potential_id]}, assignedAnswersList)) {
								answersToUnassign.push(unassign_potential_ids[unassign_potential_id]);
							}
						}

						if(answersToUnassign.length != 0) {
							var queryString = "DELETE FROM multiple_choice_question_answers_list WHERE potential_answer_id IN (";

							var i = 0;
							for(answer in answersToUnassign) {
								if(i != 0) {
									queryString += ",";
								}

								queryString += mysql.escape(answersToUnassign[answer]);
								i++;
							}

							queryString += ") AND question_id = " + mysql.escape(question_id);

							connection.query(queryString, function(err, result) {
								if(err) {
									logger.error("Function: '" + functionName + "'. Error unassigning answers from question. " + err);
									logger.error("Function: '" + functionName + "'. Query: " + queryString);
									error = err;
								}

								callback(error);
							});
						} else {
							error = "Error: No assigned answers to unassign.";
							callback(error);
						}
					});
				}
			});
		} else {
			error = "Error: No potential_answer_ids submitted to unassign.";
			callback(error);
		}
	},

	"deactivatePotentialAnswers" : function(potential_answer_ids, callback) {
		var functionName = "deactivatePotentialAnswers";
		var error = "";

		var queryString = "UPDATE multiple_choice_potential_answers SET potential_answer_status = 'Inactive' WHERE potential_answer_id IN (";

		var i = 0;	
		for(pa in potential_answer_ids) {
			if(i != 0) {
				queryString += ",";
			}

			queryString += mysql.escape(potential_answer_ids[pa]);
			i++;
		}

		queryString += ")";

		connection.query(queryString, function(err, result) {
			if(err) {
				logger.error("Function: '" + functionName + "'. Error deactivating potential answers. " + err);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				error = err;
			}

			callback(error);
		});
	},

	"reactivatePotentialAnswers" : function(potential_answer_ids, callback) {
		var functionName = "reactivatePotentialAnswers";
		var error = "";

		var queryString = "UPDATE multiple_choice_potential_answers SET potential_answer_status = 'Active' WHERE potential_answer_id IN (";

		var i = 0;	
		for(pa in potential_answer_ids) {
			if(i != 0) {
				queryString += ",";
			}

			queryString += mysql.escape(potential_answer_ids[pa]);
			i++;
		}

		queryString += ")";

		connection.query(queryString, function(err, result) {
			if(err) {
				logger.error("Function: '" + functionName + "'. Error reactivating potential answers. " + err);
				logger.error("Function: '" + functionName + "'. Query: " + queryString);
				error = err;
			}

			callback(error);
		});
	},

	"getPotentialAnswerList" : function (callback) {
		var functionName = "getPotentialAnswerList";
		var error = "";

		helperFunctions.getPotentialAnswerList(function(err, potentialAnswerList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting potentialAnswerList. " + error);
				return callback(error);
			}

			callback(err, potentialAnswerList);
		});
	},

	"getAssignedAnswersList" : function (callback) {
		var functionName = "getAssignedAnswersList";
		var error = "";

		helperFunctions.getAssignedAnswersList(function(err, assignedAnswersList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting assignedAnswersList. " + error);
				return callback(error);
			}

			callback(err, assignedAnswersList);
		});
	},
	
	// Functionality for allowing a user to answer an in-class question
	// Assumes that the front-end has gathered all of the answers for the users
	// and submits them all at once. Thus, this function will only be called once
	// per in-class question.
	/* Expected JSON in user_answers_array:
	{
		user_id : #,
		user_answer : "The text of their response"
	}*/
	"answerClassQuestion" : function(question_id, class_session_id, user_answers_array, callback) {
		var functionName = "answerClassQuestion";
		var error = "";

		helperFunctions.getQuestionList(1, function(err, questionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting questionList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"question_id" : question_id, "question_during_class" : 1}, questionList)) {
				error = "Invalid question_id. Question does not exist in the database (make sure it's flagged as a question_during_class).";
				logger.error("Function: '" + functionName + "'. Error: " + error);
				return callback(error);
			}

			var questionInfo = {};
			for(question in questionList) {
				if(questionList[question].question_id == question_id) {
					questionInfo = questionList[question];
					break;
				}
			}

			var isMC = (questionInfo.question_type == "multipleChoice");

			// Insert class_id/question_id into questions_given_during_class_list
			// Don't check if the entry is in the questions_given_during_class_list, because
			// the therapist can ask the same question multiple times during a class
			var queryString = 	"INSERT INTO questions_given_during_class_list (question_id, class_session_id)" + 
								" VALUES (" + mysql.escape(question_id) + ", " + mysql.escape(class_session_id) + ")";
		
			connection.query(queryString, function(err, result) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Error adding a question to the class. " + error);
					logger.error("Function: '" + functionName + "'. Query: " + queryString);
					return callback(error);
				}

				var question_class_id = result.insertId;
				logger.debug("Function: '" + functionName + "'. Inserted the question into the question list for the class. New question_class_id: " + question_class_id);

				function insertAnswer(user_answer, callback) {
					queryString = "INSERT INTO user_answers (user_answer) VALUES (" + mysql.escape(user_answer) + ")";
					
					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Error creating a new user answer. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
							return callback(error);
						}
					
						var user_answer_id = result.insertId;
						logger.debug("Function: '" + functionName + "'. Inserted the user's answer. user_answer_id: " + user_answer_id);
						callback("", user_answer_id);
					});
				}

				function linkAnswer(user_id, question_class_id, user_answer_id, callback) {
					queryString = 	"INSERT INTO user_during_class_question_answers (user_id, question_class_id, user_answer_id)" + 
									" VALUES (" + mysql.escape(user_id) + ", " + mysql.escape(question_class_id) + ", " + mysql.escape(user_answer_id) + ")";
					
					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Error linking the user's answer to the in-class question. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
							return callback(error);
						}

						logger.debug("Function: '" + functionName + "'. Tied the user to their answer.");
						callback();
					});
				}

				// Actually do the inserts
				for(index in user_answers_array) {
					var user_id = user_answers_array[index].user_id;
					var user_answer = user_answers_array[index].user_answer;

					insertAnswer(user_id, function(err, user_answer_id) {
						if(err) {
							error = err;
							return callback(error);
						}

						linkAnswer(user_id, question_class_id, user_answer_id, function() {
							if(err) {
								error = err;
								return callback(error);
							}

							callback();
						});
					});
				}
			});
		});

		callback(error);
	},

	"getAssignedSurveyQuestionList" : function(callback) {
		var functionName = 'getAssignedSurveyQuestionList';
		var error = "";

		helperFunctions.getAssignedSurveyQuestionList(function(err, assignedSurveyQuestionList) {
			if(err) {
				error = err;
			}

			callback(error, assignedSurveyQuestionList);
		});
	},

	"assignQuestionsToSurvey" : function(survey_id, question_ids, callback) {
		var functionName = "assignQuestionsToSurvey";
		var error = "";

		helperFunctions.getSurveyList(function(err, surveyList) {
			if(err) {
				error = err;
				return callback(error);
			}

			if(helperFunctions.objectExists({"survey_id" : survey_id}, surveyList)) { // Check that the survey is valid
				helperFunctions.getQuestionList(0, function(err, questionList) {
					if(err) {
						error = err;
						return callback(error);
					}

					// Check that all questions are valid
					var allQuestionsValid = false;
					for(question_id in question_ids) {
						if(helperFunctions.objectExists({"question_id" : question_ids[question_id]}, questionList)) {
							allQuestionsValid = true;
						}

						if(!allQuestionsValid) { break; }
					}

					if(!allQuestionsValid) {
						error = "Error: Not all questions are valid.";
						return callback(error);
					}

					// See which questions are already assigned to this survey
					helperFunctions.getAssignedSurveyQuestionList(function(err, assignedSurveyQuestionList) {
						if(err) {
							error = err;
							return callback(error);
						}

						var questionIDsToAssign = [];
						var questionIDsToNotAssign = [];
						for(question_id in question_ids) {

							var alreadyAssigned = false;
							for(assignedSurveyQuestion in assignedSurveyQuestionList) {
								if(	assignedSurveyQuestionList[assignedSurveyQuestion].survey_id == survey_id && 
									assignedSurveyQuestionList[assignedSurveyQuestion].question_id == question_ids[question_id] ) {

									alreadyAssigned = true;
								}
							}

							if(!alreadyAssigned) {
								questionIDsToAssign.push(question_ids[question_id]);
							} else {
								questionIDsToNotAssign.push(question_ids[question_id]);
							}
						}

						if(questionIDsToAssign.length != 0) {
							// Create the query string to insert them all at the same time
							var queryString = "INSERT INTO survey_questions_list (`survey_id`, `question_id`) VALUES ";

							var i = 0;
							for(question_id in questionIDsToAssign) {
								if(i != 0) {
									queryString += ", ";
								}

								queryString += "(" + mysql.escape(survey_id) + "," + mysql.escape(questionIDsToAssign[question_id]) + ")";
								i++;
							}

							connection.query(queryString, function(err, result) {
								if(err) {
									error = err;
									logger.error("Function: '" + functionName + "'. Error assigning question to survey. " + error);
									logger.error("Function: '" + functionName + "'. Query: " + queryString);
								} else {
									logger.info("Function: '" + functionName + "'. Question(s) '" + JSON.stringify(questionIDsToAssign) + "' assigned to survey_id: '" + survey_id + "'");
									
									if(questionIDsToNotAssign.length != 0) {
										logger.info("Function: '" + functionName + "'. Question(s) '" + JSON.stringify(questionIDsToNotAssign) + "' NOT assigned to survey_id: '" + survey_id + "'");
									}
								}

								callback(error);
							});
						} else {
							error = "Error: All questions already assigned to survey.";
							callback(error);
						}
					});
				});
			} else {
				error = "Error: Survey not found.";
				callback(error);
			}
		});
	}
}
