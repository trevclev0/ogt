var mysql = require('mysql');
var fs = require('fs');
var logger = require('../logger.js');
var connection = require('./dbConnection.js').createConnection();
var helperFunctions = require('./helperFunctions.js');

// Make the functions available in another file as a require
module.exports = {

	"getClassList" : function(callback) {
		var functionName = "getClassList";
		var error = "";
		var classList = {};

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error, classList);
			}

			callback(error, classList);
		});
	},

	"getClassInfo" : function(class_name, callback) {
		var functionName = "getClassInfo";
		var error = "";
		var classInfo = [];

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error, classInfo);
			}

			if(helperFunctions.objectExists({"class_name" : class_name}, classList)) {
				for(klass in classList) {
					if(classList[klass].class_name == class_name) {
						classInfo = classList[klass];
						break;
					}
				}
			} else {
				error = "Error: Class doesn't exist";
			}

			callback(error, classInfo);
		});	
	},

	"addClass" : function (therapist_id, class_name, class_size, class_start_date, class_end_date, callback) {
		var functionName = "addClass";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error);
			}

			if(!helperFunctions.objectExists({"class_name" : class_name}, classList)) {
				var queryString = "INSERT INTO classes"
					+ " (therapist_id, class_name, class_size, class_start_date, class_end_date) VALUES" 
					+ " (" + mysql.escape(therapist_id) + ", " + mysql.escape(class_name) + ", " + mysql.escape(class_size)
					+ ", " + mysql.escape(class_start_date) + ", " + mysql.escape(class_end_date) + ")";

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem adding class. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Added class: " + class_name);
					}

					callback(error);
				});
			} else { // Class already exists
				error = "Error: Class of same name already exists";
				callback(error);
			}
		});	
	},

	"deactivateClass" : function(class_name, callback) {
		var functionName = "deactivateClass";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_name" : class_name}, classList)) {
				var queryString = "UPDATE classes SET class_status = 'Inactive' WHERE class_name = " + mysql.escape(class_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem deactivating class. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Deactivated class: " + class_name);
					}

					callback(error);
				});
			} else {
				error = "Error: Class doesn't exist";
				callback(error);
			}
		});
	},

	"reactivateClass" : function(class_name, callback) {
		var functionName = "reactivateClass";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_name" : class_name}, classList)) {
				var queryString = "UPDATE classes SET class_status = 'Active' WHERE class_name = " + mysql.escape(class_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem activating class. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Activated class: " + class_name);
					}

					callback(error);
				});
			} else {
				error = "Error: Class doesn't exist";
				callback(error);
			}
		});
	},

	"updateClassInfo" : function (class_name, classInfo, callback) {
		var functionName = "updateClassInfo";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				return callback(error);
			} 

			if(helperFunctions.objectExists({"class_name" : class_name}, classList)) {

				helperFunctions.getUserList(function(err, userList) {
					if(err) {
						error = err;
						return callback(error);
					} 

					// Make sure the therapist_id is valid
					if(typeof classInfo.therapist_id != 'undefined' && !helperFunctions.objectExists({"user_id" : classInfo.therapist_id}, userList)) {
						error = "Error: Invalid therapist_id";
						return callback(error);
					}

					// Make sure the one it's updating to isn't taken
					if( typeof classInfo.new_class_name != 'undefined' && 
						class_name != classInfo.new_class_name &&
						helperFunctions.objectExists({"class_name" : classInfo.new_class_name}, classList)) {

						error = "Error: New class name already exists";
						return callback(error);
					}

					var queryString = "UPDATE classes SET ";

					// Dynamically create the queryString
					var i = 0;
					for(fieldName in classInfo) {
						if(fieldName == "class_name" || (fieldName == "new_class_name" && class_name == classInfo.new_class_name)) {
							continue; // Don't add the old class_name to the query
						}

						if(i != 0) {
							queryString += ", ";
						}

						var realFieldName = fieldName;
						if(fieldName == "new_class_name") {
							realFieldName = "class_name";
						}

						queryString += realFieldName + " = " + mysql.escape(classInfo[fieldName]);
						i++;
					}

					queryString += " WHERE class_name = " + mysql.escape(class_name);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem updating class info. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Updated class info for class_name: " + class_name);
						}

						callback(error);
					});
				});
			} else { // Class doesn't exist
				error = "Error: Class doesn't exist.";
				callback(error);
			}
		});	
	},

	"getRegistrationList" : function(class_id, user_id, callback) {
		var functionName = "getRegistrationList";
		var error = "";
		var registrationList = {};

		helperFunctions.getRegistrationList(class_id, user_id, function(err, registrationList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting registrationList. " + error);
				return callback(error, registrationList);
			}

			callback(error, registrationList);
		});
	},

	"register" : function(class_id, user_id, callback) {
		var functionName = "register";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_id" : class_id}, classList)) { // Class exists
				helperFunctions.getUserList(function(err, userList) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem getting userList. " + error);
						return callback(error);
					}

					if(helperFunctions.objectExists({"user_id" : user_id}, userList)) { // User exists
						helperFunctions.getRegistrationList(class_id, user_id, function(error, registrationList) {
							if(err) {
								error = err;
								logger.error("Function: '" + functionName + "'. Problem getting registrationList. " + error);
								return callback(error);
							}

							if(!helperFunctions.objectExists({"class_id" : class_id, "user_id" : user_id}, registrationList)) { // is registered
								var queryString = 	"INSERT INTO class_registration (`class_id`, `user_id`, `reg_date`) VALUES" + 
													"( " + mysql.escape(class_id) + ", " + mysql.escape(user_id) + ", " + mysql.escape(helperFunctions.getTodayPadDate()) + ")";


								connection.query(queryString, function(err, result) {
									if(err) {
										error = err;
										logger.error("Function: '" + functionName + "'. Problem registering for class. " + error);
										logger.error("Function: '" + functionName + "'. Query: " + queryString);
									} else {
										logger.info("Function: '" + functionName + "'. User: " + user_id + " registered for class " + class_id);
									}

									callback(error);
								});
							} else {
								error = "Error: User is already registered for specified class";
								callback(error);
							}
						});
					} else {
						error = "Error: User doesn't exist";
						callback(error);
					}
				});
			} else {
				error = "Error: Class doesn't exist";
				callback(error);
			}
		});
	},

	"unregister" : function(class_id, user_id, callback) {
		var functionName = "unregister";
		var error = "";

		helperFunctions.getClassList(function(err, classList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classList. " + error);
				return callback(error);
			}

			helperFunctions.getRegistrationList(class_id, user_id, function(error, registrationList) {
				if(err) {
					error = err;
					logger.error("Function: '" + functionName + "'. Problem getting registrationList. " + error);
					return callback(error);
				}

				if(helperFunctions.objectExists({"class_id" : class_id, "user_id" : user_id}, registrationList)) { // is registered
					var queryString = 	"DELETE FROM class_registration WHERE class_id = " + mysql.escape(class_id) + " AND user_id = " + mysql.escape(user_id);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem unregistering from class. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. User: " + user_id + " unregistered from class " + class_id);
						}

						callback(error);
					});
				} else {
					error = "Error: User is not registered for specified class";
					callback(error);
				}
			});
		});
	},

	"getClassSessionList" : function(class_id, callback) {
		var functionName = "getClassSessionList";
		var error = "";
		var classSessionList = [];

		helperFunctions.getClassSessionList(class_id, function(err, classSessionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSessionList. " + error);
				return callback(error, classSessionList);
			}

			callback(error, classSessionList);
		});
	},

	"getClassSessionInfo" : function(class_id, class_session_name, callback) {
		var functionName = "getClassSessionInfo";
		var error = "";
		var classSessionInfo = [];

		helperFunctions.getClassSessionList(0, function(err, classSessionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSessionList. " + error);
				return callback(error, classSessionInfo);
			}

			if(helperFunctions.objectExists({"class_session_name" : class_session_name}, classSessionList)) {
				for(class_session in classSessionList) {
					if(classSessionList[class_session].class_session_name == class_session_name) {
						classSessionInfo = classSessionList[class_session];
						break;
					}
				}
			} else {
				error = "Error: Class session doesn't exist";
			}

			callback(error, classSessionInfo);
		});	
	},

	"addClassSession" : function(class_id, class_session_name, class_session_date, class_session_time, callback) {
		var functionName = "addClassSession";
		var error = "";

		helperFunctions.getClassSessionList(0, function(err, classSessionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSessionList. " + error);
				return callback(error);
			}

			if(!helperFunctions.objectExists({"class_session_name" : class_session_name}, classSessionList)) {
				var queryString = "INSERT INTO class_sessions"
					+ " (class_id, class_session_name, class_session_date, class_session_time) VALUES" 
					+ " (" + mysql.escape(class_id) + ", " + mysql.escape(class_session_name)
					+ ", " + mysql.escape(class_session_date) + ", " + mysql.escape(class_session_time) + ")";

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem adding class session. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Added class session: " + class_session_name);
					}

					callback(error);
				});
			} else { // Class session already exists
				error = "Error: Class session of same name already exists";
				callback(error);
			}
		});
	},

	"deactivateClassSession" : function(class_id, class_session_name, callback) {
		var functionName = "deactivateClassSession";
		var error = "";

		helperFunctions.getClassSessionList(0, function(err, classSessionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSessionList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_session_name" : class_session_name}, classSessionList)) {
				var queryString = "UPDATE class_sessions SET class_session_status = 'Inactive' WHERE class_session_name = " + mysql.escape(class_session_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem deactivating class session. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Deactivated class session: " + class_session_name);
					}

					callback(error);
				});
			} else {
				error = "Error: Class session doesn't exist";
				callback(error);
			}
		});
	},

	"reactivateClassSession" : function(class_id, class_session_name, callback) {
		var functionName = "reactivateClassSession";
		var error = "";

		helperFunctions.getClassSessionList(0, function(err, classSessionList) {
			if(err) {
				error = err;
				logger.error("Function: '" + functionName + "'. Problem getting classSessionList. " + error);
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_session_name" : class_session_name}, classSessionList)) {
				var queryString = "UPDATE class_sessions SET class_session_status = 'Active' WHERE class_session_name = " + mysql.escape(class_session_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem reactivating class session. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Reactivated class session: " + class_session_name);
					}

					callback(error);
				});
			} else {
				error = "Error: Class session doesn't exist";
				callback(error);
			}
		});
	}

};