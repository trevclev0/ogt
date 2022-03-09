var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');


var logger = require('../logger.js');
var classFunctions = require('./classFunctions.js');
var setupFunctions = require('./setupFunctions.js');

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

describe('Class Management Suite -', function() { // Test suite

	before(function(done) {
		var testCase = "before";
		done();
	});

	it('Should get the class list', function(done) {
		var testCase = "Should get the class list";
		logger.info("Running test case: '" + testCase + "'");

		classFunctions.getClassList(testCase, function(error, classList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting class list");
				return done(error);
			}

			done();
		});
	});

	it('Should get the class info', function(done) {
		var testCase = "Should get the class info";
		logger.info("Running test case: '" + testCase + "'");

		classFunctions.getClassList(testCase, function(error, classList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting class list");
				return done(error);
			}

			var classDBInfo = classFunctions.classExists(classPostData.class_name, classList);
			var expect = (!classDBInfo.classExists) ? 500 : 200;

			classFunctions.getClassInfo(testCase, expect, classPostData, function(error, classInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting class info");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should create a new class', function(done) {
		var testCase = "Should create a new class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user");
				return done(error);
			}

			classPostData.therapist_id = userInfo.user_id;

			classFunctions.getClassList(testCase, function(error, classList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting class list");
					return done(error);
				}

				var classDBInfo = classFunctions.classExists(classPostData.class_name, classList);
				var expect = (classDBInfo.classExists) ? 500 : 200;
				
				classFunctions.addClass(testCase, expect, classPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error adding a class");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should deactivate a class', function(done) {
		var testCase = "Should deactivate a class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			var expect = 200;
			classFunctions.deactivateClass(testCase, expect, classPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating a class");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should reactivate a class', function(done) {
		var testCase = "Should reactivate a class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			var expect = 200;
			classFunctions.deactivateClass(testCase, expect, classPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating a class");
					return done(error);
				}

				classFunctions.reactivateClass(testCase, expect, classPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error reactivating a class");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should update a class\' info', function(done) {
		var testCase = "Should update a class's info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			classPostData.class_id = classInfo.class_id;
			var diffClassPostData = classPostData;
			diffClassPostData.new_class_name = "This is a different test class name";
			diffClassPostData.therapist_id = userInfo.user_id;
			diffClassPostData.class_size = "10";
			diffClassPostData.class_start_date = classFunctions.getDatePlusDays(60);
			diffClassPostData.class_end_date = classFunctions.getDatePlusDays(90);

			classFunctions.getClassList(testCase, function(error, classList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting classList");
					return done(error);
				}

				var classDBInfo = classFunctions.classExists(diffClassPostData.new_class_name, classList);
				var expect = (classDBInfo.classExists) ? 500 : 200;

				classFunctions.updateClassInfo(testCase, expect, diffClassPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error changing class info");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should register for a class', function(done) {
		var testCase = "Should register for a class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			var registerPostData = {
				"class_id" : classInfo.class_id,
				"user_id" : userInfo.user_id
			}

			classFunctions.getRegistrationList(testCase, registerPostData, function(error, registrationList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting registrationList");
					return done(error);
				}

				var expect = (classFunctions.isRegistered(registerPostData.class_id, registerPostData.user_id, registrationList)) ? 500 : 200;
				classFunctions.register(testCase, expect, registerPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error registering for a class");
						return done(error);
					}

					done();
				});	
			});
		});
	});

	it('Should unregister from a class', function(done) {
		var testCase = "Should unregister from a class";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			var registerPostData = {
				"class_id" : classInfo.class_id,
				"user_id" : userInfo.user_id
			}

			classFunctions.getRegistrationList(testCase, registerPostData, function(error, registrationList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting registrationList");
					return done(error);
				}

				var expect = (classFunctions.isRegistered(registerPostData.class_id, registerPostData.user_id, registrationList)) ? 500 : 200;
				classFunctions.register(testCase, expect, registerPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error registering for a class");
						return done(error);
					}

					expect = 200;
					classFunctions.unregister(testCase, expect, registerPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error unregistering from a class");
							return done(error);
						}

						done();
					})
				});	
			});
		});
	});

	it('Should get class session info', function(done) {
		var testCase = "Should get class session info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			classFunctions.getClassSessionList(testCase, sessionPostData, function(error, classSessionList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting class session list");
					return done(error);
				}

				var classSessionDBInfo = classFunctions.classSessionExists(sessionPostData.class_session_name, classSessionList);
				var expect = (!classSessionDBInfo.classSessionExists) ? 500 : 200;
				classFunctions.getClassSessionInfo(testCase, expect, sessionPostData, function(error, classSessionInfo) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting class session info");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should create a class session', function(done) {
		var testCase = "Should create a class session";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndClass(testCase, function(error, userInfo, classInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and class");
				return done(error);
			}

			sessionPostData.class_id = 0; // Just get all of the sessions, instead of limiting by class_id
			
			classFunctions.getClassSessionList(testCase, sessionPostData, function(error, classSessionList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting class session list");
					return done(error);
				}

				var classSessionDBInfo = classFunctions.classSessionExists(sessionPostData.class_session_name, classSessionList);
				sessionPostData.class_id = classInfo.class_id;
				var expect = (classSessionDBInfo.classSessionExists) ? 500 : 200;
				classFunctions.addClassSession(testCase, expect, sessionPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error adding a class session");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should deactivate a class session', function(done) {
		var testCase = "Should deactivate a class session";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserClassAndSession(testCase, function(error, userInfo, classInfo, classSessionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user, class, and session");
				return done(error);
			}

			var expect = 200;
			classFunctions.deactivateClassSession(testCase, expect, sessionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating a class session");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should reactivate a class session', function(done) {
		var testCase = "Should reactivate a class session";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserClassAndSession(testCase, function(error, userInfo, classInfo, classSessionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user, class, and session");
				return done(error);
			}

			var expect = 200;
			classFunctions.deactivateClassSession(testCase, expect, sessionPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating a class session");
					return done(error);
				}

				classFunctions.reactivateClassSession(testCase, expect, sessionPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error reactivating a class session");
						return done(error);
					}

					done();
				});
			});
		});
	});
});