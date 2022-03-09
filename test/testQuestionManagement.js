var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

var logger = require('../logger.js');
var questionFunctions = require('./questionFunctions.js');
var setupFunctions = require('./setupFunctions.js');
var userFunctions = require('./userFunctions.js');

// questionList Format
/*{ 
	{
		id : #,
		type: "multipleChoice, freeResponse, or rating",
		text: "How do you feel about...",
		duringClass: true or false,
		answers : [ // Only present if type==multipleChoice
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
var testQuestionList = [
	{
		"question_text" : "This is a test question (automated testing - question 1)",
		"question_type" : "freeResponse",
		"question_during_class" : 1
	},{
		"question_text" : "This is a test question (automated testing - question 2)",
		"question_type" : "multipleChoice",
		"question_during_class" : 0
	}
];

var answerList = [
	"This is a test multipleChoice question answer (automated testing - answer 1)",
	"This is a test multipleChoice question answer (automated testing - answer 2)",
	"This is a test multipleChoice question answer (automated testing - answer 3)",
	"This is a test multipleChoice question answer (automated testing - answer 4)",
];

var diffAnswerList = [
	"This is a different test multipleChoice question answer (automated testing - answer 1)",
	"This is a different test multipleChoice question answer (automated testing - answer 2)",
	"This is a different test multipleChoice question answer (automated testing - answer 3)",
	"This is a different test multipleChoice question answer (automated testing - answer 4)",
];

var questionPostData = {
	"question_id" : 0,
	"question_text" : testQuestionList[0].question_text,
	"question_type" : testQuestionList[0].question_type,
	"question_during_class" : testQuestionList[0].question_during_class,
	"potential_answers" : answerList
};
var answerPostData = {
	'question_id' : 0,
	'class_session_id' : 0,
	'user_answers' : [
		{
			'user_id' : 0,
			'user_answer' : "This is a test answer for user 1"
		},{
			'user_id' : 0,
			'user_answer' : "This is a test answer for user 2"
		}
	]
};
var userPostData = {
	"user_id" : 0,
	"user_first_name" : "Automated",
	"user_last_name" : "Test",
	"user_email" : "automated@test.com",
	"user_type" : "Therapist",
	"user_bio" : "I am the most awesome test user ever!",
	"user_username" : "autotest",
	"user_password" : "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
};

describe('Question Management Suite -', function() { // Test suite
	
	before(function(done) {
		var testCase = "before";
		done()
	});

	it('Should get the question info', function(done) {
		var testCase = "Should get the question info";
		logger.info("Running test case: '" + testCase + "'");

		questionFunctions.getQuestionList(testCase, function(error, questionList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting questionList");
				return done(error);
			}

			var questionDBInfo = questionFunctions.questionExists(questionPostData.question_text, questionPostData.question_type, questionList);
			var expect = (!questionDBInfo.questionExists) ? 500 : 200;

			questionFunctions.getQuestionInfo(testCase, expect, questionPostData, function(error, questionInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting question info");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should create an in-class freeResponse question', function(done) {
		var testCase = "Should create an in-class freeResponse question";
		logger.info("Running test case: '" + testCase + "'");

		questionFunctions.getQuestionList(testCase, function(error, questionList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting questionList");
				return done(error);
			}

			var questionDBInfo = questionFunctions.questionExists(questionPostData.question_text, questionPostData.question_type, questionList);
			var expect = (questionDBInfo.questionExists) ? 500 : 200;

			questionFunctions.createQuestion(testCase, expect, questionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error creating a question");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should update a question\'s info', function(done) {
		var testCase = "Should update a question's info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up question");
				return done(error);
			}

			questionFunctions.getQuestionList(testCase, function(error, questionList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting questionList");
					return done(error);
				}

				var diffQuestionPostData = questionPostData;
				diffQuestionPostData.question_id = questionInfo.question_id;
				diffQuestionPostData.question_text = "This is an updated question text";
				diffQuestionPostData.question_type = "rating";
				diffQuestionPostData.question_during_class = 0;

				var diffQuestionInfo = questionFunctions.objectExists({"question_text" : diffQuestionPostData.question_text, "question_type" : diffQuestionPostData.question_type}, questionList);

				var expect = (diffQuestionInfo.exists) ? 500 : 200;
				questionFunctions.updateQuestionInfo(testCase, expect, diffQuestionPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error changing question info");
						return done(error);
					}

					done();
				});
			});
		});	
	});
	
	it('Should deactivate a freeResponse question', function(done) { // Test case
		var testCase = "Should deactivate a freeResponse question";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up question");
				return done(error);
			}

			var expect = 200;
			questionFunctions.deactivateQuestion(testCase, expect, questionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating a question");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should reactivate a freeResponse question', function(done) { // Test case
		var testCase = "Should reactivate a freeResponse question";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up question");
				return done(error);
			}

			var expect = 200;
			questionFunctions.deactivateQuestion(testCase, expect, questionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating a question");
					return done(error);
				}

				questionFunctions.reactivateQuestion(testCase, expect, questionPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error reactivating a question");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should create a multipleChoice question and assign answers to it', function(done) { // Test case
		var testCase = "Should create a multipleChoice question and assign answers to it";
		logger.info("Running test case: '" + testCase + "'");

		questionFunctions.getQuestionList(testCase, function(error, questionList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting questionList");
				return done(error);
			}

			var diffQuestionPostData = questionPostData;
			diffQuestionPostData.question_text = testQuestionList[1].question_text;
			diffQuestionPostData.question_type = testQuestionList[1].question_type;
			diffQuestionPostData.question_during_class = testQuestionList[1].question_during_class;

			var questionDBInfo = questionFunctions.questionExists(diffQuestionPostData.question_text, diffQuestionPostData.question_type, questionList);
			var expect = (questionDBInfo.questionExists) ? 500 : 200;

			questionFunctions.createQuestion(testCase, expect, diffQuestionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error creating a question");
					return done(error);
				}

				expect = 200;
				questionFunctions.getQuestionInfo(testCase, expect, diffQuestionPostData, function(error, questionInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting question info");
						return done(error);
					}

					diffQuestionPostData.question_id = questionInfo.question_id;

					questionFunctions.createAndAssignAnswers(testCase, expect, diffQuestionPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error associating answers with question");	
							return done(error);	
						}

						done();
					});
				});
			});
		});
	});

	it('Should deactivate potential answers', function(done) { // Test case
		var testCase = "Should deactivate potential answers";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up question");
				return done(error);
			}

			var potential_answer_ids = [];
			for(pa in questionInfo.potential_answers) {
				potential_answer_ids.push(questionInfo.potential_answers[pa].potential_answer_id);
			}

			var postData = {
				"potential_answer_ids" : potential_answer_ids
			}

			var expect = 200;
			questionFunctions.deactivatePotentialAnswers(testCase, expect, postData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating potential answers");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should reactivate potential answers', function(done) { // Test case
		var testCase = "Should reactivate potential answers";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up question");
				return done(error);
			}

			var potential_answer_ids = [];
			for(pa in questionInfo.potential_answers) {
				potential_answer_ids.push(questionInfo.potential_answers[pa].potential_answer_id);
			}

			var postData = {
				"potential_answer_ids" : potential_answer_ids
			}

			var expect = 200;
			questionFunctions.deactivatePotentialAnswers(testCase, expect, postData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating potential answers");
					return done(error);
				}

				questionFunctions.reactivatePotentialAnswers(testCase, expect, postData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error reactivating potential answers");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should create potential answers', function(done) {
		var testCase = "Should create potential answers";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up a multiple choice question");
				return done(error);
			}

			questionFunctions.getPotentialAnswerList(testCase, function(error, potentialAnswerList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting potentialAnswerList");
					return done(error);
				}

				var notCreated = [];
				for(diffAnswer in diffAnswerList) {
					var diffAnswerInfo = questionFunctions.objectExists({"potential_answer_response" : diffAnswerList[diffAnswer]}, potentialAnswerList);
					if(!diffAnswerInfo.exists) {
						notCreated.push(diffAnswerList[diffAnswer]);
					}
				}

				var createPostData = {
					"potential_answers" : notCreated
				}

				var expect = (notCreated.length == 0) ? 500 : 200;
				questionFunctions.createPotentialAnswers(testCase, expect, createPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error creating potential answers");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should update a potential answer\'s info', function(done) {
		var testCase = "Should update a potential answer's info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up multipleChoice question");
				return done(error);
			}

			questionFunctions.getPotentialAnswerList(testCase, function(error, potentialAnswerList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting potentialAnswerList");
					return done(error);
				}

				if(potentialAnswerList.length != 0) {
					potentialAnswerInfo = potentialAnswerList[0];

					var diffPAPostData = potentialAnswerInfo;
					diffPAPostData.potential_answer_response = "This is a different potential answer";

					var diffPAInfo = questionFunctions.objectExists({"potential_answer_response" : diffPAPostData.potential_answer_response}, potentialAnswerList);

					var expect = (diffPAInfo.exists) ? 500 : 200;
					questionFunctions.updatePotentialAnswerInfo(testCase, expect, diffPAPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error changing potential answer info");
							return done(error);
						}

						done();
					});
				}
			});
		});	
	});

	it('Should assign potential answers to a question', function(done) {
		var testCase = "Should assign potential answers to a question";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up a multiple choice question");
				return done(error);
			}

			questionFunctions.getPotentialAnswerList(testCase, function(error, potentialAnswerList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting potentialAnswerList");
					return done(error);
				}

				var notCreated = [];
				for(diffAnswer in diffAnswerList) {
					var diffAnswerInfo = questionFunctions.objectExists({"potential_answer_response" : diffAnswerList[diffAnswer]}, potentialAnswerList);
					if(!diffAnswerInfo.exists) {
						notCreated.push(diffAnswerList[diffAnswer]);
					}
				}

				var createPostData = {
					"potential_answers" : notCreated
				}

				var expect = (notCreated.length == 0) ? 500 : 200;
				questionFunctions.createPotentialAnswers(testCase, expect, createPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error creating potential answers");
						return done(error);
					}

					questionFunctions.getPotentialAnswerList(testCase, function(error, potentialAnswerList) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error getting potentialAnswerList");
							return done(error);
						}

						questionFunctions.getAssignedAnswersList(testCase, function(error, assignedAnswersList) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting assignedAnswersList");
								return done(error);
							}

							var unassigned = [];
							var assigned = [];
							for(diffAnswer in diffAnswerList) {
								var diffAnswerInfo = questionFunctions.objectExists({"potential_answer_response" : diffAnswerList[diffAnswer]}, potentialAnswerList);
								var diffAnswerAssignedInfo = questionFunctions.objectExists({"potential_answer_response" : diffAnswerList[diffAnswer]}, assignedAnswersList);

								if(diffAnswerInfo.exists && !diffAnswerAssignedInfo.exists) {
									unassigned.push(diffAnswerInfo.info.potential_answer_id);
								} else {
									assigned.push(diffAnswerInfo.info.potential_answer_id);
								}
							}

							var unassignPostData = {
								"question_id" : questionInfo.question_id,
								"unassign_potential_ids" : assigned
							};

							expect = (assigned.length == 0) ? 500 : 200;
							questionFunctions.unassignAnswersFromQuestion(testCase, expect, unassignPostData, function(error) {
								if(error) {
									logger.error("Test case: '" + testCase + "'. Error unassigning answers from question");
									return done(error);
								}

								unassigned = unassigned.concat(assigned);

								var assignPostData = {
									"question_id" : questionInfo.question_id,
									"assign_potential_ids" : unassigned
								};

								expect = (unassigned.length == 0) ? 500 : 200;
								questionFunctions.assignAnswersToQuestion(testCase, expect, assignPostData, function(error) {
									if(error) {
										logger.error("Test case: '" + testCase + "'. Error assigning answers to question");
										return done(error);
									}

									done();
								});
							});
						});
					});
				});
			});
		});
	});

	it('Should unassign potential answers from a question', function(done) {
		var testCase = "Should unassign potential answers from a question";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, questionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up a multiple choice question");
				return done(error);
			}

			questionFunctions.getAssignedAnswersList(testCase, function(error, assignedAnswersList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting assignedAnswersList");
					return done(error);
				}

				var unassign_potential_ids = [];
				for(answer in assignedAnswersList) {
					if(assignedAnswersList[answer].question_id == questionInfo.question_id) {
						unassign_potential_ids.push(assignedAnswersList[answer].potential_answer_id);
					}
				}

				var unassignPostData = {
					"question_id" : questionInfo.question_id,
					"unassign_potential_ids" : unassign_potential_ids
				};

				var expect = (unassign_potential_ids.length == 0) ? 500 : 200;
				questionFunctions.unassignAnswersFromQuestion(testCase, expect, unassignPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error unassigning answers");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should answer an in-class question', function(done) {
		var testCase = "Should answer an in-class question";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserClassAndSession(testCase, function(error, userInfo, classInfo, classSessionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user, class, and session");
				return done(error);
			}

			setupFunctions.setupQuestion(testCase, function(error, questionInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error setting up question");
					return done(error);
				}
				
				userFunctions.getUserList(testCase, function(error, userList) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting user list");
						return done(error);
					}

					// Setup postData to create a second user
					diffUserPostData = userPostData;
					diffUserPostData.user_username = "autotest2";

					var userDBInfo2 = userFunctions.userExists(diffUserPostData.user_username, userList);
					expect = (userDBInfo2.userExists) ? 500 : 200;

					userFunctions.addUser(testCase, expect, userPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error creating second user");
							return done(error);
						}

						expect = 200;
						userFunctions.getUserInfo(testCase, expect, userPostData, function(error, user2Exists, userInfo2) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting user info for user 2");
								return done(error);
							}

							answerPostData.class_session_id = classSessionInfo.class_session_id; // Set the class_session_id
							answerPostData.question_id = questionInfo.question_id; // Set question_id
							answerPostData.user_answers[0].user_id = userInfo.user_id; // Set first user_id
							answerPostData.user_answers[1].user_id = userInfo2.user_id; // Set second user_id

							// It's finally all set up! Answer the question!
							questionFunctions.answerClassQuestion(testCase, expect, answerPostData, function(error) {
								if(error) {
									logger.error("Test case: '" + testCase + "'. Error answering an in-class question.");
									return done(error);
								}

								done();
							});
						});
					});
				});
			});
		});
	});

	it('Should assign questions to a survey', function(done) {
		var testCase = "Should assign questions to a survey";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupSurvey(testCase, function(error, surveyInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up survey");
				return done(error);
			}

			setupFunctions.setupQuestion(testCase, function(error, questionInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error setting up freeResponse question");
					return done(error);
				}

				setupFunctions.setupMultipleChoiceQuestion(testCase, function(error, mcQuestionInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error setting up multipleChoice question");
						return done(error);
					}

					var assignPostData = {
						"survey_id" : surveyInfo.survey_id,
						"question_ids" : [questionInfo.question_id, mcQuestionInfo.question_id]
					};

					questionFunctions.getAssignedSurveyQuestionList(testCase, function(error, assignedSurveyQuestionList) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error getting assignedSurveyQuestionList");
							return done(error);
						}

						// Determine if all of the questions have been assigned (if there will be an error or not)
						var questionIDsToAssign = [];
						var questionIDsToNotAssign = [];
						for(question_id in assignPostData.question_ids) {

							var alreadyAssigned = false;
							for(assignedSurveyQuestion in assignedSurveyQuestionList) {
								if(	assignedSurveyQuestionList[assignedSurveyQuestion].survey_id == assignPostData.survey_id && 
									assignedSurveyQuestionList[assignedSurveyQuestion].question_id == assignPostData.question_ids[question_id] ) {

									alreadyAssigned = true;
								}
							}

							if(!alreadyAssigned) {
								questionIDsToAssign.push(assignPostData.question_ids[question_id]);
							} else {
								questionIDsToNotAssign.push(assignPostData.question_ids[question_id]);
							}
						}

						var expect = (questionIDsToAssign.length == 0) ? 500 : 200;
						questionFunctions.assignQuestionsToSurvey(testCase, expect, assignPostData, function(error) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error assigning questions to survey");
								return done(error);
							}

							done();
						});
					});
				});
			});
		});
	});
});