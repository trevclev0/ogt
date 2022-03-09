var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var logger = require('../logger.js');
var config = require('../config.js');
var port = config.port;

var url = 'http://localhost:' + port;

module.exports = {

	"getUserInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/getUserInfo')
		.send(postData)
		.expect(expect)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var error = "";
			var userExists = false;
			var userInfo = {};

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getUserInfo: " + error);
				return callback(error, userExists, userInfo);
			}

			res.body.should.have.property("error");

			if(res.body.error == "") {
				userExists = true;
				userInfo = res.body.userInfo;
			}

			callback(error, userExists, userInfo);
		});
	},

	"getUserList" : function(testCase, callback) {
		request(url)
		.post('/api/user/getUserList')
		.send()
		.expect(200)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var userList = {};
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function getUserList: " + err);
				return callback(error, userList);
			}

			res.body.should.have.property("userList");
			userList = res.body.userList;

			callback(error, userList);
		});
	},

	"updateUserInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/updateUserInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateUserInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"updateProfilePicture" : function(testCase, expect, postData, filename, callback) {
		request(url)
		.post('/api/user/updateProfilePicture')
		.field('user_username', postData.user_username)
		.attach('profile_picture', filename)
		.expect(expect)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateProfilePicture: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"addUser" : function(testCase, expect, postData, callback) {
		expect = (expect == 200) ? 302 : expect; // On success it redirects, and doesn't retun a 200 success
		var expectedContentType = (expect == 302) ? 'text/plain; charset=UTF-8' : 'application/json; charset=utf-8';

		request(url)
		.post('/api/user/addUser')
		.send(postData)
		.expect('Content-Type', expectedContentType)
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addUser: " + error);
				return callback(error);
			}

			callback(error);
		});
	},

	"deactivateUser" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/deactivateUser')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateUser: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"reactivateUser" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/reactivateUser')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateUser: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"addAddress" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/addAddress')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addAddress: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"deactivateAddress" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/deactivateAddress')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateAddress: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"reactivateAddress" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/reactivateAddress')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateAddress: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"updateAddressInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/updateAddressInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateAddressInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"addBilling" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/addBilling')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function addBilling: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"deactivateBilling" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/deactivateBilling')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function deactivateBilling: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"reactivateBilling" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/reactivateBilling')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function reactivateBilling: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"updateBillingInfo" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/updateBillingInfo')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function updateBillingInfo: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"login" : function(testCase, expect, postData, callback) {
		request(url)
		.post('/api/user/login')
		.send(postData)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(expect)
		.end(function(err, res) {
			var error = "";

			if(err) {
				error = err;
				logger.error("Error in test case '" + testCase + "' function login: " + error);
				return callback(error);
			}

			res.body.should.have.property("error");

			callback(error);
		});
	},

	"userExists" : function(username, userList) {
		var userExists = false;
		var retUser = [];

		for(user in userList) {
			if(userList[user].user_username == username) {
				userExists = true;
				retUser = userList[user];
				break;
			}
		}

		return {"userExists" : userExists, "userInfo" : retUser};
	},

	"addressExists" : function(addressInfo, addressList) {
		var addressExists = false;
		var retAddr = [];

		for(address in addressList) {
			if(	addressList[address].user_addr_street == addressInfo.user_addr_street && 
				addressList[address].user_addr_city == addressInfo.user_addr_city &&
				addressList[address].user_addr_state == addressInfo.user_addr_state && 
				addressList[address].user_addr_zip == addressInfo.user_addr_zip) {
				
				addressExists = true;
				retAddr = addressList[address];
				break;
			}
		}

		return {"addressExists" : addressExists, "addressInfo" : retAddr};
	},

	"billingExists" : function(billingInfo, billingList) {
		var billingExists = false;
		var retBilling = [];

		for(billing in billingList) {
			var fixedDate = padDate(new Date(billingList[billing].billing_cc_exp));
			if(	billingList[billing].billing_cc == billingInfo.billing_cc && 
				fixedDate == billingInfo.billing_cc_exp && 
				billingList[billing].billing_cc_type == billingInfo.billing_cc_type) {
				
				billingExists = true;
				retBilling = billingList[billing];
				break;
			}
		}

		return {"billingExists" : billingExists, "billingInfo" : retBilling};
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