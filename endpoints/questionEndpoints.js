/* Question Management */
var questionDAO = require('../db/questionDAO.js');
var logger = require('../logger.js');

var STATUS_SUCCESS = 200;
var STATUS_FAILURE = 500;

module.exports = function(app) {
	app.post("/api/question/getQuestionList", function(req, res) {
		var endpoint = "getQuestionList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_during_class = req.body.question_during_class;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_during_class: " + question_during_class);

		questionDAO.getQuestionList(question_during_class, function(err, questionList) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "questionList" : questionList});
		});
	});

	app.post("/api/question/getQuestionInfo", function(req, res) {
		var endpoint = "getQuestionInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_text = req.body.question_text;
		var question_type = req.body.question_type;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_text: " + question_text);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_type: " + question_type);

		questionDAO.getQuestionInfo(question_text, question_type, function(err, questionInfo) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
				logger.debug("Endpoint: '" + endpoint + "'. Returned questionInfo: " + JSON.stringify(questionInfo));
			}

			res.send({"error" : err, "questionInfo" : questionInfo});
		});
	});	

	app.post("/api/question/createQuestion", function(req, res) {
		var endpoint = "createQuestion";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_type = req.body.question_type;
		var question_text = req.body.question_text;
		var question_during_class = req.body.question_during_class;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_type: " + question_type);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_text: " + question_text);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_during_class: " + question_during_class);

		questionDAO.createQuestion(question_type, question_text, question_during_class, function(err, question_id) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "question_id" : question_id});
		});
	});

	/*
		This endpoint supports updating the following fields:
		- question_text
		- question_type
		- question_during_class
	*/
	app.post("/api/question/updateQuestionInfo", function(req, res) {
		var endpoint = "updateQuestionInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var questionInfo = {};
		var question_id = req.body.question_id;

		if(typeof req.body.question_text != 'undefined') {questionInfo.question_text = req.body.question_text;}
		if(typeof req.body.question_type != 'undefined') {questionInfo.question_type = req.body.question_type;}
		if(typeof req.body.question_during_class != 'undefined') {questionInfo.question_during_class = req.body.question_during_class;}

		logger.debug("Endpoint: '" + endpoint + "'. Received question_id: " + question_id);
		
		logger.debug("Endpoint: '" + endpoint + "'. Received question_text: " + questionInfo.question_text);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_type: " + questionInfo.question_type);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_during_class: " + questionInfo.question_during_class);

		questionDAO.updateQuestionInfo(question_id, questionInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/deactivateQuestion", function(req, res) {
		var endpoint = "deactivateQuestion";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_type = req.body.question_type;
		var question_text = req.body.question_text;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_type: " + question_type);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_text: " + question_text);

		questionDAO.deactivateQuestion(question_type, question_text, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/reactivateQuestion", function(req, res) {
		var endpoint = "reactivateQuestion";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_type = req.body.question_type;
		var question_text = req.body.question_text;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_type: " + question_type);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_text: " + question_text);

		questionDAO.reactivateQuestion(question_type, question_text, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/createPotentialAnswers", function(req, res) {
		var endpoint = "createPotentialAnswers";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var potential_answers = req.body.potential_answers;
		logger.debug("Endpoint: '" + endpoint + "'. Received potential_answers: " + JSON.stringify(potential_answers));

		questionDAO.createPotentialAnswers(potential_answers, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	/*
		This endpoint supports updating the following fields:
		- potential_answer_response
	*/
	app.post("/api/question/updatePotentialAnswerInfo", function(req, res) {
		var endpoint = "updatePotentialAnswerInfo";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var potentialAnswerInfo = {};
		var potential_answer_id = req.body.potential_answer_id;
		if(typeof req.body.potential_answer_response != 'undefined') {potentialAnswerInfo.potential_answer_response = req.body.potential_answer_response;}

		logger.debug("Endpoint: '" + endpoint + "'. Received potential_answer_id: " + potential_answer_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received potential_answer_response: " + potentialAnswerInfo.potential_answer_response);

		questionDAO.updatePotentialAnswerInfo(potential_answer_id, potentialAnswerInfo, function(err) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/createAndAssignAnswers", function(req, res) {
		var endpoint = "createAndAssignAnswers";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_id = req.body.question_id;
		var potential_answers = req.body.potential_answers;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_id: " + question_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received potential_answers: " + JSON.stringify(potential_answers));

		questionDAO.createAndAssignAnswers(question_id, potential_answers, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/deactivatePotentialAnswers", function(req, res) {
		var endpoint = "deactivatePotentialAnswers";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var potential_answer_ids = req.body.potential_answer_ids;
		logger.debug("Endpoint: '" + endpoint + "'. Received potential_answer_ids: " + JSON.stringify(potential_answer_ids));

		questionDAO.deactivatePotentialAnswers(potential_answer_ids, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/reactivatePotentialAnswers", function(req, res) {
		var endpoint = "reactivatePotentialAnswers";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var potential_answer_ids = req.body.potential_answer_ids;
		logger.debug("Endpoint: '" + endpoint + "'. Received potential_answer_ids: " + JSON.stringify(potential_answer_ids));

		questionDAO.reactivatePotentialAnswers(potential_answer_ids, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/assignAnswersToQuestion", function(req, res) {
		var endpoint = "assignAnswersToQuestion";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_id = req.body.question_id;
		var assign_potential_ids = req.body.assign_potential_ids;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_id: " + question_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received assign_potential_ids: " + JSON.stringify(assign_potential_ids));

		questionDAO.assignAnswersToQuestion(question_id, assign_potential_ids, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/unassignAnswersFromQuestion", function(req, res) {
		var endpoint = "unassignAnswersFromQuestion";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_id = req.body.question_id;
		var unassign_potential_ids = req.body.unassign_potential_ids;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_id: " + question_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received unassign_potential_ids: " + JSON.stringify(unassign_potential_ids));

		questionDAO.unassignAnswersFromQuestion(question_id, unassign_potential_ids, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/getPotentialAnswerList", function(req, res) {
		var endpoint = "getPotentialAnswerList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		questionDAO.getPotentialAnswerList(function(err, potentialAnswerList) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "potentialAnswerList" : potentialAnswerList});
		});
	});

	app.post("/api/question/getAssignedAnswersList", function(req, res) {
		var endpoint = "getAssignedAnswersList";
		logger.info("Hit endpoint: '" + endpoint + "'");

		questionDAO.getAssignedAnswersList(function(err, assignedAnswersList) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "assignedAnswersList" : assignedAnswersList});
		});
	});

	app.post("/api/question/answerClassQuestion", function(req, res) {
		var endpoint = "answerClassQuestion";
		logger.info("Hit endpoint: '" + endpoint + "'");

		var question_id = req.body.question_id;
		var class_session_id = req.body.class_session_id;
		var user_answers = req.body.user_answers;
		logger.debug("Endpoint: '" + endpoint + "'. Received question_id: " + question_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received class_session_id: " + class_session_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received user_answers: " + JSON.stringify(user_answers));
		
		questionDAO.answerClassQuestion(question_id, class_session_id, user_answers, function(err) {
			if(err) {
				logger.info("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err});
		});
	});

	app.post("/api/question/getAssignedSurveyQuestionList", function(req, res) {
		var endpoint = 'getAssignedSurveyQuestionList';
		logger.info("Hit endpoint: '" + endpoint + "'");

		questionDAO.getAssignedSurveyQuestionList(function(err, assignedSurveyQuestionList) {
			if(err) {
				logger.error("Endpoint: '" + endpoint + "'. Received error: " + err);
				res.status(STATUS_FAILURE);
			} else {
				res.status(STATUS_SUCCESS);
			}

			res.send({"error" : err, "assignedSurveyQuestionList": assignedSurveyQuestionList});
		});
	});

	app.post("/api/question/assignQuestionsToSurvey", function(req, res) {
		var endpoint = 'assignQuestionsToSurvey';
		logger.info("Hit endpoint: '" + endpoint + "'");

		var survey_id = req.body.survey_id;
		var question_ids = req.body.question_ids;

		logger.debug("Endpoint: '" + endpoint + "'. Received survey_id: " + survey_id);
		logger.debug("Endpoint: '" + endpoint + "'. Received question_ids: " + JSON.stringify(question_ids));

		questionDAO.assignQuestionsToSurvey(survey_id, question_ids, function(err) {
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