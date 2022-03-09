var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

var logger = require('../logger.js');
var mediaFunctions = require('./mediaFunctions.js');
var setupFunctions = require('./setupFunctions.js');

var mediaPostData = {
		"media_id" : 0,
		"media_name" : "Test Presentation 1",
		"media_path" : "Test Presentation 1/1.jpg",
		"media_length" : 3
	};
var mediaExists = false;
var mediaList = {};

var testPresentationFile = "test/presentations/Test Presentation 1.pdf";
var testPresentationName = "Test Presentation 1";

describe('Media Management Suite -', function() {

	before(function(done) {
		var testCase = "before";
		done();
	});

	it('Should get media info', function(done) {
		var testCase = "Should get media info";
		logger.info("Running test case: '" + testCase + "'");

		mediaFunctions.getMediaList(testCase, function(error, mediaList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting mediaList");
				return done(error);
			}

			var mediaDBInfo = mediaFunctions.mediaExists(testPresentationName, mediaList);
			var expect = (!mediaDBInfo.mediaExists) ? 500 : 200;
			mediaFunctions.getMediaInfo(testCase, expect, mediaPostData, function(error, mediaInfo) {
				if(error) {
					logger.error("Error in test case '" + testCase + "': " + error);
					return done(error);
				}

				done();
			});
		});
	});
	
	it('Should add a new media', function(done) {
		var testCase = "Should add a new media";
		logger.info("Running test case: '" + testCase + "'");

		mediaFunctions.getMediaList(testCase, function(error, mediaList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting mediaList");
				return done(error);
			}

			var mediaDBInfo = mediaFunctions.mediaExists(testPresentationName, mediaList);
			var expect = (mediaDBInfo.mediaExists) ? 500 : 200;
			mediaFunctions.addMedia(testCase, expect, testPresentationFile, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding new media");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should deactivate a media', function(done) {
		var testCase = "Should deactivate a media";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMedia(testCase, function(error, mediaInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up media");
				return done(error);
			}

			var expect = 200;
			mediaFunctions.deactivateMedia(testCase, expect, mediaPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating media");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should reactivate a media', function(done) {
		var testCase = "Should reactivate a media";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMedia(testCase, function(error, mediaInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up media");
				return done(error);
			}

			var expect = 200;
			mediaFunctions.deactivateMedia(testCase, expect, mediaPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating media");
					return done(error);
				}

				mediaFunctions.reactivateMedia(testCase, expect, mediaPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error activating media");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should update a media\'s info', function(done) {
		var testCase = "Should update a media's info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupMedia(testCase, function(error, mediaInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up media");
				return done(error);
			}

			mediaFunctions.getMediaList(testCase, function(error, mediaList) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error getting mediaList");
					return done(error);
				}

				var updatePostData = {
					"media_name" : "Test Presentation 1",
					"new_media_name" : "Changed Presentation 1"
				}

				var mediaDBInfo = mediaFunctions.mediaExists(updatePostData.media_name, mediaList);
				var mediaDBInfo2 = mediaFunctions.mediaExists(updatePostData.new_media_name, mediaList);

				var expect = (mediaDBInfo.mediaExists && !mediaDBInfo2.mediaExists) ? 200 : 500; // Careful, these codes are reversed due to the conditional
				mediaFunctions.updateMediaInfo(testCase, expect, updatePostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error changing media info");
						return done(error);
					}

					done();
				});
			});
		});
	});

	it('Should assign a media to a class session', function(done) {
		var testCase = "Should assign a media to a class session";
		logger.info("Running test case: '" + testCase + "'");
			
		setupFunctions.setupUserClassAndSession(testCase, function(error, userInfo, classInfo, classSessionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up class and session");
				return done(error);
			}

			setupFunctions.setupMedia(testCase, function(error, mediaInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error setting up media");
					return done(error);
				}

				var assignPostData = {
					"class_session_id" : classSessionInfo.class_session_id,
					"media_id" : mediaInfo.media_id
				}

				mediaFunctions.getAssignedMediaList(testCase, function(error, assignedMediaList) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting assigned media list");
						return done(error);
					}

					var mediaAssigned = false;
					for(assignedMedia in assignedMediaList) {
						if(assignedMediaList[assignedMedia].class_session_id == assignPostData.class_session_id &&
							assignedMediaList[assignedMedia].media_id == assignPostData.media_id) {

							mediaAssigned = true;
							break;
						}
					}

					expect = (mediaAssigned) ? 500 : 200;
					mediaFunctions.assignMediaToSession(testCase, expect, assignPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error assigning media to session");
							return done(error);
						}

						done();
					});
				});
			});
		});
	});

it('Should unassign a media from a class session', function(done) {
		var testCase = "Should unassign a media from a class session";
		logger.info("Running test case: '" + testCase + "'");
			
		setupFunctions.setupUserClassAndSession(testCase, function(error, userInfo, classInfo, classSessionInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up class and session");
				return done(error);
			}

			setupFunctions.setupMedia(testCase, function(error, mediaInfo) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error setting up media");
					return done(error);
				}

				var assignPostData = {
					"class_session_id" : classSessionInfo.class_session_id,
					"media_id" : mediaInfo.media_id
				}

				mediaFunctions.getAssignedMediaList(testCase, function(error, assignedMediaList) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error getting assigned media list");
						return done(error);
					}

					var mediaAssigned = false;
					for(assignedMedia in assignedMediaList) {
						if(assignedMediaList[assignedMedia].class_session_id == assignPostData.class_session_id &&
							assignedMediaList[assignedMedia].media_id == assignPostData.media_id) {

							mediaAssigned = true;
							break;
						}
					}

					expect = (mediaAssigned) ? 500 : 200;
					mediaFunctions.assignMediaToSession(testCase, expect, assignPostData, function(error) {
						if(error) {
							logger.error("Test case: '" + testCase + "'. Error assigning media to session");
							return done(error);
						}

						expect = 200;
						mediaFunctions.unassignMediaFromSession(testCase, expect, assignPostData, function(error) {
							if(error) {
								logger.error("Test case: '" + testCase + "'. Error unassigning media from session");
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
