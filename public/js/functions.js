
function questionType(){
	if(document.getElementById("fresponse").checked){
		document.getElementById("createQuestion").innerHTML= 'Question:<br /><textarea rows="2" cols="40"></textarea>	<button type="button" onclick="createQuestion();">Send Question</button>';
		document.getElementById("right").innerHTML = "";
	}
	else if(document.getElementById("rating").checked){
		document.getElementById("createQuestion").innerHTML= 'Question:<br /><textarea rows="2" cols="40"></textarea>	<button type="button" onclick="createQuestion();">Send Question</button>';
		document.getElementById("right").innerHTML = "";
	}
	else if(document.getElementById("poll").checked){
		document.getElementById("createQuestion").innerHTML= 'Question:<br /><textarea rows="2" cols="40"></textarea>';
		document.getElementById("right").innerHTML = 'Answers:<br />Some kind of answer option<br />	<button type="button" onclick="createQuestion();">Send Question</button>';
	}
}
		
function createQuestion(){
	var question = $("#newQuestion").val();
	var type = $("#newType").find(":selected").val();

	
	var json= {"question_type":type, "question_text": question, "question_during_class": "true"};
	$.ajax({
				type: "POST",
				url: "/api/question/createQuestion",
				data: json,
				success: function(data, textStatus, jqXHR){
				   	$("#newQuestion").val("");
				  	if(type=="multipleChoice"){
				  		console.log("mc");
						var inputs = document.getElementsByClassName( 'answers' );
						    names  = [].map.call(inputs, function( input ) {
					        return input.value;
					    });
						    var json = {"question_id":data.question_id, "potential_answers": names};
						console.log(names[0]);
    					$.ajax({
				  			type: "POST",
				  			url: "/api/question/createAndAssignAnswers",
				  			data: json,
				  			success: function(data, textStatus, jqXHR){
					  			
					  			alert("good");
					  			initializePage();
					  		}
					  	});
					}
					else{
					//	alert("bad");
						initializePage();
					}
				}
	});
}
function addAnswer(){
	var next = parseInt($("#number").val()) + 1;

	newDiv = document.createElement("div");
	newDiv.id = "mcAnswer"+next;
	
	newDiv.innerHTML = "Answer: <input type='text' name='answers[]' class='answers' id='answer"+next+"'><img src='/images/minus_sign.jpg' alt='Minus' style='height:20px; width:auto;' onclick='removeAnswer(\"mcAnswer"+next+"\")'>";
																																					//'setCorrect(\"q"+pos+"cor\");
	document.getElementById("answersList").appendChild(newDiv);
	$("#number").val(next);
}
function removeAnswer(answerId){
	$("#"+answerId).remove();
}
		
function AjaxPost_syncronus(url, data)
{
	var xmlhttp = new XMLHttpRequest();

	if (!window.XMLHttpRequest){
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.open("POST",url,false);
	
	if(data != null){
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send(data);
	}
	else{
		xmlhttp.send();
	}
	
	return xmlhttp.responseText;
}


function loadClassDropdown(){

	var data = AjaxPost_syncronus("/api/class/getClassList", null)
	data = JSON.parse(data).classList;				
	
	var classHtmlString = "";
	for (var i=0; i<data.length; i++){
	
		classHtmlString += "<option"
					  + " value='" +data[i].class_id + "'"
					  + ">"
					  + data[i].class_name
					  + "</option>"
	}
	
	document.getElementById("classes").innerHTML = classHtmlString;
}

function loadSessionDropdown(){

	var query = "class_id=" + document.getElementById("classes").value;
	var data = AjaxPost_syncronus("/api/class/getClassSessionList",query);
	data = JSON.parse(data).classSessionList;
	
	var htmlString = "";
	for (var i=0; i<data.length; i++){
	
		htmlString += "<option"
					  + " value='" +data[i].class_session_id + "'"
					  + ">"
					  + data[i].class_session_name
					  + "</option>"
	}
	
	document.getElementById("classSessions").innerHTML = htmlString
	loadCurrentMedia();
}

function loadMediaDropdown(){
	var data = AjaxPost_syncronus("/api/media/getMediaList", null);
	data = JSON.parse(data).mediaList;
	
	var mediaHtmlString = "";
	for (var i=0; i<data.length; i++){
		mediaHtmlString +=  "<option"
					  + " value='" +data[i].media_id + "'"
					  + ">"
					  + data[i].media_name
					  + "</option>"
	}
	
	document.getElementById("media").innerHTML = mediaHtmlString;
}

function loadCurrentMedia(){
	var data = AjaxPost_syncronus("/api/media/getAssignedMediaList", null)
	data = JSON.parse(data).assignedMediaList;
	
	var sessionID = document.getElementById("classSessions").value;
	
	var htmlString = ""
	
	if (sessionID != null && sessionID !=""){
	
		for (var i=0; i<data.length; i++){
			if (data[i].class_session_id + "" == sessionID){
				htmlString += "<li>" + data[i].media_name + "</li>";
			}
		}
		
	}
					
	document.getElementById("currentMedia").innerHTML = htmlString;	
}

function assignMedia(){
	
	var query = "media_id=" + document.getElementById("media").value
			+ "&class_session_id=" +document.getElementById("classSessions").value;
			
	
	var data = AjaxPost_syncronus("/api/media/assignMediaToSession",query);

	document.getElementById("assignResults").innerHTML = JSON.parse(data).error;	
	loadCurrentMedia();
}

function mediaUploadStarted(){
	document.getElementById("UploadMediaMessage").innerHTML = "Uploading";
}

function mediaUploadFinished(){
	
	var iframeBody = document.getElementById("hidden-form").contentDocument.body;
	var returnData;
	var error = "";
	
	try{
		returnData = iframeBody.getElementsByTagName('pre')[0].innerHTML;
	}
	catch(e){
		returnData = iframeBody.innerHtml;
	}
	
	if (returnData != null){
		error = JSON.parse(returnData).error;
	}
	if(error == ""){
		error = "Finished uploading.";
	}
	
	document.getElementById("UploadMediaMessage").innerHTML = error;
	loadMediaDropdown();
}

function load(){
	loadClassDropdown();;
	loadSessionDropdown();
	
	loadCurrentMedia();
	
	loadMediaDropdown();
}
