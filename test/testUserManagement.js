var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

var logger = require('../logger.js');
var classFunctions = require('./classFunctions.js');
var setupFunctions = require('./setupFunctions.js');
var userFunctions = require('./userFunctions.js');

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

describe('User Management Suite -', function() {

	before(function(done) {
		var testCase = "before";
		done();
	});
	
	it('Should add a new user', function(done) {
		var testCase = "Should add a new user";
		logger.info("Running test case: '" + testCase + "'");

		userFunctions.getUserList(testCase, function(error, userList) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error getting user list");
				return done(error);
			}

			// Get the users info and see if it exists
			var userDBInfo = userFunctions.userExists(userPostData.user_username, userList);
			var expect = (userDBInfo.userExists) ? 500 : 200;
			userFunctions.addUser(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding user");
					return done(error);
				}

				done();
			});	
		});
	});

	it('Should deactivate a user', function(done) {
		var testCase = "Should deactivate a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error adding user");
				return done(error);
			}

			var expect = 200;
			userFunctions.deactivateUser(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating user");
					return done(error);
				}

				done();
			});
		});	
	});

	it('Should reactivate a user', function(done) {
		var testCase = "Should reactivate a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error adding user");
				return done(error);
			}

			var expect = 200;
			userFunctions.deactivateUser(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating user");
					return done(error);
				}

				userFunctions.reactivateUser(testCase, expect, userPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error activating user");
						return done(error);
					}

					done();
				});
			});
		});	
	});

	it('Should update a user\'s info', function(done) {
		var testCase = "Should update a user's info";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error adding user");
				return done(error);
			}

			var diffUserPostData = userPostData;
			diffUserPostData.user_first_name = "Testing";
			diffUserPostData.user_last_name = "Automated";
			diffUserPostData.user_email = "test@automated.com";
			diffUserPostData.user_bio = "I'm making sure this update works!";

			var expect = 200;
			userFunctions.updateUserInfo(testCase, expect, diffUserPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error changing user info");
					return done(error);
				}

				done();
			});
		});	
	});

	it('Should update a user\'s profile picture', function(done) {
		var testCase = "Should update a user's profile picture";
		logger.info("Running test case: '" + testCase + "'");

		var testProfilePicture = "test/images/testProfileImage.jpg";

		setupFunctions.setupUser(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error adding user");
				return done(error);
			}

			var expect = 200;
			userFunctions.updateProfilePicture(testCase, expect, userPostData, testProfilePicture, function(error) {
				if(error) {
					logger.error("Error in test case '" + testCase + "': " + error);
					return done(error);
				}

				done();
			});	
		});	
	});

	it('Should add an address for a user', function(done) {
		var testCase = "Should add an address for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user");
				return done(error);
			}

			addressPostData.user_id = userInfo.user_id;
			var addressDBInfo = userFunctions.addressExists(addressPostData, userInfo.addresses);
			var expect = (addressDBInfo.addressExists) ? 500 : 200;
			userFunctions.addAddress(testCase, expect, addressPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding an address for a user");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should deactivate an address for a user', function(done) {
		var testCase = "Should deactivate an address for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndAddress(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and address");
				return done(error);
			}

			addressPostData.user_id = userInfo.user_id;
			var addressDBInfo = userFunctions.addressExists(addressPostData, userInfo.addresses);
			addressPostData.user_addr_id = addressDBInfo.addressInfo.user_addr_id;

			var expect = 200;
			userFunctions.deactivateAddress(testCase, expect, addressPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating an address for a user");
					return done(error);
				}
			
				done();
			});
		});
	});

	it('Should reactivate an address for a user', function(done) {
		var testCase = "Should reactivate an address for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndAddress(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and address");
				return done(error);
			}

			addressPostData.user_id = userInfo.user_id;
			var addressDBInfo = userFunctions.addressExists(addressPostData, userInfo.addresses);
			addressPostData.user_addr_id = addressDBInfo.addressInfo.user_addr_id;

			var expect = 200;
			userFunctions.deactivateAddress(testCase, expect, addressPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating an address for a user");
					return done(error);
				}
			
				userFunctions.reactivateAddress(testCase, expect, addressPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error reactivating an address for a user");
						return done(error);
					}
				
					done();
				});
			});
		});
	});

	it('Should update an address for a user', function(done) {
		var testCase = "Should update an address for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndAddress(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and address");
				return done(error);
			}

			var addressDBInfo = userFunctions.addressExists(addressPostData, userInfo.addresses);
			addressPostData.user_addr_id = addressDBInfo.addressInfo.user_addr_id;

			var diffAddressPostData = addressPostData;
			diffAddressPostData.user_addr_street = "123 Testing Ave";
			diffAddressPostData.user_addr_city = "Provo";
			diffAddressPostData.user_addr_state = "UT";
			diffAddressPostData.user_addr_zip = "84606";
			diffAddressPostData.user_addr_is_billing = 0;

			var addressDBInfo = userFunctions.addressExists(diffAddressPostData, userInfo.addresses);
			expect = (addressDBInfo.addressExists) ? 500 : 200;
			userFunctions.updateAddressInfo(testCase, expect, diffAddressPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error updating address info for a user");
					return done(error);
				}
			
				done();
			});
		});
	});

	it('Should add billing info for a user', function(done) {
		var testCase = "Should add billing info for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user");
				return done(error);
			}

			var billingDBInfo = userFunctions.billingExists(billingPostData, userInfo.billing);
			billingPostData.user_id = userInfo.user_id;

			var expect = (billingDBInfo.billingExists) ? 500 : 200;
			userFunctions.addBilling(testCase, expect, billingPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error adding billing info for a user");
					return done(error);
				}

				done();
			});
		});
	});

	it('Should deactivate billing info for a user', function(done) {
		var testCase = "Should deactivate billing info for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndBilling(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and billing info");
				return done(error);
			}

			var billingDBInfo = userFunctions.billingExists(billingPostData, userInfo.billing);
			billingPostData.billing_id = billingDBInfo.billingInfo.billing_id;
			billingPostData.user_id = userInfo.user_id;

			var expect = 200;
			userFunctions.deactivateBilling(testCase, expect, billingPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating billing info for a user");
					return done(error);
				}
			
				done();
			});
		});
	});

	it('Should reactivate billing info for a user', function(done) {
		var testCase = "Should reactivate billing info for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndBilling(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and billing info");
				return done(error);
			}

			var billingDBInfo = userFunctions.billingExists(billingPostData, userInfo.billing);
			billingPostData.billing_id = billingDBInfo.billingInfo.billing_id;
			billingPostData.user_id = userInfo.user_id;

			var expect = 200;
			userFunctions.deactivateBilling(testCase, expect, billingPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error deactivating billing info for a user");
					return done(error);
				}
			
				userFunctions.reactivateBilling(testCase, expect, billingPostData, function(error) {
					if(error) {
						logger.error("Test case: '" + testCase + "'. Error reactivating billing info for a user");
						return done(error);
					}
				
					done();
				});
			});
		});
	});

	it('Should update billing info for a user', function(done) {
		var testCase = "Should update billing info for a user";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUserAndBilling(testCase, function(error, userExists, userInfo) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error setting up user and billing");
				return done(error);
			}

			var billingDBInfo = userFunctions.billingExists(billingPostData, userInfo.billing);
			billingPostData.billing_id = billingDBInfo.billingInfo.billing_id;
			billingPostData.user_id = userInfo.user_id;

			var diffBillingPostData = billingPostData;
			diffBillingPostData.billing_cc = "8765432187654321";
			diffBillingPostData.billing_cc_exp = classFunctions.getDatePlusDays(730);
			diffBillingPostData.billing_cc_type = "MasterCard";

			var billingDBInfo = userFunctions.billingExists(diffBillingPostData, userInfo.billing);
			var expect = (billingDBInfo.billingExists) ? 500 : 200;
			userFunctions.updateBillingInfo(testCase, expect, diffBillingPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error updating billing info for a user");
					return done(error);
				}
			
				done();
			});
		});
	});

	it('Should log a user in', function(done) {
		var testCase = "Should log a user in";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error adding user");
				return done(error);
			}

			var expect = 200;
			userFunctions.login(testCase, expect, userPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error logging a user in");
					return done(error);
				}

				done();
			});
		});	
	});

	it('Should get a login error', function(done) {
		var testCase = "Should get a login error";
		logger.info("Running test case: '" + testCase + "'");

		setupFunctions.setupUser(testCase, function(error) {
			if(error) {
				logger.error("Test case: '" + testCase + "'. Error adding user");
				return done(error);
			}

			var diffUserPostData = userPostData;
			diffUserPostData.user_password = "ThisIsABadPassword";

			var expect = 500;
			userFunctions.login(testCase, expect, diffUserPostData, function(error) {
				if(error) {
					logger.error("Test case: '" + testCase + "'. Error logging a user in");
					return done(error);
				}

				done();
			});
		});	
	});

});
