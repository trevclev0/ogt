(function() {
	'use strict';
	document.addEventListener('DOMContentLoaded', setup, false);

	function setup() {
		$('.date').datepicker({dateFormat: 'D M d yy'});
		$('.time').timepicker({scrollDefaultTime: '9:00am'});
		document.getElementById('formAddClass').addEventListener('submit', function(e) {
			$('#class_start_date').datepicker('option', 'dateFormat', 'yy-mm-dd');
			$('#class_end_date').datepicker('option', 'dateFormat', 'yy-mm-dd');
			addClass(this);
			$('#addClassModal').modal('hide')
			$(this).closest('form').find("input[type=text], textarea").val('');
			e.preventDefault();
		}, false);
		document.getElementById('formAddSession').addEventListener('submit', function(e) {
			$('#class_session_date').datepicker('option', 'dateFormat', 'yy-mm-dd');
			$('#class_session_time').timepicker('option', 'timeFormat', 'H:i');
			addClassSession(this);
			$('#addSessionModal').modal('hide');
			$(this).closest('form').find("input[type=text], textarea").val('');
			e.preventDefault();
		}, false);
		document.getElementById('formEditClass').addEventListener('submit', function(e) {
			$('#edit_class_start_date').datepicker('option', 'dateFormat', 'yy-mm-dd');
			$('#edit_class_end_date').datepicker('option', 'dateFormat', 'yy-mm-dd');
			editClass(this);
			$('#editClassModal').modal('hide');
			$(this).closest('form').find("input[type=text], textarea").val("");
			e.preventDefault();
		}, false);
		var actionButtonsNav = document.getElementById('actionButtons');
		var navUl = document.createElement('ul');
		navUl.className = 'navUl';
		load();
		getClassList();
		if (userType === 'Therapist') {
			$('#therapist_id').val(userID);
			var navLi = document.createElement('li');
			var addClassLink = document.createElement('a');
			addClassLink.href = '#addClassModal';
			addClassLink.setAttribute('data-toggle','modal');
			addClassLink.textContent = 'Add Class';
			navLi.appendChild(addClassLink);
			navUl.appendChild(navLi);

			var navLi2 = document.createElement('li')
			var uploadMediaLink = document.createElement('a');
			uploadMediaLink.href = '#uploadMediaModal';
			uploadMediaLink.setAttribute('data-toggle', 'modal');
			uploadMediaLink.textContent = 'Upload Media';
			navLi2.appendChild(uploadMediaLink);
			navUl.appendChild(navLi2);
			actionButtonsNav.appendChild(navUl);
			
		} else {
			getRegistrationList();
		}

	}
	function getClassList() {
		var classListXHR = new XMLHttpRequest();
		classListXHR.open('POST', '/api/class/getClassList', true);
		classListXHR.responseType = 'json';
		classListXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				displayClassList(this.response.classList);
				$('a.addClassSessionLink').click(function(event) {
					var target = event.target.parentElement;
					$('#class_id').val(target.querySelector('input.classId').value);
				});
				$('a.editClassLink').click(function(event) {
					var target = event.target.parentElement;
					$('#edit_therapist_id').val(target.querySelector('input.tharapistId').value);
					$('#edit_class_name').val(target.querySelector('div.className').textContent);
					$('#edit_new_class_name').val(target.querySelector('div.className').textContent);
					$('#edit_class_size').val(target.querySelector('div.classMax').textContent);
					$('#edit_class_start_date').val(target.querySelector('div.classEnd').textContent);
					$('#edit_class_end_date').val(target.querySelector('div.classStart').textContent);
				});
			}
		}, false);
		classListXHR.send();
	}
	function displayClassList (currentClasses) {
		var classListDiv = document.getElementById('classList');
		classListDiv.innerHTML = '';
		if (currentClasses.length == 0) {
			var noSessionP = document.createElement('p');
			noSessionP.textContent = 'No classes available';
			classListDiv.appendChild(noSessionP);
			return;			
		}
		currentClasses.forEach(function(therapyClass) {
			var classLi = createClassLi(therapyClass);
			classListDiv.appendChild(classLi);
		});
	}
	function createClassLi (classData) {
		var classLi = document.createElement('li'),
			classId = document.createElement('input'),
			therapistId = document.createElement('input'),
			className = document.createElement('div'),
			therapistName = document.createElement('div'),
			classSize = document.createElement('div'),
			classMax = document.createElement('div'),
			classStart = document.createElement('div'),
			classEnd = document.createElement('div');
		if (userType == 'Therapist') {
			var editClassLink = document.createElement('a'),
			classActivationLink = document.createElement('a'),
			addClassSessionLink = document.createElement('a');
			if (classData.class_status == 'Active') {
				classActivationLink.textContent = '↺';
				classActivationLink.title = 'Deactivate Class';
			} else {
				classActivationLink.textContent = '↻';
				classActivationLink.title = 'Activate Class';
			}
			classActivationLink.addEventListener('click', classActivationXHR, false);
			classActivationLink.href = '#';
			editClassLink.href = '#editClassModal';
			editClassLink.setAttribute('data-toggle','modal');
			editClassLink.textContent = '✎';
			editClassLink.title = 'Edit Class Name';
			editClassLink.className = 'editClassLink';
			addClassSessionLink.href = '#addSessionModal';
			addClassSessionLink.textContent = '✚';
			addClassSessionLink.className = 'addClassSessionLink';
			addClassSessionLink.title = 'Add Session to Class';
			addClassSessionLink.setAttribute('data-toggle','modal');
		} else {
			var classSubscriptionLink = document.createElement('a');
			classSubscriptionLink.href = '#';
			classSubscriptionLink.addEventListener('click', classSubscriptionXHR, false);
			if (classData.class_status == 'Active' && classData.num_registrants < classData.class_size) {
				// if (classData.registrants && classData.registrants.indexOf(userID) != -1) {

				// }
			}
		}
		classLi.id = classData.class_name;
		classLi.className = 'classListing '+(classData.class_status == 'Active'?'classActive':'classInactive');
		classId.type = 'hidden';
		classId.value = classData.class_id;
		classId.className = 'classId';
		therapistId.type = 'hidden';
		therapistId.value = classData.therapist_id;
		therapistId.className = 'tharapistId';
		className.className = 'className';
		className.title = classData.class_name;
		className.textContent = classData.class_name;
		classSize.className = 'classSize';
		classSize.textContent = classData.num_registrants;
		classMax.className = 'classMax';
		classMax.textContent = classData.class_size;
		classStart.className = 'classStart';
		var classStartDate = new Date(classData.class_start_date);
		classStart.textContent = classStartDate.toDateString();
		classEnd.className = 'classEnd';
		var classEndDate = new Date(classData.class_end_date);
		classEnd.textContent = classEndDate.toDateString();
		therapistName.className = 'classTherapist';
		therapistName.textContent = classData.therapist_first_name+' '+classData.therapist_last_name;
		classLi.appendChild(classId);
		classLi.appendChild(therapistId);
		classLi.appendChild(className);
		classLi.appendChild(classSize);
		classLi.appendChild(classMax);
		classLi.appendChild(classStart);
		classLi.appendChild(classEnd);
		classLi.appendChild(therapistName);
		if (userType == 'Therapist') {
			classLi.appendChild(classActivationLink);
			classLi.appendChild(editClassLink);
			classLi.appendChild(addClassSessionLink);
		} else {
			classLi.appendChild(classSubscriptionLink);
		}
		getClassSessionsList(classData.class_id, classLi);
		return classLi;
	}
	function getClassSessionsList (classId, classList) {
		var formData = new FormData();
		formData.append('class_id', classId);
		var classSessionList = new XMLHttpRequest();
		classSessionList.open('POST', '/api/class/getClassSessionList', true);
		classSessionList.responseType = 'json';
		classSessionList.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				displayClassSessionsList(this.response.classSessionList, classList);
			}
		}, false);
		classSessionList.send(formData);
	}
	function displayClassSessionsList (currentSessions, classList) {
		var classSessionsUl = document.createElement('ul');
		classSessionsUl.className = 'sessionList';
		if (currentSessions.length == 0) {
			var	classSessionLi = document.createElement('li');
			classSessionLi.className = 'noSession';
			classSessionLi.textContent = 'No sessions available ';
			classSessionsUl.appendChild(classSessionLi)
		} else {
			currentSessions.forEach(function(therapyClassSession) {
				var classSessionLi = createClassSessionLi(therapyClassSession, classList.querySelector('div.classMax').textContent);
				classSessionsUl.appendChild(classSessionLi);
			});
		}
		classList.appendChild(classSessionsUl);
	}
	function createClassSessionLi (classSessionData, classMaxSize) {
		var	classSessionLi = document.createElement('li'),
			classSessionDate = document.createElement('div'),
			classSessionId = document.createElement('input'),
			classSessionName = document.createElement('div'),
			classSessionTime = document.createElement('div'),
			classSessionSpacer = document.createElement('div'),
			classSessionNumUsers = document.createElement('div'),
			classSessionStartLink = document.createElement('a');
		classSessionLi.id = classSessionData.class_session_name;
		classSessionLi.className = 'sessionListing '+(classSessionData.class_session_status == 'Active'?'sessionActive':'sessionInactive');
		var classSessionDateObj = new Date(classSessionData.class_session_date);
		classSessionDate.textContent = classSessionDateObj.toDateString();
		classSessionDate.className = 'sessionDate';
		classSessionId.type = 'hidden';
		classSessionId.value = classSessionData.class_session_id;
		classSessionName.className = 'sessionName';
		classSessionName.textContent = classSessionData.class_session_name;
		if (userType == 'Therapist') {
			var classSessionActivationLink = document.createElement('a');
			classSessionActivationLink.href = '#';
			classSessionActivationLink.addEventListener('click', sessionActivationXHR, false);
			if (classSessionData.class_session_status == 'Active') {
				classSessionActivationLink.textContent = '↺';
				classSessionActivationLink.title = 'Deactivate Session';
			} else {
				classSessionActivationLink.textContent = '↻';
				classSessionActivationLink.title = 'Activate Session';
			}
		}
		classSessionTime.textContent = classSessionData.class_session_time;
		classSessionTime.className = 'sessionTime';
		classSessionNumUsers.textContent = classSessionData.class_session_users_attended;
		classSessionNumUsers.className = 'sessionNum';
		classSessionLi.appendChild(classSessionId);
		classSessionLi.appendChild(classSessionName);
		classSessionLi.appendChild(classSessionNumUsers);
		classSessionLi.appendChild(classSessionDate);
		classSessionLi.appendChild(classSessionTime);
		classSessionLi.appendChild(classSessionSpacer);
		if (userType == 'Therapist')
			classSessionLi.appendChild(classSessionActivationLink);
		classSessionStartLink.href = '#';
		classSessionStartLink.textContent = '▶';
		classSessionStartLink.addEventListener('click', startSessionConference, false);
		classSessionLi.appendChild(classSessionStartLink);
		return classSessionLi;
	}
	function addClass (form) {
		var formData = new FormData(form);
		var addClassXHR = new XMLHttpRequest();
		addClassXHR.open('POST', '/api/class/addClass', true);
		addClassXHR.responseType = 'json';
		addClassXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				getClassList();
				$('#class_start_date').datepicker('option', 'dateFormat', 'D M d yy');
				$('#class_end_date').datepicker('option', 'dateFormat', 'D M d yy');
			}
		}, false);
		addClassXHR.addEventListener('error', function(err) {
			alert('An error occured when adding class' + err);
		});
		addClassXHR.send(formData);
	}
	function addClassSession (form) {
		var formData = new FormData(form);
		var addClassXHR = new XMLHttpRequest();
		addClassXHR.open('POST', '/api/class/addClassSession', true);
		addClassXHR.responseType = 'json';
		addClassXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				getClassList();
				// getClassSessionsList();
				$('#class_session_date').datepicker('option', 'dateFormat', 'D M d yy');
				$('#class_session_time').timepicker('option', 'timeFormat', 'g:ia');
			}
		}, false);
		addClassXHR.send(formData);
	}
	function editClass (form) {
		var formData = new FormData(form);
		var addClassXHR = new XMLHttpRequest();
		addClassXHR.open('POST', '/api/class/updateClassInfo', true);
		addClassXHR.responseType = 'json';
		addClassXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				getClassList();
				$('#edit_class_start_date').datepicker('option', 'dateFormat', 'D M d yy');
				$('#edit_class_end_date').datepicker('option', 'dateFormat', 'D M d yy');
			}
		}, false);
		addClassXHR.send(formData);
	}
	function classActivationXHR (event) {
		var formData = new FormData();
		formData.append('class_name', event.target.parentElement.id);
		var action = event.target.parentElement.className;
		action = action.indexOf('classActive') == -1?'reactivateClass':'deactivateClass';
		var classActXHR = new XMLHttpRequest();
		classActXHR.open('POST', '/api/class/'+action, true);
		classActXHR.responseType = 'json';
		classActXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				getClassList();
			}
		}, false);
		classActXHR.send(formData);
	}
	function sessionActivationXHR (event) {
		var formData = new FormData();
		formData.append('class_id', event.target.parentElement.parentElement.parentElement.querySelector('input[type="hidden"]').value);
		formData.append('class_session_name', event.target.parentElement.id);
		var action = event.target.parentElement.className;
		action = action.indexOf('sessionActive') == -1?'reactivateClassSession':'deactivateClassSession';
		var sessActXHR = new XMLHttpRequest();
		sessActXHR.open('POST', '/api/class/'+action, true);
		sessActXHR.responseType = 'json';
		sessActXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				getClassList();
			}
		}, false);
		sessActXHR.send(formData);
	}
	function classSubscriptionXHR (event) {
		var formData = new FormData();
		formData.append('class_id', event.target.parentElement.querySelector('.classId').value);
		formData.append('user_id', userID);
		var action = event.target.className;
		var classSubscrXHR = new XMLHttpRequest();
		classSubscrXHR.open('POST', '/api/class/'+action, true);
		classSubscrXHR.responseType = 'json';
		classSubscrXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				getRegistrationList();
			}
		}, false);
		classSubscrXHR.send(formData);
	}
	function getRegistrationList () {
		var formData = new FormData();
		formData.append('user_id', userID);
		var getClassReistrationXHR = new XMLHttpRequest();
		getClassReistrationXHR.open('POST', '/api/class/getRegistrationList', true);
		getClassReistrationXHR.responseType = 'json';
		getClassReistrationXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				validateRegistrationLinks(this.response);
			}
		}, false);
		getClassReistrationXHR.send(formData);
	}
	function validateRegistrationLinks (registrationData) {
		var classDivs = document.querySelectorAll('.classId');
		var regList = [];
		registrationData.registrationList.forEach(function(userRegData) {
			regList.push(userRegData.class_id);
		});
		for (var i = 0; i < classDivs.length; i++) {
			var linkToSetToSetreg = classDivs[i].parentElement.querySelector('a');
			if (regList.indexOf(Number(classDivs[i].value)) == -1) {
				linkToSetToSetreg.className = 'register';
				linkToSetToSetreg.textContent = '🂡';
				linkToSetToSetreg.title = 'Subscribe to Session\n("Deal Me In")';
			} else {
				linkToSetToSetreg.className = 'unregister';
				linkToSetToSetreg.textContent = '🂠';
				linkToSetToSetreg.title = 'Unsubscribe to Session\n("Fold")';
			}
		}
	}
	function startSessionConference (event) {
		var conferenceSessionId = event.target.parentElement.querySelector('input[type="hidden"]').value;
		var formData = new FormData();
		formData.append('conference_session_id', conferenceSessionId);
		var setVideoSessionXHR = new XMLHttpRequest();
		setVideoSessionXHR.open('POST', '/setVideoSession', true);
		setVideoSessionXHR.responseType = 'json';
		setVideoSessionXHR.addEventListener('readystatechange', function() {
			if (this.readyState == 4 && this.status == 200) {
				window.location = '/chat';
			}
		}, false);
		setVideoSessionXHR.send(formData);
	}
})();
