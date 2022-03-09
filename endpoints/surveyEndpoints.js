/* Survey Management */
var surveyDAO = require('../db/surveyDAO.js');
var logger = require('../logger.js');

var STATUS_SUCCESS = 200;
var STATUS_FAILURE = 500;

module.exports = function(app) {

	app.post("/api/survey/getSurveyList", function(req, res) {
		var endpoint = 'getSurveyList';
		logger.info("Hit endpoint: '" + endpoint + "'");

		surveyDAO.getSurveyList(function(err, surveyList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "surveyList": surveyList});
		});
	});

	app.post("/api/survey/getClassSurveyList", function(req, res) {
		var endpoint = "getClassSurveyList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		surveyDAO.getClassSurveyList(function(err, classSurveyList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "classSurveyList" : classSurveyList});	
		});
	});

	app.post("/api/survey/getSurveyInfo", function(req, res) {
		var endpoint = 'getSurveyInfo';
		logger.info("Hit endpoint: '" + endpoint + "'");

		var survey_name = req.body.survey_name;

		logger.debug("Endpoint: '" + endpoint + "'. Received survey_name: " + survey_name);

		surveyDAO.getSurveyInfo(survey_name, function(err, surveyInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"surveyInfo": surveyInfo, "error" : err});
		});
	});

	app.post("/api/survey/addSurvey", function(req, res) {
		var endpoint = "addSurvey";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var survey_name = req.body.survey_name;

		logger.debug("Endpoint: '" + endpoint + "'. Received survey_name: " + survey_name);

		surveyDAO.addSurvey(survey_name, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/survey/reactivateSurvey", function(req, res) {
		var endpoint = 'reactivateSurvey';
		logger.info("Hit endpoint: '" + endpoint + "'");

		var survey_name = req.body.survey_name;

		logger.debug("Endpoint: '" + endpoint + "'. Received survey_name: " + survey_name);

		surveyDAO.reactivateSurvey(survey_name, function(err, surveyInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"surveyInfo": surveyInfo, "error" : err});
		});
	});

	app.post("/api/survey/deactivateSurvey", function(req, res) {
		var endpoint = 'deactivateSurvey';
		logger.info("Hit endpoint: '" + endpoint + "'");

		var survey_name = req.body.survey_name;

		logger.debug("Endpoint: '" + endpoint + "'. Received survey_name: " + survey_name);

		surveyDAO.deactivateSurvey(survey_name, function(err, surveyInfo) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"surveyInfo": surveyInfo, "error" : err});
		});
	});

	app.post("/api/survey/assignSurveyToClass", function(req, res) {
		var endpoint = "assignSurveyToClass";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		var survey_id = req.body.survey_id;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received survey_id: " + survey_id);

		surveyDAO.assignSurveyToClass(class_id, survey_id, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});	
		});
	});

	app.post("/api/survey/unassignSurveyFromClass", function(req, res) {
		var endpoint = "unassignSurveyFromClass";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var class_id = req.body.class_id;
		var survey_id = req.body.survey_id;
		logger.debug("Endpoint: '" + endpoint + "'. Received class_id: " + class_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received survey_id: " + survey_id);

		surveyDAO.unassignSurveyFromClass(class_id, survey_id, function(err) {
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
		- survey_name

		The following fields never change:
		- survey_id
	*/
	app.post("/api/survey/updateSurveyInfo", function(req, res) {
		var endpoint = "updateSurveyInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var surveyInfo = {};
		var survey_id = req.body.survey_id;

		logger.debug("Endpoint: '" + endpoint + "'. Received survey_id: " + survey_id);
		
		if(typeof req.body.survey_name != 'undefined') {surveyInfo.survey_name = req.body.survey_name;}
		logger.debug("Endpoint: '" + endpoint + "'. Received survey_name: " + surveyInfo.survey_name);

		surveyDAO.updateSurveyInfo(survey_id, surveyInfo, function(err) {
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