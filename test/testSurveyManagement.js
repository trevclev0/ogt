var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

var logger = require('../logger.js');
var setupFunctions = require('./setupFunctions.js');
var surveyFunctions = require('./surveyFunctions.js');

var surveyPostData = {
	"survey_id" : 0,
	"survey_name" : "Test Survey",
};

describe('Survey Management Suite -', function() {

	before(function(done) {
		var testCase = "before";
		done();
	});

	it('Should get a survey\'s info', function(done) {
		var testCase = "Should get a survey's info";
		logger.info("Running test case: '" + testCase + "'");

		surveyFunctions.getSurveyList(testCase, function(err, surveyList) {
			if(err) {
				logger.error("Test case: '" + testCase + "'. Error getting survey list");
				return done(error);
			}

			var surveyDBInfo = surveyFunctions.surveyExists(surveyPostData.survey_name, surveyList);
			var expect = (!surveyDBInfo.surveyExists) ? 500 : 200;
			surveyFunctions.getSurveyInfo(testCase, expect, surveyPostData, function(error, surveyExists, surveyInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting survey info");
					return done(error);
				}

				done();
			});	
		});
	});
	
	it('Should add a new survey', function(done) {
		var testCase = "Should add a new survey";
		logger.info("Running test case: '" + testCase + "'");

		surveyFunctions.getSurveyList(testCase, function(err, surveyList) {
			if(err) {
				logger.error("Test case: '" + testCase + "'. Error getting survey list");
				return done(error);
			}

			var surveyDBInfo = surveyFunctions.surveyExists(surveyPostData.survey_name, surveyList);
			var expect = (surveyDBInfo.surveyExists) ? 500 : 200;
			surveyFunctions.addSurvey(testCase, expect, surveyPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding survey");
					return done(error);
				}

				done();
			});	
		});
	});

	it('Should deactivate a survey', function(done) {
		var testCase = "Should deactivate a survey";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupSurvey(testCase, function(error, surveyInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up survey");
				return done(error);
			}

			var expect = 200;
			surveyFunctions.deactivateSurvey(testCase, expect, surveyPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating survey");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should reactivate a survey', function(done) {
		var testCase = "Should activate a survey";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupSurvey(testCase, function(error, surveyInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up survey");
				return done(error);
			}

			var expect = 200;
			surveyFunctions.deactivateSurvey(testCase, expect, surveyPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating survey");
					return done(error);
				}

				surveyFunctions.reactivateSurvey(testCase, expect, surveyPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error activating survey");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should assign a survey to a class', function(done) {
		var testCase = "Should assign a survey to a class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			setupFunctions.setupSurvey(testCase, function(error, surveyInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error setting up survey");
					return done(error);
				}

				var assignPostData = {
					"class_id" : classInfo.class_id,
					"survey_id" : surveyInfo.survey_id
				};

				surveyFunctions.getClassSurveyList(testCase, function(error, classSurveyList) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting classSurveyList");
						return done(error);
					}

					var expect = (surveyFunctions.classSurveyAssigned(assignPostData.class_id, assignPostData.survey_id, classSurveyList)) ? 500 : 200;
					surveyFunctions.assignSurveyToClass(testCase, expect, assignPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error assigning survey to class");
							return done(error);
						}

						done();
					});
				})
			});
		});
	});

	it('Should unassign a survey from a class', function(done) {
		var testCase = "Should unassign a survey from a class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			setupFunctions.setupSurvey(testCase, function(error, surveyInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error setting up survey");
					return done(error);
				}

				var assignPostData = {
					"class_id" : classInfo.class_id,
					"survey_id" : surveyInfo.survey_id
				};

				surveyFunctions.getClassSurveyList(testCase, function(error, classSurveyList) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting classSurveyList");
						return done(error);
					}

					var expect = (surveyFunctions.classSurveyAssigned(assignPostData.class_id, assignPostData.survey_id, classSurveyList)) ? 500 : 200;
					surveyFunctions.assignSurveyToClass(testCase, expect, assignPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error assigning survey to class");
							return done(error);
						}

						expect = 200;
						surveyFunctions.unassignSurveyFromClass(testCase, expect, assignPostData, function(error) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error unassigning survey from class");
								return done(error);
							}

							done();
						});
					});
				})
			});
		});
	});

	it('Should update a survey\'s info', function(done) {
		var testCase = "Should update a survey's info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupSurvey(testCase, function(error, surveyInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up survey");
				return done(error);
			}

			surveyPostData.survey_id = surveyInfo.survey_id;
			var diffSurveyPostData = surveyPostData;
			diffSurveyPostData.survey_name = "This is a different test survey name";

			surveyFunctions.getSurveyList(testCase, function(error, surveyList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting surveyList");
					return done(error);
				}

				var surveyDBInfo = surveyFunctions.surveyExists(diffSurveyPostData.survey_name, surveyList);
				var expect = (surveyDBInfo.surveyExists) ? 500 : 200;

				surveyFunctions.updateSurveyInfo(testCase, expect, diffSurveyPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error changing survey info");
						return done(error);
					}

					done();
				});
			});
		});
	});

	

});
