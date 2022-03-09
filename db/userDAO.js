var mysql = require('mysql');
var fs = require('fs');
var logger = require('../logger.js');
var connection = require('./dbConnection.js').createConnection();
var helperFunctions = require('./helperFunctions.js');

// Make the functions available in another file as a require
module.exports = {

	"getUserList" : function(callback) {
		var functionName = 'getUserList';
		var error = "";
		var userList = {};

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
			}

			callback(error, userList);
		});
	},

	"getUserInfo" : function (user_username, callback) {
		var functionName = 'getUserInfo';
		var error = "";
		var userInfo = {};

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error, userInfo);
			} else {
				if(helperFunctions.objectExists({"user_username" : user_username}, userList)) {
					for(user in userList) {
						if(userList[user].user_username == user_username) {
							userInfo = userList[user];
							break;
						}
					}

					// Get the address information
					var queryString = "SELECT ad.user_addr_id AS user_addr_id, ad.user_addr_street AS user_addr_street" + 
										", ad.user_addr_city AS user_addr_city, ad.user_addr_state AS user_addr_state" + 
										", ad.user_addr_zip AS user_addr_zip, ad.user_addr_is_billing AS user_addr_is_billing" +
										" FROM user_addrs ad" + 
										" JOIN user_info u ON (u.user_id = ad.user_id)" + 
										" WHERE u.user_username = " + mysql.escape(user_username);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem getting address info. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						}

						userInfo.addresses = [];
						if(result.length != 0) {
							for(address in result) {
								userInfo.addresses.push({
									"user_addr_id" : result[address].user_addr_id,
									"user_addr_street" : result[address].user_addr_street,
									"user_addr_city" : result[address].user_addr_city,
									"user_addr_state" : result[address].user_addr_state,
									"user_addr_zip" : result[address].user_addr_zip,
									"user_addr_is_billing" : result[address].user_addr_is_billing
								});
							}
						}

						// Get the billing information
						queryString = "SELECT b.billing_id AS billing_id, b.billing_cc AS billing_cc" + 
										", b.billing_cc_exp AS billing_cc_exp, b.billing_cc_type AS billing_cc_type" + 
										" FROM user_billing b" + 
										" JOIN user_info u ON (u.user_id = b.user_id)" + 
										" WHERE u.user_username = " + mysql.escape(user_username);

						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem getting billing info. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
							}

							userInfo.billing = [];
							if(result.length != 0) {
								for(billing in result) {
									userInfo.billing.push({
										"billing_id" : result[billing].billing_id,
										"billing_cc" : result[billing].billing_cc,
										"billing_cc_exp" : result[billing].billing_cc_exp,
										"billing_cc_type" : result[billing].billing_cc_type
									});
								}
							}

							callback(error, userInfo);
						});
					});
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error, userInfo);
				}
			}
		});
	},

	"addUser" : function (userInfo, callback) {
		var functionName = "addUser";
		var error = "";
		logger.info(JSON.stringify(userInfo));
		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(err);
			} else {
				if(!helperFunctions.objectExists({"user_username" : userInfo.user_username}, userList)) {
					if(typeof userInfo.user_profile_picture == 'undefined') {userInfo.user_profile_picture = "profileImages/default.png";}
					if(typeof userInfo.user_login_provider == 'undefined') {userInfo.user_login_provider = "Local";}

					var queryString = "INSERT INTO user_info"
						+ " (user_first_name, user_last_name, user_email, user_profile_picture, user_username, user_password, user_login_provider) VALUES ("
						+ mysql.escape(userInfo.user_first_name) + ", " + mysql.escape(userInfo.user_last_name)
						+ ", " + mysql.escape(userInfo.user_email) + ", " + mysql.escape(userInfo.user_profile_picture)
						+ ", " + mysql.escape(userInfo.user_username) + ", " + mysql.escape(userInfo.user_password) + ", " + mysql.escape(userInfo.user_login_provider) + ")";

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem adding user. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Created user " + userInfo.user_first_name + " " + userInfo.user_last_name);
						}

						callback(error);
					});	
				} else { // User already exists
					error = "Error: User already exists.";
					callback(error);
				}
			}
		});
	},

	"deactivateUser" : function(user_username, user_id, callback) {
		var functionName = "deactivateUser";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_username" : user_username}, userList)) {
					var queryString = "UPDATE user_info SET user_status = 'Inactive' WHERE " + 
										"user_id = " + mysql.escape(user_id) + " AND user_username = " + mysql.escape(user_username);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem deactivating user. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Deactivated user " + user_username);
						}

						callback(error);
					});	
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});
	},

	"reactivateUser" : function(user_username, user_id, callback) {
		var functionName = "reactivateUser";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_username" : user_username}, userList)) {
					var queryString = "UPDATE user_info SET user_status = 'Active' WHERE " + 
										"user_id = " + mysql.escape(user_id) + " AND user_username = " + mysql.escape(user_username);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem activating user. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Activated user " + user_username);
						}

						callback(error);
					});	
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});
	},

	"updateUserInfo" : function (user_username, userInfo, callback) {
		var functionName = "updateUserInfo";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_username" : user_username}, userList)) {
					var queryString = "UPDATE user_info SET ";

					// Dynamically create the queryString
					var i = 0;
					for(fieldName in userInfo) {
						if(fieldName == "user_username" || fieldName == "user_id" || fieldName == "user_login_provider") {
							continue; // Invalid field for this function - skip it
						}

						if(i != 0) {
							queryString += ", ";
						}

						queryString += fieldName + " = " + mysql.escape(userInfo[fieldName]);
						i++;
					}

					queryString += " WHERE user_username = " + mysql.escape(user_username);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem updating user info. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Updated user info for user_username: " + user_username);
						}

						callback(error);
					});
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});	
	},

	"updateProfilePicture" : function(user_username, DBPath, callback) {
		var functionName = "updateProfilePicture";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_username" : user_username}, userList)) {
					var queryString = "UPDATE user_info SET user_profile_picture = " + mysql.escape(DBPath) + " WHERE user_username = " + mysql.escape(user_username);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem updating user profile picture. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Updated profile picture for user_username: " + user_username);
						}

						callback(error);
					});
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});	
	},

	"addAddress" : function(addressInfo, callback) {
		var functionName = "addAddress";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				return callback(error);
			} 
				
			if(helperFunctions.objectExists({"user_id" : addressInfo.user_id}, userList)) {
				helperFunctions.getAddressList(addressInfo.user_id, function(err, addressList) {
					if(err) {
						error = err;
						return callback(error);
					}

					if(!helperFunctions.objectExists(addressInfo, addressList)) {
						var queryString = "INSERT INTO user_addrs (`user_id`, `user_addr_street`, `user_addr_city`, " + 
							"`user_addr_state`, `user_addr_zip`, `user_addr_is_billing`) VALUES" + 
							"(" + mysql.escape(addressInfo.user_id) + ", " + mysql.escape(addressInfo.user_addr_street) + 
							", " + mysql.escape(addressInfo.user_addr_city) + ", " + mysql.escape(addressInfo.user_addr_state) + 
							", " + mysql.escape(addressInfo.user_addr_zip) + ", " + mysql.escape(addressInfo.user_addr_is_billing) + ")";
					
						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem inserting address info. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
								return callback(error);
							} 

							logger.info("Function: '" + functionName + "'. Inserted address into database for user_id: " + addressInfo.user_id);

							callback(error);
						});
					} else {
						error = "Error: Address already exists.";
						callback(error);
					}
				});
			} else { // User doesn't exist
				error = "Error: User doesn't exist.";
				callback(error);
			}
		});
	},

	"deactivateAddress" : function(user_id, user_addr_id, callback) {
		var functionName = "deactivateAddress";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				return callback(error);
			} 
				
			if(helperFunctions.objectExists({"user_id" : user_id}, userList)) {
				helperFunctions.getAddressList(user_id, function(err, addressList) {
					if(err) {
						error = err;
						return callback(error);
					}

					if(helperFunctions.objectExists({"user_addr_id" : user_addr_id}, addressList)) {
						var queryString = "UPDATE user_addrs SET user_addr_status = 'Inactive' WHERE user_addr_id = " + mysql.escape(user_addr_id);
					
						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem deactivating address. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
								return callback(error);
							} 

							logger.info("Function: '" + functionName + "'. Deactivated address: " + user_addr_id);

							callback(error);
						});
					} else {
						error = "Error: Address doesn't exist.";
						callback(error);
					}
				});
			} else { // User doesn't exist
				error = "Error: User doesn't exist.";
				callback(error);
			}
		});
	},

	"reactivateAddress" : function(user_id, user_addr_id, callback) {
		var functionName = "reactivateAddress";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				return callback(error);
			} 
				
			if(helperFunctions.objectExists({"user_id" : user_id}, userList)) {
				helperFunctions.getAddressList(user_id, function(err, addressList) {
					if(err) {
						error = err;
						return callback(error);
					}

					if(helperFunctions.objectExists({"user_addr_id" : user_addr_id}, addressList)) {
						var queryString = "UPDATE user_addrs SET user_addr_status = 'Active' WHERE user_addr_id = " + mysql.escape(user_addr_id);
					
						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem activating address. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
								return callback(error);
							} 

							logger.info("Function: '" + functionName + "'. Activated address: " + user_addr_id);

							callback(error);
						});
					} else {
						error = "Error: Address doesn't exist.";
						callback(error);
					}
				});
			} else { // User doesn't exist
				error = "Error: User doesn't exist.";
				callback(error);
			}
		});
	},

	"updateAddressInfo" : function (user_addr_id, user_id, addressInfo, callback) {
		var functionName = "updateAddressInfo";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_id" : user_id}, userList)) {
					helperFunctions.getAddressList(user_id, function(err, addressList) {
						if(err) {
							error = err;
							return callback(error);
						}

						if(helperFunctions.objectExists({"user_addr_id" : user_addr_id}, addressList)) { // Make sure the address is there
							addressInfo.user_id = user_id;
							if(!helperFunctions.objectExists(addressInfo, addressList)) { // Make sure it's not being changed to what is already in the DB
								var queryString = "UPDATE user_addrs SET ";

								// Dynamically create the queryString
								var i = 0;
								for(fieldName in addressInfo) {
									if(i != 0) {
										queryString += ", ";
									}

									queryString += fieldName + " = " + mysql.escape(addressInfo[fieldName]);
									i++;
								}

								queryString += " WHERE user_addr_id = " + mysql.escape(user_addr_id);

								connection.query(queryString, function(err, result) {
									if(err) {
										error = err;
										logger.error("Function: '" + functionName + "'. Problem updating address info. " + error);
										logger.error("Function: '" + functionName + "'. Query: " + queryString);
									} else {
										logger.info("Function: '" + functionName + "'. Updated address info for user_addr_id: " + user_addr_id);
									}

									callback(error);
								});
							} else {
								error = "Error: Address already exists.";
								callback(error);
							}
						} else {
							error = "Error: Address doesn't exist.";
							callback(error);
						}
					});
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});	
	},

	"addBilling" : function(billingInfo, callback) {
		var functionName = "addBilling";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				return callback(error);
			} 
				
			if(helperFunctions.objectExists({"user_id" : billingInfo.user_id}, userList)) {
				helperFunctions.getBillingList(billingInfo.user_id, function(err, billingList) {
					if(err) {
						error = err;
						return callback(error);
					}

					if(!helperFunctions.objectExists(billingInfo, billingList)) {
						var queryString = "INSERT INTO user_billing (`user_id`, `billing_cc`, `billing_cc_exp`, `billing_cc_type`) VALUES" + 
							"(" + mysql.escape(billingInfo.user_id) + ", " + mysql.escape(billingInfo.billing_cc) + 
							", " + mysql.escape(billingInfo.billing_cc_exp) + ", " + mysql.escape(billingInfo.billing_cc_type) + ")";
					
						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem inserting billing info. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
								return callback(error);
							} 

							logger.info("Function: '" + functionName + "'. Inserted billing info into database for user_id: " + billingInfo.user_id);

							callback(error);
						});
					} else {
						error = "Error: Billing info already exists.";
						callback(error);
					}
				});
			} else { // User doesn't exist
				error = "Error: User doesn't exist.";
				callback(error);
			}
		});
	},

	"deactivateBilling" : function(user_id, billing_id, callback) {
		var functionName = "deactivateBilling";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				return callback(error);
			} 
				
			if(helperFunctions.objectExists({"user_id" : user_id}, userList)) {
				helperFunctions.getBillingList(user_id, function(err, billingList) {
					if(err) {
						error = err;
						return callback(error);
					}

					if(helperFunctions.objectExists({"billing_id" : billing_id}, billingList)) {
						var queryString = "UPDATE user_billing SET billing_status = 'Inactive' WHERE billing_id = " + mysql.escape(billing_id);
					
						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem deactivating billing information. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
								return callback(error);
							} 

							logger.info("Function: '" + functionName + "'. Deactivated billing information: " + billing_id);

							callback(error);
						});
					} else {
						error = "Error: Billing doesn't exist.";
						callback(error);
					}
				});
			} else { // User doesn't exist
				error = "Error: User doesn't exist.";
				callback(error);
			}
		});
	},

	"reactivateBilling" : function(user_id, billing_id, callback) {
		var functionName = "reactivateBilling";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				return callback(error);
			} 
				
			if(helperFunctions.objectExists({"user_id" : user_id}, userList)) {
				helperFunctions.getBillingList(user_id, function(err, billingList) {
					if(err) {
						error = err;
						return callback(error);
					}

					if(helperFunctions.objectExists({"billing_id" : billing_id}, billingList)) {
						var queryString = "UPDATE user_billing SET billing_status = 'Active' WHERE billing_id = " + mysql.escape(billing_id);
					
						connection.query(queryString, function(err, result) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem activating billing information. " + error);
								logger.error("Function: '" + functionName + "'. Query: " + queryString);
								return callback(error);
							} 

							logger.info("Function: '" + functionName + "'. Activated billing information: " + billing_id);

							callback(error);
						});
					} else {
						error = "Error: Billing doesn't exist.";
						callback(error);
					}
				});
			} else { // User doesn't exist
				error = "Error: User doesn't exist.";
				callback(error);
			}
		});
	},

	"updateBillingInfo" : function (billing_id, user_id, billingInfo, callback) {
		var functionName = "updateBillingInfo";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_id" : user_id}, userList)) {
					helperFunctions.getBillingList(user_id, function(err, billingList) {
						if(err) {
							error = err;
							return callback(error);
						}

						if(helperFunctions.objectExists({"billing_id" : billing_id}, billingList)) { // Make sure the billing info is there
							billingInfo.user_id = user_id;
							if(!helperFunctions.objectExists(billingInfo, billingList)) { // Make sure it's not being changed to what is already in the DB
								var queryString = "UPDATE user_billing SET ";

								// Dynamically create the queryString
								var i = 0;
								for(fieldName in billingInfo) {
									if(i != 0) {
										queryString += ", ";
									}

									queryString += fieldName + " = " + mysql.escape(billingInfo[fieldName]);
									i++;
								}

								queryString += " WHERE billing_id = " + mysql.escape(billing_id);

								connection.query(queryString, function(err, result) {
									if(err) {
										error = err;
										logger.error("Function: '" + functionName + "'. Problem updating billing info. " + error);
										logger.error("Function: '" + functionName + "'. Query: " + queryString);
									} else {
										logger.info("Function: '" + functionName + "'. Updated billing info for billing_id: " + billing_id);
									}

									callback(error);
								});
							} else {
								error = "Error: Billing already exists.";
								callback(error);
							}
						} else {
							error = "Error: Billing doesn't exist.";
							callback(error);
						}
					});
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});	
	},

	"login" : function (user_username, password, callback) {
		var functionName = "login";
		var error = "";

		helperFunctions.getUserList(function(err, userList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"user_username" : user_username}, userList)) {
					var queryString = "SELECT user_password FROM user_info WHERE user_username = " + mysql.escape(user_username);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem getting user's password hash. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							if(password != result[0].user_password) {
								error = "Error: Incorrect password";
								logger.info("Function: '" + functionName + "'. Received incorrect password for " + user_username);
							} else {
								logger.info("Function: '" + functionName + "'. Received correct password for " + user_username);	
							}
						}

						callback(error);
					});
				} else { // User doesn't exist
					error = "Error: User doesn't exist.";
					callback(error);
				}
			}
		});	
	}

};


