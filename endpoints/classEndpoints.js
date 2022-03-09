/* Class Management */
var classDAO = require('../db/classDAO.js');
var logger = require('../logger.js');

var STATUS_SUCCESS = 200;
var STATUS_FAILURE = 500;

module.exports = function(app) {
	
	/**
	 * Creates a class
	 * @param  req.body.therapist_id
	 * @param  req.body.class_name
	 * @param  req.body.class_size
	 * @param  req.body.class_start_date
	 * @param  req.body.class_end_date
	 * @return {"error" : "Empty error text if no error"}
	 */
	app.post("/api/class/addClass", function(req, res) {
		var endpoint = "addClass";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var therapist_id = req.body.therapist_id;
		var class_name = req.body.class_name;
		var class_size = req.body.class_size;
		var class_start_date = req.body.class_start_date;
		var class_end_date = req.body.class_end_date;

		logger.debug("Endpoint: '" + endpoint + "'. Received therapist_id: " + therapist_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_name: " + class_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_size: " + class_size);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_start_date: " + class_start_date);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_end_date: " + class_end_date);

		classDAO.addClass(therapist_id, class_name, class_size, class_start_date, class_end_date, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err});
		});
	});

	/**
	 * Creates a class session and associates it with the given class
	 * @param  req.body.class_id
	 * @param  req.body.class_session_name
	 * @param  req.body.class_session_date
	 * @param  req.body.class_session_time
	 * @return {"error" : "Empty error text if no error"}
	 */
	app.post("/api/class/addClassSession", function(req, res) {
		var endpoint = "addClassSession";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		var class_session_name = req.body.class_session_name;
		var class_session_date = req.body.class_session_date;
		var class_session_time = req.body.class_session_time;

		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_name: " + class_session_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_date: " + class_session_date);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_time: " + class_session_time);

		classDAO.addClassSession(class_id, class_session_name, class_session_date, class_session_time, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err});
		});
	});

	/**
	 * Deactivates a class (sets the class_status field to 'Inactive')
	 * @param  req.body.class_name
	 * @return {"error" : "Empty error text if no error"}
	 */
	app.post("/api/class/deactivateClass", function(req, res) {
		var endpoint = "deactivateClass";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_name = req.body.class_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_name: " + class_name);

		classDAO.deactivateClass(class_name, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err});
		});
	});

	/**
	 * Deactivates a class session (sets the class_session_status field to 'Inactive')
	 * @param  req.body.class_id
	 * @param  req.body.class_session_name
	 * @return {"error" : "Empty error text if no error"}
	 */
	app.post("/api/class/deactivateClassSession", function(req, res) {
		var endpoint = "deactivateClassSession";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		var class_session_name = req.body.class_session_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_name: " + class_session_name);

		classDAO.deactivateClassSession(class_id, class_session_name, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err});
		});
	});

	/**
	 * Gets the information for a single class
	 * @param  req.body.class_name
	 * @return {
	 * 			"error" : "Empty error text if no error",
	 * 			"classInfo" : {
	 *			    "class_id": #,
	 *			    "therapist_id": #,
	 *			    "therapist_first_name": "String",
	 *			    "therapist_last_name": "String",
	 *			    "class_name": "String",
	 *			    "class_size": #,
	 *			    "class_start_date": "YYYY-MM-DD",
	 *			    "class_end_date": "YYYY-MM-DD",
	 *			    "class_status": "Active or Inactive",
	 *			    "num_registrants": #
	 *				}
	 * 			}
	 */
	app.post("/api/class/getClassInfo", function(req, res) {
		var endpoint = "getClassInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_name = req.body.class_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_name: " + class_name);

		classDAO.getClassInfo(class_name, function(err, classInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err, "classInfo": classInfo});
		});
	});

	/**
	 * Gets the information for a single class
	 * @return {
	 * 			"error" : "Empty error text if no error",
	 * 			"classList" : [
	 *	 			{
	 *				    "class_id": #,
	 *				    "therapist_id": #,
	 *				    "therapist_first_name": "String",
	 *			    	"therapist_last_name": "String",
	 *			    	"class_name": "String",
	 *			    	"class_size": #,
	 *				    "class_start_date": "YYYY-MM-DD",
	 *				    "class_end_date": "YYYY-MM-DD",
	 *				    "class_status": "Active or Inactive",
	 *				    "num_registrants": #
	 *				},
	 *				...
	 *			]
	 * 			}
	 */
	app.post("/api/class/getClassList", function(req, res) {
		var endpoint = "getClassList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		classDAO.getClassList(function(err, classList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err, "classList": classList});
		});
	});

	

	

	

	app.post("/api/class/reactivateClass", function(req, res) {
		var endpoint = "reactivateClass";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_name = req.body.class_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_name: " + class_name);

		classDAO.reactivateClass(class_name, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err});
		});
	});

	/*
		This endpoint supports updating the following fields:
		- class_name
		- therapist_id
		- class_size
		- class_start_date
		- class_end_date

		The following fields never change:
		- class_id
	*/
	app.post("/api/class/updateClassInfo", function(req, res) {
		var endpoint = "updateClassInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var classInfo = {};

		var class_name = req.body.class_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_name: " + class_name);
		
		if(typeof req.body.therapist_id != 'undefined') {classInfo.therapist_id = req.body.therapist_id;}
		if(typeof req.body.new_class_name != 'undefined') {classInfo.new_class_name = req.body.new_class_name;}
		if(typeof req.body.class_size != 'undefined') {classInfo.class_size = req.body.class_size;}
		if(typeof req.body.class_start_date != 'undefined') {classInfo.class_start_date = req.body.class_start_date;}
		if(typeof req.body.class_start_date != 'undefined') {classInfo.class_start_date = req.body.class_start_date;}
		logger.debug("Endpoint: '" + endpoint + "'. Received therapist_id: " + classInfo.therapist_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received new_class_name: " + classInfo.new_class_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_size: " + classInfo.class_size);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_start_date: " + classInfo.class_start_date);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_start_date: " + classInfo.class_start_date);

		classDAO.updateClassInfo(class_name, classInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/class/getRegistrationList", function(req, res) {
		var endpoint = "getRegistrationList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = 0;
		var user_id = 0;

		if(typeof req.body.class_id != 'undefined') {
			class_id = req.body.class_id;
			logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		}
		
		if(typeof req.body.user_id != 'undefined') {
			user_id = req.body.user_id;
			logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);
		}

		classDAO.getRegistrationList(class_id, user_id, function(err, registrationList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "registrationList" : registrationList});	
		});
	});

	app.post("/api/class/register", function(req, res) {
		var endpoint = "register";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		// var user_id = req.body.user_id;
		var user_id = req.user.user_id;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);

		classDAO.register(class_id, user_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});	
		});
	});

	app.post("/api/class/unregister", function(req, res) {
		var endpoint = "unregister";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		// var user_id = req.body.user_id;
		var user_id = req.user.user_id;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_id: " + user_id);

		classDAO.unregister(class_id, user_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});	
		});
	});

	app.post("/api/class/getClassSessionList", function(req, res) {
		var endpoint = "getClassSessionList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);

		classDAO.getClassSessionList(class_id, function(err, classSessionList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err, "classSessionList": classSessionList});
		});
	});

	app.post("/api/class/getClassSessionInfo", function(req, res) {
		var endpoint = "getClassSessionInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_session_name = req.body.class_session_name;
		var class_id = req.body.class_id;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_name: " + class_session_name);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);

		classDAO.getClassSessionInfo(class_id, class_session_name, function(err, classSessionInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err, "classSessionInfo": classSessionInfo});
		});
	});

	

	

	app.post("/api/class/reactivateClassSession", function(req, res) {
		var endpoint = "reactivateClassSession";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		var class_session_name = req.body.class_session_name;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_name: " + class_session_name);

		classDAO.reactivateClassSession(class_id, class_session_name, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error": err});
		});
	});

	
	
}