/*
	Class	IT446
	Project	Online Group Therapy
	File	ChatClient.js
	Type	JavaScript
	Version	1.0
	Date	11 October 2013
	Author	Trevor Durán
*/

(function() {

	'use strict';
	document.addEventListener('DOMContentLoaded', setup, true);

	var chatLog, msgField, socket;
	var presentationDataObj, currentSlide;
	var peer, localStream;
	var classSessionId;

	function setup() {

		peer = new Peer({
			host: '/',
			port: 9000,
			debug: 3
		});
		localStream = null;

		peer.on('open', function() {
			$('#my-id').text(peer.id);
			document.getElementById('startVideo').addEventListener('click', getUserMedia);
			WebSocketSetup();
		});

		peer.on('call', function(call) {
			if (localStream == null) {
				call.answer();
			} else {
				call.answer(localStream);
			}

			showCall(call);
		});

		peer.on('error', function(err) {
			alert(err.message);
		});
	}

	function WebSocketSetup( ) {
		chatLog = document.getElementById('chatLog');
		msgField = document.getElementById('msgField');

		socket = io.connect(window.location.host, {
			query: "peerID=" + peer.id + "&room=" + gup('room') + "&uName=" + gup('name')
		});

		socket.on('message', function(data) {
			console.log('WS message:', data);
			if (data.message) {
				writeToChatLog('message', data.userName, data.message);
			} else {
				console.log('there was a problem reading data.message:', data);
			}
		});
		
		socket.on('classSessionId', function(data) {
			classSessionId = data.classSessionId
			
			loadAssignedMediaDropdown();
		});

		socket.on('presentation', function(data) {
			console.log('WS presentation:', data);
			if (data.slide) {
				loadPresentationImage(data.slide);
			} else {
				console.log('There is a problem reading data.slide:', data);
			}
		});

		socket.on('presentationData', function(data) {
			console.log('WS presentationData:', data);
			presentationDataObj = data;
			navigateSlide("first");
		});

		socket.on('newPeer', function(data) {
			callPeer(data.peerID);
		});

		socket.on("peerDisconected", function(data) {
			closeCall(data.peerID);
		});
		socket.on("getQuestion", function(data){
			displayQuestion(data);
		});
		socket.on("getAnswer", function(data){
			displayAnswer(data);
		});

		document.getElementById('send').addEventListener('click', function() {
			sendMessage();
		}, false);
		document.getElementById('msgField').addEventListener('keypress', function(event) {
			if (isEnterPressed(event)) {
				sendMessage();
			}
		}, false);
		document.getElementById('disconnect').addEventListener('click', function() {
			chatSocket.close();
		}, false);
		document.getElementById('prevSlide').addEventListener('click', function() {
			navigateSlide("back");
		}, false);
		document.getElementById('nextSlide').addEventListener('click', function() {
			navigateSlide("forth");
		}, false);
		document.getElementById('sendQuestion').addEventListener('click', function(){
			sendQuestion();
		}, false);


	}

	//chatLog functions
	function sendMessage() {
		var msg = msgField.value;
		socket.emit('message', {
			message: msg
		});
		msgField.value = '';
	}

	function isEnterPressed(e) {
		return e.keyCode == 13;
	}

	function writeToChatLog(className, user, message) {

		var chatItem = document.createElement('p');
		chatItem.className = className;
		var span = document.createElement('span');
		span.className = "bold";
		span.textContent = user + ': ';

		var span2 = document.createElement('span');
		span2.textContent = message;

		chatItem.appendChild(span);
		chatItem.appendChild(span2);
		chatLog.appendChild(chatItem);
		chatLog.scrollTop = chatLog.scrollHeight;
	}
	//end chatLog functions

	//presentation functions
	function startPresentation() {
		var name = document.getElementById("assignedMediaDropdown").value;
		socket.emit('getPresentationData', {
			presentationName: name
		});
	}

	function loadPresentationImage(slideURL) {
		document.getElementById('presentationImage').src = slideURL;
	}

	function navigateSlide(direction) {
		if (presentationDataObj != null) {
			if (direction == "first") {
				currentSlide = 1
			} else if (direction == "last") {
				currentSlide = presentationDataObj.media_length;
			} else if (direction == "back") {
				if (currentSlide > 1) {
					currentSlide = currentSlide - 1;
				}
			} else if (direction == "forth") {
				if (currentSlide < presentationDataObj.media_length) {
					currentSlide = currentSlide + 1;
				}
			}

			socket.emit('presentation', {
				slide: /presentations/ 
					+ presentationDataObj.media_name + "/" 
					+ currentSlide + ".jpg"
			});
		}
	}
	
	function loadAssignedMediaDropdown(){
		var sessionID = classSessionId + "";
		
		$.ajax({
  			type: "POST",
  			url: "/api/media/getAssignedMediaList",
  			data: null,
  			success: function(data, textStatus, jqXHR){
	  			
				data = data.assignedMediaList;
				var htmlString = "";
				
	  			for (var i=0; i<data.length; i++){
					if (data[i].class_session_id + "" == sessionID){
						htmlString += "<option"
							+ " value='" +data[i].media_name + "'"
							+ ">"
							+ data[i].media_name
							+ "</option>";
					}
				}
				
				document.getElementById("assignedMediaDropdown").innerHTML = htmlString;
				document.getElementById("assignedMediaDropdown").onchange = startPresentation;
				startPresentation();
	  		}
	  	});
	}
	//end presentation functions


	//start video functions
	function getUserMedia() {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

		navigator.getUserMedia({
			audio: true,
			video: true
		}, function(stream) {
			$('#my-video').prop('src', URL.createObjectURL(stream));
			localStream = stream;
			socket.emit("newPeer", {});
			$("#startVideo").hide();
		}, function() {
			alert("Failed to access the webcam and microphone");
		});
	}

	function callPeer(peerID) {
		var call = peer.call(peerID, localStream);

		if (call != null) {
			showCall(call);
		}
	}

	function showCall(call) {

		call.on('stream', function(stream) {
			var video = document.getElementById('video-' + call.peer);

			if (video == null) {
				video = $(document.createElement('video'));
				video.prop('src', URL.createObjectURL(stream));
				video.prop('autoplay', true);
				video.prop('controls', true);
				video.prop('id', 'video-' + call.peer);
				$('#video').append(video);
			} else {
				video.src = URL.createObjectURL(stream);
			}
		});

		call.on('error', function() {
			alert("error");
		});

	}

	function closeCall(peerID) {
		var video = document.getElementById('video-' + peerID);
		if (video != null) {
			video.parentNode.removeChild(video);

			try {
				peer.connections[peerID][0].close();
			} catch (e) {}
		}
	}

	//end video functions

	function gup(name) {
		var results = new RegExp('[\\?&]' + name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]') + '=([^&#]*)').exec(window.location.href);
		return results ? results[1] : '';
	}
	function sendQuestion(){


		var text = $("#question").find(":selected").text();
		var id = $("#question").find(":selected").val();
		var type = $("#questionType").val();
		var json = '{"question_text":"'+text+'","id":"'+id+'", "question_type": "'+type+'"}';
		var response = "<br /><b>Question:</b>"+text;
		$("#questionLog").append(response);
		socket.emit('sendQuestion', json);
	}
	function displayQuestion(data){
		var json = JSON.parse(data);
	//	alert(JSON.stringify(json));
		var questionType = json.question_type;
		var id = json.id;
		var userType = $("#type").val();
		
		if(userType == "User"){
			if(questionType == "freeResponse"){
				var question = json.question_text + "<input type='text' name='user_answers' id='user_answers'><input type='button' id='answerQuestion' value='Answer'>";
				$("#question-content").html(question);
								document.getElementById('answerQuestion').addEventListener('click', function(){
					answerQuestion(questionType, id);
				}, false);

			}
			else if(questionType == "multipleChoice"){
				$.ajax({
				 	type: "POST",
				 	url: "/api/question/getQuestionInfo",
				 	data: json,
				 	success: function(data, textStatus, jqXHR){
				 		var question = json.question_text;
				 		var potentialAnswers = data.questionInfo.potential_answers;
				 		var answersContent = question + "<br>";
				 		for(var answer in potentialAnswers){
				 			answersContent += "<input type='radio' name='user_answers' value='"+potentialAnswers[answer].potential_answer_response+"'>"+potentialAnswers[answer].potential_answer_response+"<br>";

				 		}
				 		answersContent += "<input type='button' id='answerQuestion' value='Answer'>";
				 		$("#question-content").html(answersContent);
				 						document.getElementById('answerQuestion').addEventListener('click', function(){
					answerQuestion(questionType, id);
				}, false);
				 	}
				  	,
				 	dataType: "json"
				});
		
			}
			else if(questionType == "rating"){
				var question = json.question_text+"<select name='mc' id='mc'><option id='1' name='1' value='1'>1</option><option id='2' name='2' value='2'>2</option><option id='3' name='3' value='3'>3</option><option id='4' name='4' value='4'>4</option><option id='5' name='5' value='5'>5</option><option id='6' name='6' value='6'>6</option><option id='7' name='7' value='7'>7</option><option id='8' name='8' value='8'>8</option><option id='9' name='9' value='9'>9</option><option id='10' name='10' value='10'>10</option></select><input type='button' id='answerQuestion' value='Answer'>";
				$("#question-content").html(question);
								document.getElementById('answerQuestion').addEventListener('click', function(){
					answerQuestion(questionType, id);
				}, false);
			}
			


			$("#right-menu").addClass("open");
			$("#content-cover").addClass("content-cover-open");
			$("#content-cover").removeClass("content-cover-closed");
		}
		
	}
	function answerQuestion(questionType, id){

		var user_id = document.getElementById("user_id").value;
		var user_name = document.getElementById("user_name").value;

		if(questionType == "freeResponse"){
			var user_answer = document.getElementById("user_answers").value;
			
		}
		else if(questionType == "multipleChoice"){
			var user_answer = $('input[name=user_answers]:checked').val();
			
		}
		else if(questionType == "rating"){
			var user_answer = $('#mc').val();
			 
		}
		var json = {"question_id" : id, "class_session_id" : classSessionId+"", "user_answers" : [{"user_id" : user_id, "user_name" : user_name, "user_answer" :user_answer}]};

		$.ajax({
				 	type: "POST",
				 	url: "/api/question/answerClassQuestion",
				 	data: json,
				 	success: function(data, textStatus, jqXHR){
				 		
						$("#question-content").html("");
						$("#right-menu").removeClass("open");
						$("#content-cover").removeClass("content-cover-open");
						$("#content-cover").addClass("content-cover-closed");
						sendAnswer(json);
				 	}
				  	,
				 	dataType: "json"
				});
		
	}
	function sendAnswer(data){

		socket.emit('sendAnswer', data);
	}
	function displayAnswer(data){
		var userType = $("#type").val();
		if(userType == "Therapist"){
			var json = data;
			var user_name = json.user_answers[0].user_name;
			var user_answer = json.user_answers[0].user_answer;
			var response = "<br /><b>"+user_name+":</b>"+user_answer;
			$("#questionLog").append(response);
			
		}
	}

})();

