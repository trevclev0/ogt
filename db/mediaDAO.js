var mysql = require('mysql');
var fs = require('fs');
var logger = require('../logger.js');
var connection = require('./dbConnection.js').createConnection();
var helperFunctions = require('./helperFunctions.js');

// Make the functions available in another file as a require
module.exports = {

	"getMediaList" : function(callback) {
		var functionName = 'getMediaList';
		var error = "";
		var mediaList = {};

		helperFunctions.getMediaList(function(err, mediaList) {
			if(err) {
				error = err;
			}

			callback(error, mediaList);
		});
	},

	"getAssignedMediaList" : function(callback) {
		var functionName = 'getAssignedMediaList';
		var error = "";
		var assignedMediaList = [];

		helperFunctions.getAssignedMediaList(function(err, assignedMediaList) {
			if(err) {
				error = err;
			}

			callback(error, assignedMediaList);
		});
	},

	"getMediaInfo" : function (media_name, callback) {
		var functionName = 'getMediaInfo';
		var error = "";
		var mediaInfo = {};

		helperFunctions.getMediaList(function(err, mediaList) {
			if(err) {
				error = err;
				callback(error, mediaInfo);
			} else {
				if(helperFunctions.objectExists({"media_name" : media_name}, mediaList)) {
					for(media in mediaList) {
						if(mediaList[media].media_name == media_name) {
							mediaInfo = mediaList[media];
							break;
						}
					}

					callback(error, mediaInfo);
				} else { // Media doesn't exist
					error = "Error: Media doesn't exist.";
					callback(error, mediaInfo);
				}
			}
		});
	},

	"addMedia" : function(media_name, media_path, media_length, callback) {
		var functionName = 'addMedia';
		var error = "";

		helperFunctions.getMediaList(function(err, mediaList) {
			if(err) {
				error = err;
				callback(error);
			}

			if(!helperFunctions.objectExists({"media_name" : media_name}, mediaList)) {
				var queryString = "INSERT INTO class_media (`media_name`, `media_path`, `media_length`) VALUES (" +
									mysql.escape(media_name) + ", " + mysql.escape(media_path) + ", " + mysql.escape(media_length) + ")";

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem inserting media information into database. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Media '" + media_name + "' inserted into database."); 	
					}

					callback(error);
				})
			} else {
				callback("Error: A presentation by the same name already exists.");
			}
		});
	},

	"deactivateMedia" : function(media_id, media_name, callback) {
		var functionName = "deactivateMedia";
		var error = "";

		helperFunctions.getMediaList(function(err, mediaList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"media_name" : media_name}, mediaList)) {
					var queryString = "UPDATE class_media SET media_status = 'Inactive' WHERE " + 
										"media_id = " + mysql.escape(media_id) + " AND media_name = " + mysql.escape(media_name);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem deactivating media. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Deactivated media " + media_name);
						}

						callback(error);
					});	
				} else { // Media doesn't exist
					error = "Error: Media doesn't exist.";
					callback(error);
				}
			}
		});
	},

	"reactivateMedia" : function(media_id, media_name, callback) {
		var functionName = "reactivateMedia";
		var error = "";

		helperFunctions.getMediaList(function(err, mediaList) {
			if(err) {
				error = err;
				callback(error);
			} else {
				if(helperFunctions.objectExists({"media_name" : media_name}, mediaList)) {
					var queryString = "UPDATE class_media SET media_status = 'Active' WHERE " + 
										"media_id = " + mysql.escape(media_id) + " AND media_name = " + mysql.escape(media_name);

					connection.query(queryString, function(err, result) {
						if(err) {
							error = err;
							logger.error("Function: '" + functionName + "'. Problem activating media. " + error);
							logger.error("Function: '" + functionName + "'. Query: " + queryString);
						} else {
							logger.info("Function: '" + functionName + "'. Activated media " + media_name);
						}

						callback(error);
					});	
				} else { // Media doesn't exist
					error = "Error: Media doesn't exist.";
					callback(error);
				}
			}
		});
	},

	"updateMediaInfo" : function (mediaInfo, callback) {
		var functionName = "updateMediaInfo";
		var error = "";

		helperFunctions.getMediaList(function(err, mediaList) {
			if(err) {
				error = err;
				return callback(error);
			} 

			if(helperFunctions.objectExists({"media_name" : mediaInfo.media_name}, mediaList)) {
				// Make sure the one it's updating to isn't taken
				if(typeof mediaInfo.new_media_name != 'undefined' && helperFunctions.objectExists({"media_name" : mediaInfo.new_media_name}, mediaList)) {
					error = "Error: New media name already exists";
					return callback(error);
				}

				var queryString = "UPDATE class_media SET ";

				// Dynamically create the queryString
				var i = 0;
				for(fieldName in mediaInfo) {
					if(fieldName == "media_name") {
						continue; // Invalid field for this function - skip it
					}

					if(i != 0) {
						queryString += ", ";
					}

					var realFieldName = fieldName;
					if(fieldName == "new_media_name") {
						realFieldName = "media_name";
					}

					queryString += realFieldName + " = " + mysql.escape(mediaInfo[fieldName]);
					i++;
				}

				queryString += " WHERE media_name = " + mysql.escape(mediaInfo.media_name);

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem updating media info. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Updated media info for media_name: " + mediaInfo.media_name);
					}

					callback(error);
				});
			} else { // Media doesn't exist
				error = "Error: Media doesn't exist.";
				callback(error);
			}
		});	
	},

	"assignMediaToSession" : function(media_id, class_session_id, callback) {
		var functionName = "assignMediaToSession";
		var error = "";

		if(!class_session_id || !media_id) {
			error = "Error: Missing parameters.";
			return callback(error);
		}

		helperFunctions.getAssignedMediaList(function(err, assignedMediaList) {
			if(err) {
				error = err;
				return callback(error);
			}

			if(!helperFunctions.objectExists({"class_session_id" : class_session_id, "media_id" : media_id}, assignedMediaList)) {
				var queryString = "INSERT INTO class_media_list (`class_session_id`, `media_id`) VALUES (" + 
									mysql.escape(class_session_id) + ", " + mysql.escape(media_id) + ")";

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem assigning media to class session. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Assigned media_id " + media_id + " to class_session_id " + class_session_id);
					}

					callback(error);
				});
			} else {
				error = "Error: The same media is already linked to the class session."
				callback(error);
			}
		});
	},

	"unassignMediaFromSession" : function(media_id, class_session_id, callback) {
		var functionName = "unassignMediaFromSession";
		var error = "";

		helperFunctions.getAssignedMediaList(function(err, assignedMediaList) {
			if(err) {
				error = err;
				return callback(error);
			}

			if(helperFunctions.objectExists({"class_session_id" : class_session_id, "media_id" : media_id}, assignedMediaList)) {
				var queryString = "DELETE FROM class_media_list WHERE class_session_id = " + mysql.escape(class_session_id) + " AND media_id = " + mysql.escape(media_id); 

				connection.query(queryString, function(err, result) {
					if(err) {
						error = err;
						logger.error("Function: '" + functionName + "'. Problem unassigning media from class session. " + error);
						logger.error("Function: '" + functionName + "'. Query: " + queryString);
					} else {
						logger.info("Function: '" + functionName + "'. Unassigned media_id " + media_id + " from class_session_id " + class_session_id);
					}

					callback(error);
				});
			} else {
				error = "Error: The submitted media is not assigned to the submitted class session."
				callback(error);
			}
		});
	}

};

