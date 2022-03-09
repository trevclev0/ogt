/* User Management */
var userDAO = require('../db/userDAO.js');
var logger = require('../logger.js');
var fs = require('fs');

var STATUS_SUCCESS = 200;
var STATUS_FAILURE = 500;

module.exports = function(app) {

	app.post("/api/user/getUserList", function(req, res) {
		var endpoint = 'getUserList';
		logger.info("Hit endpoint: '" + endpoint + "'");

		userDAO.getUserList(function(err, userList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "userList": userList});
		});
	});

	app.post("/api/user/getUserInfo", function(req, res) {
		var endpoint = 'getUserInfo';
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_username = req.body.user_username;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_username: " + user_username);

		userDAO.getUserInfo(user_username, function(err, userInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "userInfo": userInfo});
		});
	});

	app.post("/api/user/addUser", function(req, res) {
		var endpoint = "addUser";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_first_name = req.body.user_first_name;
		var user_last_name = req.body.user_last_name;
		var user_email = req.body.user_email;
		var user_username = req.body.user_username;
		var user_password = req.body.user_password;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_first_name: " + user_first_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_last_name: " + user_last_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_email: " + user_email);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_username: " + user_username);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_password: " + user_password);

		var userInfo = {
				"user_first_name" : user_first_name,
				"user_last_name" : user_last_name,
				"user_email" : user_email,
				"user_username" : user_username,
				"user_password" : user_password
			};

		userDAO.addUser(userInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
				res.send({"error" : err});
			} else {
				res.status(STATUS_SUCCESS);
				res.redirect('/auth/local?username=' + user_username + '&password=' + user_password);
			}
		});
	});

	app.post("/api/user/deactivateUser", function(req, res) {
		var endpoint = "deactivateUser";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var user_username = req.body.user_username;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_username: " + user_username);

		userDAO.deactivateUser(user_username, user_id, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/reactivateUser", function(req, res) {
		var endpoint = "reactivateUser";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var user_username = req.body.user_username;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_username: " + user_username);

		userDAO.reactivateUser(user_username, user_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	/*
		This endpoint supports updating the following fields:
		- user_first_name
		- user_last_name
		- user_email
		- user_type
		- user_bio
		- user_password

		The following fields never change:
		- user_id
		- user_username
		- user_login_provider
	*/
	app.post("/api/user/updateUserInfo", function(req, res) {
		var endpoint = "updateUserInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var userInfo = {};
		var user_username = req.body.user_username;

		if(typeof req.body.user_first_name != 'undefined') {userInfo.user_first_name = req.body.user_first_name;}
		if(typeof req.body.user_last_name != 'undefined') {userInfo.user_last_name = req.body.user_last_name;}
		if(typeof req.body.user_email != 'undefined') {userInfo.user_email = req.body.user_email;}
		if(typeof req.body.user_type != 'undefined') {userInfo.user_type = req.body.user_type;}
		if(typeof req.body.user_bio != 'undefined') {userInfo.user_bio = req.body.user_bio;}
		if(typeof req.body.user_password != 'undefined') {userInfo.user_password = req.body.user_password;}

		logger.debug("Endpoint: '" + endpoint + "'. Received username: " + user_username);
		
		logger.debug("Endpoint: '" + endpoint + "'. Received user_first_name: " + userInfo.user_first_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_last_name: " + userInfo.user_last_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_email: " + userInfo.user_email);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_type: " + userInfo.user_type);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_bio: " + userInfo.user_bio);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_password: " + userInfo.user_password);

		userDAO.updateUserInfo(user_username, userInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/updateProfilePicture", function(req, res) {
		var endpoint = "updateProfilePicture";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_username = req.body.user_username;

		logger.debug("Received files: " + JSON.stringify(req.files));

		for(file in req.files) { // Should only be one file, but looping makes it easy to get the info from req.files
			var fileName = req.files[file].name;
			var finalPath = 'public/profileImages/' + user_username + '.jpg';
			var DBPath = 'profileImages/' + user_username + '.jpg';

			fs.rename(req.files[file].path, finalPath, function(err) {
				if(err) {
					error = err;
					logger.error("Error moving temporary uploaded file to permanent destination. " + error);
					res.status(STATUS_FAILURE);
					return res.send({"error" : error});
				}

				userDAO.updateProfilePicture(user_username, DBPath, function(err) {
					if(err) {
						logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
						res.status(STATUS_FAILURE);
					} else {
						res.status(STATUS_SUCCESS);
					}

					res.send({"error" : err});
				});
			});
		}
	});

	app.post("/api/user/addAddress", function(req, res) {
		var endpoint = "addAddress";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var user_addr_street = req.body.user_addr_street;
		var user_addr_city = req.body.user_addr_city;
		var user_addr_state = req.body.user_addr_state;
		var user_addr_zip = req.body.user_addr_zip;
		var user_addr_is_billing = req.body.user_addr_is_billing;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_street: " + user_addr_street);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_city: " + user_addr_city);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_state: " + user_addr_state);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_zip: " + user_addr_zip);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_is_billing: " + user_addr_is_billing);

		var addressInfo = {
			"user_id" : user_id,
			"user_addr_street" : user_addr_street,
			"user_addr_city" : user_addr_city,
			"user_addr_state" : user_addr_state,
			"user_addr_zip" : user_addr_zip,
			"user_addr_is_billing" : user_addr_is_billing
		};

		userDAO.addAddress(addressInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/deactivateAddress", function(req, res) {
		var endpoint = "deactivateAddress";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var user_addr_id = req.body.user_addr_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_id: " + user_addr_id);

		userDAO.deactivateAddress(user_id, user_addr_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/reactivateAddress", function(req, res) {
		var endpoint = "reactivateAddress";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var user_addr_id = req.body.user_addr_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_id: " + user_addr_id);

		userDAO.reactivateAddress(user_id, user_addr_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	/*
		This endpoint supports updating the following fields:
		- user_addr_street
		- user_addr_city
		- user_addr_state
		- user_addr_zip
		- user_addr_is_billing

		The following fields never change:
		- user_addr_id
		- user_id
	*/
	app.post("/api/user/updateAddressInfo", function(req, res) {
		var endpoint = "updateAddressInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var addressInfo = {};
		var user_addr_id = req.body.user_addr_id;
		var user_id = req.body.user_id;

		if(typeof req.body.user_addr_street != 'undefined') {addressInfo.user_addr_street = req.body.user_addr_street;}
		if(typeof req.body.user_addr_city != 'undefined') {addressInfo.user_addr_city = req.body.user_addr_city;}
		if(typeof req.body.user_addr_state != 'undefined') {addressInfo.user_addr_state = req.body.user_addr_state;}
		if(typeof req.body.user_addr_zip != 'undefined') {addressInfo.user_addr_zip = req.body.user_addr_zip;}
		if(typeof req.body.user_addr_is_billing != 'undefined') {addressInfo.user_addr_is_billing = req.body.user_addr_is_billing;}

		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_id: " + user_addr_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_street: " + addressInfo.user_addr_street);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_city: " + addressInfo.user_addr_city);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_state: " + addressInfo.user_addr_state);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_zip: " + addressInfo.user_addr_zip);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_addr_is_billing: " + addressInfo.user_addr_is_billing);

		userDAO.updateAddressInfo(user_addr_id, user_id, addressInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/addBilling", function(req, res) {
		var endpoint = "addBilling";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var billing_cc = req.body.billing_cc;
		var billing_cc_exp = req.body.billing_cc_exp;
		var billing_cc_type = req.body.billing_cc_type;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_cc: " + billing_cc);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_cc_exp: " + billing_cc_exp);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_cc_type: " + billing_cc_type);

		var billingInfo = {
			"user_id" : user_id,
			"billing_cc" : billing_cc,
			"billing_cc_exp" : billing_cc_exp,
			"billing_cc_type" : billing_cc_type
		};

		userDAO.addBilling(billingInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/deactivateBilling", function(req, res) {
		var endpoint = "deactivateBilling";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var billing_id = req.body.billing_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_id: " + billing_id);

		userDAO.deactivateBilling(user_id, billing_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/reactivateBilling", function(req, res) {
		var endpoint = "reactivateBilling";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_id = req.body.user_id;
		var billing_id = req.body.billing_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_id: " + billing_id);

		userDAO.reactivateBilling(user_id, billing_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	/*
		This endpoint supports updating the following fields:
		- billing_cc
		- billing_cc_exp
		- billing_cc_type

		The following fields never change:
		- billing_id
		- user_id
	*/
	app.post("/api/user/updateBillingInfo", function(req, res) {
		var endpoint = "updateBillingInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var billingInfo = {};
		var billing_id = req.body.billing_id;
		var user_id = req.body.user_id;

		if(typeof req.body.billing_cc != 'undefined') {billingInfo.billing_cc = req.body.billing_cc;}
		if(typeof req.body.billing_cc_exp != 'undefined') {billingInfo.billing_cc_exp = req.body.billing_cc_exp;}
		if(typeof req.body.billing_cc_type != 'undefined') {billingInfo.billing_cc_type = req.body.billing_cc_type;}

		logger.debug("Endpoint: '" + endpoint + "'. Received billing_id: " + billing_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_cc: " + billingInfo.billing_cc);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_cc_exp: " + billingInfo.billing_cc_exp);
		logger.debug("Endpoint: '" + endpoint + "'. Received billing_cc_type: " + billingInfo.billing_cc_type);

		userDAO.updateBillingInfo(billing_id, user_id, billingInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/user/login", function(req, res) {
		var endpoint = "login";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var user_username = req.body.user_username;
		var user_password = req.body.user_password;
		
		logger.debug("Endpoint: '" + endpoint + "'. Received user_username: " + user_username);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_password: " + user_password);

		userDAO.login(user_username, user_password, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});
}