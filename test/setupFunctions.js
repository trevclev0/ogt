var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var logger = require('../logger.js');
var config = require('../config.js');

var classFunctions = require('./classFunctions.js');
var mediaFunctions = require('./mediaFunctions.js');
var questionFunctions = require('./questionFunctions.js');
var surveyFunctions = require('./surveyFunctions.js');
var userFunctions = require('./userFunctions.js');

var port = config.port;
var url = 'http://localhost:' + port;

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
var questionPostData = {
	"question_id" : 0,
	"question_type" : "multipleChoice",
	"question_text" : "Temp Text",
	"question_duringClass" : "1",
	"potential_answers" : answerList
};
var classPostData = {
	"therapist_id" : 0,
	"class_name" : "Test Class",
	"class_size" : 5,
	"class_start_date" : classFunctions.getDatePlusDays(0),
	"class_end_date" : classFunctions.getDatePlusDays(30)
};
var sessionPostData = {
	"class_id" : 0,
	"class_session_name" : "Test Class Session",
	"class_session_date" : classFunctions.getDatePlusDays(15),
	"class_session_time" : "17:00:00"
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
var addressPostData = {
	"user_addr_id" : 0,
	"user_id" : 0,
	"user_addr_street" : "1474 South 605 East",
	"user_addr_city" : "Orem",
	"user_addr_state" : "UT",
	"user_addr_zip" : "84097",
	"user_addr_is_billing" : 1
};
var billingPostData = {
	"billing_id" : 0,
	"user_id" : 0,
	"billing_cc" : "1234567812345678",
	"billing_cc_exp" : classFunctions.getDatePlusDays(365),
	"billing_cc_type" : "Visa"
};
var surveyPostData = {
	"survey_id" : 0,
	"survey_name" : "Test Survey",
};
var mediaPostData = {
	"media_id" : 0,
	"media_name" : "Test Presentation 1",
	"media_path" : "Test Presentation 1/1.jpg",
	"media_length" : 3
};
var testPresentationFile = "test/presentations/Test Presentation 1.pdf";
var testPresentationName = "Test Presentation 1";

module.exports = {

	"setupUser" : function(testCase, callback) {
		populateUserExistsAndPostData(testCase, function(error, userExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating userExists and postData");
				return callback(error);
			}

			var expect = (userExists) ? 500 : 200;
			userFunctions.addUser(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding user");
					return callback(error);
				}

				expect = 200;
				userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting user info");
						return callback(error);
					}

					callback("", userExists, userInfo);
				});
			});	
		});
	},

	"setupUserAndAddress" : function(testCase, callback) {
		populateUserExistsAndPostData(testCase, function(error, userExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating userExists and postData");
				return callback(error);
			}

			var expect = (userExists) ? 500 : 200;
			userFunctions.addUser(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding user");
					return callback(error);
				}

				expect = 200;
				userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting user info");
						return callback(error);
					}

					var addressDBInfo = userFunctions.addressExists(addressPostData, userInfo.addresses);
					expect = (addressDBInfo.addressExists) ? 500 : 200;
					userFunctions.addAddress(testCase, expect, addressPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error adding an address for a user");
							return callback(error);
						}

						expect = 200;
						userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting user info");
								return callback(error);
							}

							callback("", userExists, userInfo);
						});
					});
				});
			});	
		});
	},

	"setupUserAndBilling" : function(testCase, callback) {
		populateUserExistsAndPostData(testCase, function(error, userExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating userExists and postData");
				return callback(error);
			}

			var expect = (userExists) ? 500 : 200;
			userFunctions.addUser(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding user");
					return callback(error);
				}

				expect = 200;
				userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting user info");
						return callback(error);
					}

					var billingDBInfo = userFunctions.billingExists(billingPostData, userInfo.billing);
					expect = (billingDBInfo.billingExists) ? 500 : 200;
					userFunctions.addBilling(testCase, expect, billingPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error adding billing info for a user");
							return callback(error);
						}

						expect = 200;
						userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting user info");
								return callback(error);
							}

							callback("", userExists, userInfo);
						});
					});
				});
			});	
		});
	},

	"setupUserAndClass" : function(testCase, callback) {
		populateUserExistsAndPostData(testCase, function(error, userExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating userExists and postData");
				return callback(error);
			}

			var expect = (userExists) ? 500 : 200;
			userFunctions.addUser(testCase, expect, userPostData, function(error) { // Add the user
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error creating user");
					return callback(error);
				}

				expect = 200;
				userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) { // Get the user's info
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error changing the userType");
						return callback(error);
					}

					classPostData.therapist_id = userInfo.user_id;
					userPostData.user_id = userInfo.user_id;

					userFunctions.updateUserInfo(testCase, expect, userPostData, function(error) { // Change the user's type to Therapist
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error getting user info");
							return callback(error);
						}
						
						classFunctions.getClassList(testCase, function(error, classList) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting the classList");
								return callback(error);
							}

							// Check if the class exists or not
							var classExists = false;
							for(klass in classList) {
								if(classList[klass].class_name == classPostData.class_name) {
									classExists = true;
									break;
								}
							}

							expect = (classExists) ? 500 : 200;
							classFunctions.addClass(testCase, expect, classPostData, function(error) {
								if(error) {
									logger.error("Test case: '" + testCase + "'. Error adding a class");
									return callback(error);
								}

								expect = 200;
								classFunctions.getClassInfo(testCase, expect, classPostData, function(error, classInfo) {
									if(error) {
										logger.error("Test case: '" + testCase + "'. Error getting class info");
										return callback(error);
									}

									callback("", userInfo, classInfo);
								});
							});
						});
					});
				});
			});
		});
	},

	"setupUserClassAndSession" : function(testCase, callback) {
		populateUserExistsAndPostData(testCase, function(error, userExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating userExists and postData");
				return callback(error);
			}

			var expect = (userExists) ? 500 : 200;
			userFunctions.addUser(testCase, expect, userPostData, function(error) { // Add the user
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error creating user");
					return callback(error);
				}

				expect = 200;
				userFunctions.getUserInfo(testCase, expect, userPostData, function(error, userExists, userInfo) { // Get the user's info
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error changing the userType");
						return callback(error);
					}

					classPostData.therapist_id = userInfo.user_id;
					userPostData.user_id = userInfo.user_id;

					userFunctions.updateUserInfo(testCase, expect, userPostData, function(error) { // Change the user's type to Therapist
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error getting user info");
							return callback(error);
						}
						
						classFunctions.getClassList(testCase, function(error, classList) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting the classList");
								return callback(error);
							}

							// Check if the class exists or not
							var classExists = false;
							for(klass in classList) {
								if(classList[klass].class_name == classPostData.class_name) {
									classExists = true;
									break;
								}
							}

							expect = (classExists) ? 500 : 200;
							classFunctions.addClass(testCase, expect, classPostData, function(error) {
								if(error) {
									logger.error("Test case: '" + testCase + "'. Error adding a class");
									return callback(error);
								}

								expect = 200;
								classFunctions.getClassInfo(testCase, expect, classPostData, function(error, classInfo) {
									if(error) {
										logger.error("Test case: '" + testCase + "'. Error getting class info");
										return callback(error);
									}

									//sessionPostData.class_id = classInfo.class_id;
									sessionPostData.class_id = 0; // Just get all of the sessions, instead of limiting by class_id

									classFunctions.getClassSessionList(testCase, sessionPostData, function(error, classSessionList) {
										if(error) {
											logger.error("Test case: '" + testCase + "'. Error getting class session list");
											return callback(error);
										}

										// Check if the class session exists or not
										var classSessionExists = false;
										for(classSession in classSessionList) {
											if(classSessionList[classSession].class_session_name == sessionPostData.class_session_name) {
												classSessionExists = true;
												break;
											}
										}

										expect = (classSessionExists) ? 500 : 200;
										classFunctions.addClassSession(testCase, expect, sessionPostData, function(error) {
											if(error) {
												logger.error("Test case: '" + testCase + "'. Error adding a class session");
												return callback(error);
											}

											expect = 200;
											classFunctions.getClassSessionInfo(testCase, expect, sessionPostData, function(error, classSessionInfo) {
												if(error) {
													logger.error("Test case: '" + testCase + "'. Error getting class session info");
													return callback(error);
												}

												callback("", userInfo, classInfo, classSessionInfo);
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	},

	"setupQuestion" : function(testCase, callback) {
		populateQuestionExistsAndPostData(testCase, 0, function(error, questionExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating questionExists and postData");
				return callback(error);
			}

			var expect = (questionExists) ? 500 : 200;
			questionFunctions.createQuestion(testCase, expect, questionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error creating a question");
					return callback(error);
				}

				expect = 200;
				questionFunctions.getQuestionInfo(testCase, expect, questionPostData, function(error, questionInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting question info");
						return callback(error);
					}

					callback("", questionInfo);
				});
			});
		});
	},

	"setupMultipleChoiceQuestion" : function(testCase, callback) {
		populateQuestionExistsAndPostData(testCase, 1, function(error, questionExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating questionExists and postData");
				return callback(error);
			}

			var expect = (questionExists) ? 500 : 200;
			questionFunctions.createQuestion(testCase, expect, questionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error creating a question");
					return callback(error);
				}

				expect = 200;
				questionFunctions.getQuestionInfo(testCase, expect, questionPostData, function(error, questionInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting question info");
						return callback(error);
					}

					questionPostData.question_id = questionInfo.question_id;

					questionFunctions.createAndAssignAnswers(testCase, expect, questionPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error associating answers with question");	
							return callback(error);	
						}

						questionFunctions.getQuestionInfo(testCase, expect, questionPostData, function(error, questionInfo) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error getting question info");
								return callback(error);
							}

							callback("", questionInfo);
						});
					});
				});
			});
		});
	},

	"setupSurvey" : function(testCase, callback) {
		populateSurveyExistsAndPostData(testCase, function(error, surveyExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating surveyExists and postData");
				return callback(error);
			}

			var expect = (surveyExists) ? 500 : 200;
			surveyFunctions.addSurvey(testCase, expect, surveyPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding survey");
					return callback(error);
				}

				expect = 200;
				surveyFunctions.getSurveyInfo(testCase, expect, surveyPostData, function(error, surveyExists, surveyInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting survey info");
						return callback(error);
					}

					callback("", surveyInfo);
				});
			});	
		});
	},

	"setupMedia" : function(testCase, callback) {
		populateMediaExists(testCase, function(error, mediaExists) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error populating mediaExists");
				return callback(error);
			}

			var expect = (mediaExists) ? 500 : 200;
			mediaFunctions.addMedia(testCase, expect, testPresentationFile, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding new media");
					return callback(error);
				}

				expect = 200;
				mediaFunctions.getMediaInfo(testCase, expect, mediaPostData, function(error, mediaInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting mediaInfo");
						return callback(error);
					}

					callback("", mediaInfo);
				});
			});
		});
	}

}

function populateUserExistsAndPostData(testCase, callback) {
	userFunctions.getUserList(testCase, function(error, userList) {
		if(error) {
			logger.error("Test case: '" + testCase + "'. Error getting userList");
			return callback(error);
		}

		// Check if user exists
		var userDBInfo = userFunctions.userExists("autotest", userList);
		if(userDBInfo.userExists) {
			userPostData.user_id = userDBInfo.userInfo.user_id;
			addressPostData.user_id = userDBInfo.userInfo.user_id;
			billingPostData.user_id = userDBInfo.userInfo.user_id;
		}

		callback("", userDBInfo.userExists);
	});
}

function populateQuestionExistsAndPostData(testCase, index, callback) {
	questionFunctions.getQuestionList(testCase, function(error, questionList) {
		if(error) {
			logger.error("Test case: '" + testCase + "'. Error getting questionList");
			return callback(error);
		}

		questionPostData.question_text = testQuestionList[index].question_text;
		questionPostData.question_type = testQuestionList[index].question_type;
		questionPostData.question_during_class = testQuestionList[index].question_during_class;

		var questionDBInfo = questionFunctions.questionExists(questionPostData.question_text, questionPostData.question_type, questionList);

		callback("", questionDBInfo.questionExists);
	});
}

function populateSurveyExistsAndPostData(testCase, callback) {
	surveyFunctions.getSurveyList(testCase, function(error, surveyList) {
		if(error) {
			logger.error("Test case: '" + testCase + "'. Error getting surveyList");
			return callback(error);
		}

		var surveyDBInfo = surveyFunctions.surveyExists(surveyPostData.survey_name, surveyList);
		if(surveyDBInfo.surveyExists) {
			surveyPostData.survey_id = surveyDBInfo.survey_id;
		}

		callback("", surveyDBInfo.surveyExists);
	});
}

function populateMediaExists(testCase, callback) {
	mediaFunctions.getMediaList(testCase, function(error, mediaList) {
		if(error) {
			logger.error("Test case: '" + testCase + "'. Error getting mediaList");
			return callback(error);
		}

		var mediaDBInfo = mediaFunctions.mediaExists(testPresentationName, mediaList);
		if(mediaDBInfo.mediaExists) {
			mediaPostData.media_id = mediaDBInfo.media_id;
		}

		callback("", mediaDBInfo.mediaExists);
	});
}