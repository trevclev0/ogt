/* Media Management */
var mediaDAO = require('../db/mediaDAO.js');
var logger = require('../logger.js');
var fs = require('fs');
var exec = require('child_process').exec;

var STATUS_SUCCESS = 200;
var STATUS_FAILURE = 500;

module.exports = function(app) {

	app.post("/api/media/getMediaList", function(req, res) {
		var endpoint = "getMediaList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		mediaDAO.getMediaList(function(err, mediaList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "mediaList" : mediaList});	
		});
	});

	app.post("/api/media/getAssignedMediaList", function(req, res) {
		var endpoint = "getAssignedMediaList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		mediaDAO.getAssignedMediaList(function(err, assignedMediaList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "assignedMediaList" : assignedMediaList});	
		});
	});

	app.post("/api/media/getMediaInfo", function(req, res) {
		var endpoint = "getMediaInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var media_name = req.body.media_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received media_name: " + media_name);

		mediaDAO.getMediaInfo(media_name, function(err, mediaInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "mediaInfo" : mediaInfo});	
		});
	});

	app.post("/api/media/addMedia", function(req, res) {
		var endpoint = 'addMedia';
		logger.info("Hit endpoint: '" + endpoint + "'");

		var error = "";

		logger.debug("Received files: " + JSON.stringify(req.files));

		for(file in req.files) { // Should only be one file, but looping makes it easy to get the info from req.files
			var fileName = req.files[file].name;
			var folderName = fileName.substring(0, fileName.length - 4); // Chop the extension off
			var media_path = folderName + '/1.jpg';

			if(validExtension(fileName, ['.pdf'])) { // Valid file
				fs.exists('public/presentations/' + folderName, function(exists) {
					if(!exists) { // If the directory doesn't exist
						fs.mkdir('public/presentations/' + folderName, 0755, function() { // Make the directory
							fs.rename(req.files[file].path, 'public/presentations/' + folderName + '/' + fileName, function(err) { // Move the file in
								if(err) {
									error = err;
									logger.error("Error moving temporary uploaded file to permanent destination. " + error);
									res.status(STATUS_FAILURE);
									return res.send({"error" : error});
								}

								var command = "'public/presentations/pdf2jpg.sh' 'public/presentations/" + folderName + "/" + fileName + "'";
								exec(command, function(err, stdout, stderr) {
									if(err) {
										error = err;
										logger.error("Endpoint: '" + endpoint + "'. Error executing PDF splitting script. " + error);
										logger.error("Endpoint: '" + endpoint + "'. Command: " + command);
										res.status(STATUS_FAILURE);
										return res.send({"error" : error});
									}

									fs.readdir('public/presentations/' + folderName, function(err, files) { // Count files in the directory (excludes . and ..)
										if(err) {
											error = err;
											logger.error("Endpoint: '" + endpoint + "'. Error counting split files. " + error);
											res.status(STATUS_FAILURE);
											return res.send({"error" : error});
										}

										var media_length = files.length - 1; // Subtract 1 because of the "master" PDF
										mediaDAO.addMedia(folderName, media_path, media_length, function(err) {
											if(err) {
												logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
												res.status(STATUS_FAILURE);
											} else {
												res.status(STATUS_SUCCESS);
											}

											res.send({"error" : err});
										});	
									});
								});
							});
						});
					} else { // Otherwise, throw an error
						error = "Error: A presentation with the same name already exists.";
						res.status(STATUS_FAILURE);
						return res.send({"error" : error});
					}
				});
			}
		}
	});

	app.post("/api/media/deactivateMedia", function(req, res) {
		var endpoint = "deactivateMedia";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var media_id = req.body.media_id;
		var media_name = req.body.media_name;

		logger.debug("Endpoint: '" + endpoint + "'. Received media_id: " + media_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received media_name: " + media_name);

		mediaDAO.deactivateMedia(media_id, media_name, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/media/reactivateMedia", function(req, res) {
		var endpoint = "reactivateMedia";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var media_id = req.body.media_id;
		var media_name = req.body.media_name;

		logger.debug("Endpoint: '" + endpoint + "'. Received media_id: " + media_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received media_name: " + media_name);

		mediaDAO.reactivateMedia(media_id, media_name, function(err) {
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
		- media_name

		The following fields are updated implicitly (not user-changable):
		- media_path

		The following fields never change:
		- media_id
		- media_length
	*/
	app.post("/api/media/updateMediaInfo", function(req, res) {
		var endpoint = "updateMediaInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var mediaInfo = {};

		// media_name and new_media_name have to go together
		if(typeof req.body.media_name != 'undefined' && typeof req.body.new_media_name != 'undefined') {
			mediaInfo.media_name = req.body.media_name;
			mediaInfo.new_media_name = req.body.new_media_name;
			mediaInfo.media_path = mediaInfo.new_media_name + "/1.jpg";
		}
		logger.debug("Endpoint: '" + endpoint + "'. Received media_name: " + mediaInfo.media_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received new_media_name: " + mediaInfo.new_media_name);

		// Future: Set any other things to update here

		function updateFileSystem(callback) {
			var oldPath = 'public/presentations/' + mediaInfo.media_name;
			var newPath = 'public/presentations/' + mediaInfo.new_media_name;

			fs.exists(oldPath, function(exists) {
				if(!exists) {
					callback("Error: Presentation '" + mediaInfo.media_name + "' doesn't exist.");
				}

				fs.exists(newPath, function(exists) {
					if(exists) {
						callback("Error: Presentation '" + mediaInfo.new_media_name + "' already exists.");
					}

					fs.rename(oldPath, newPath, function() {

						// Rename the PDF too, but the folder's name is already changed
						var oldPDFName = newPath + '/' + mediaInfo.media_name + '.pdf';
						var newPDFName = newPath + '/' + mediaInfo.new_media_name + '.pdf';
						fs.rename(oldPDFName, newPDFName, function() {
							callback();
						});
					});
				});
			});
		}

		function updateDB() {
			mediaDAO.updateMediaInfo(mediaInfo, function(err) {
				if(err) {
					logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
					res.status(STATUS_FAILURE);
				} else {
					res.status(STATUS_SUCCESS);
				}

				res.send({"error" : err});
			});
		}

		if(typeof req.body.media_name != 'undefined' && typeof req.body.new_media_name != 'undefined') {
			updateFileSystem(function(err) {
				if(err) {
					logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
					res.status(STATUS_FAILURE);
					res.send({"error" : err});
				} else {
					updateDB();
				}
			});
		} else {
			updateDB();
		}
	});

	app.post("/api/media/assignMediaToSession", function(req, res) {
		var endpoint = "assignMediaToSession";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var media_id = req.body.media_id;
		var class_session_id = req.body.class_session_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received media_id: " + media_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_id: " + class_session_id);

		mediaDAO.assignMediaToSession(media_id, class_session_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/media/unassignMediaFromSession", function(req, res) {
		var endpoint = "unassignMediaFromSession";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var media_id = req.body.media_id;
		var class_session_id = req.body.class_session_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received media_id: " + media_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_id: " + class_session_id);

		mediaDAO.unassignMediaFromSession(media_id, class_session_id, function(err) {
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

function validExtension(fileName, exts) { // Accepts a fileName and an array of file extensions
    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
}
