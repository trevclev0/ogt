'use strict';

var express = require('express');
var app = express();
var config = require('./config.js')[app.get('env')];
var io = require('socket.io');
var url = require('url');
var path = require('path');
var fs = require('fs');
var userDAO = require('./db/userDAO.js');
var mediaDAO = require('./db/mediaDAO.js');
var logger = require('./logger.js');
var cookie = require('cookie');
var signature = require('cookie-signature');
var store = new express.session.MemoryStore;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var fork = require('child_process').fork;
var child = fork('./peerServer.js');

//kill child process when app.js exits
process.on('exit', function() {
	child.kill();
});

app.engine('.html', require('ejs').__express);
app.set('port', process.env.PORT || config.port);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

/* Peer.JS */
io = io.listen(app.listen(app.get('port')));
io.set('log level', 1);

passport.use(new GoogleStrategy({
		clientID: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		callbackURL: GOOGLE_CALLBACK_URL
	},
	function(accessToken, refreshToken, profile, done) {

		// asynchronous verification, for effect...
		process.nextTick(function() {
			var userInfo = {
				user_first_name: profile._json.given_name,
				user_last_name: profile._json.family_name,
				user_email: profile._json.email,
				user_profile_picture: profile._json.picture,
				user_username: profile._json.id,
				user_login_provider: profile.provider
			};
		//	logger.info(JSON.stringify(userInfo));

			userDAO.getUserInfo(userInfo.user_username, function(err, userInformation) {
				if (err) { // User doesn't exist
					userDAO.addUser(userInfo, function(err) {
						if (err) {		
							logger.error('Error adding user: ' + err);
							return done(err, null);
						}
						userDAO.getUserInfo(userInfo.user_username, function(err, userInformation){
							if(err){
								logger.error('Error getting user information: ' + err);
								return done(err, null);
							}
							logger.info('SESSION INFO GOOGLE: \n' + JSON.stringify(userInformation));
							return done(null, userInformation);
						});
					});
				} else { // User exists
					userDAO.updateUserInfo(userInfo.user_username, userInfo, function(err) {
						if (err) {
							logger.error('Error updating user info: ' + err);
							return done(err, null);
						}
						userDAO.getUserInfo(userInfo.user_username, function(err, userInformation){
							if(err){
								logger.error('Error getting user information: ' + err);
								return done(err, null);
							}
							logger.info('SESSION INFO GOOGLE: \n' + JSON.stringify(userInformation));
							return done(null, userInformation);
						});
					});
				}
			});
		});
	}
));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({
	secret: SESSION_SECRET,
	store: store,
	key: SESSION_KEY
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

app.get('/auth/google',
	passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}), function(req, res) {}
);

app.get('/oauth2callback*',
	passport.authenticate('google', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		res.redirect('/class/manage');
	}
);

passport.use(new FacebookStrategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		callbackURL: FACEBOOK_APP_CALLBACK
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			var userInfo = {
				user_first_name: profile._json.first_name,
				user_last_name: profile._json.last_name,
				user_email: profile._json.link,
				user_profile_picture: 'https://graph.facebook.com/' + profile.username + '/picture',
				user_username: profile._json.id,
				user_login_provider: profile.provider
			};

			userDAO.getUserInfo(userInfo.user_username, function(err, userInformation) {
				if (err) { // User doesn't exist
					userDAO.addUser(userInfo, function(err) {
						if (err) {		
							logger.error('Error adding user: ' + err);
							return done(err, null);
						}
						userDAO.getUserInfo(userInfo.user_username, function(err, userInformation){
							if(err){
								logger.error('Error getting user information: ' + err);
								return done(err, null);
							}
							logger.info('SESSION INFO FACEBOOK: \n' + JSON.stringify(userInformation));
							return done(null, userInformation);
						});
					});
				} else { // User exists
					userDAO.updateUserInfo(userInfo.user_username, userInfo, function(err) {
						if (err) {
							logger.error('Error updating user info: ' + err);
							return done(err, null);
						}
						userDAO.getUserInfo(userInfo.user_username, function(err, userInformation){
							if(err){
								logger.error('Error getting user information: ' + err);
								return done(err, null);
							}
							logger.info('SESSION INFO FACEBOOK: \n' + JSON.stringify(userInformation));
							return done(null, userInformation);
						});
					});
				}
			});
		});
	}
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect: '/class/manage',
		failureRedirect: '/login'
	})
);

passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
	function(username, password, done) {
		logger.info('Local Authentication');

		process.nextTick(function() {
			userDAO.login(username, password, function(err) {
				if (err) {
					return done(null, false, {
						error: err
					});
				} else {
					userDAO.getUserInfo(username, function(err, userInfo) {
						if (err) {
							return done(null, false, {
								error: err
							});
						} else {
							logger.debug('Returned userInfo to local authentication: ' + JSON.stringify(userInfo));
							return done(null, userInfo);
						}
					});
				}
			});
		});
	}
));

app.get('/auth/local',
	function(req, res, next) {
		logger.info('Before Local Authentication');

		passport.authenticate('local', {
				successRedirect: '/class/manage',
				failureRedirect: '/login'
			},
			function(err, user, info) {
				logger.debug('Authenticate Callback');

				if (err) {
					res.redirect('login?err=true');
				} else if (!user) {
					res.redirect('login?err=nouser');
				}

				req.logIn(user, function(err) {
					console.log(user);
					if (err) {
						res.redirect('login?err=badpass');
					} else {
						res.redirect('/class/manage');
					}
				});
			})(req, res, next);
	},
	function(err, req, res, next) { // failure in login test route
		return res.send({
			status: 'err',
			message: err.message
		});
	}
);

require('./endpoints')(app); // Include all of the other endpoints

app.get('/chat', function(req, res) {
	if (!isLoggedIn(req)) {
		res.redirect('/login');
		return;
	}

	console.log(req.user.user_type);

	// Sends the HTML file
	var user = {
		name: req.user.user_first_name,
		picture: req.user.user_profile_picture,
		type: req.user.user_type,
		id: req.user.user_id
	};
	res.render('conferenceRoom', user);
});

app.get('/login', function(req, res) {
	var urlParts = url.parse(req.url),
		path = urlParts.pathname,
		path = path.substr(1);

	logger.info('Incoming Request: "' + path + '"'); // Log the incoming request

	// Sends HTML file
	res.render('login');
});

app.get('/class/manage', function(req, res) {
	if (!isLoggedIn(req)) {
		res.redirect('/login');
		return;
	}
	var uInfo = req.user;
	logger.info('Class Management - User: "' + uInfo.user_first_name + ' ' + uInfo.user_last_name + '" Type: ' + uInfo.user_type);
	res.render('classManagement', uInfo);
});

app.post('/setVideoSession', function(req, res) {
	if (!isLoggedIn(req)) {
		res.redirect('/login');
		return;
	}
	req.session.conferenceSessionId = req.body.conference_session_id;
	res.send();
});

// Serves files without hardcoding
app.get('/*', function(req, res) {
	var urlParts = url.parse(req.url),
		path = urlParts.pathname,
		path = path.substr(1);

	if (path == '') {
		res.redirect('/class/manage');
		return;
	}
	logger.debug('urlParts.pathname: ' + urlParts.pathname);
	logger.info('Incoming Request: "' + path + '"'); // Log the incoming request

	res.sendfile('public/' + path);
});

function isLoggedIn(req) {
	return req.user;
}

io.set('authorization', function(handshake, accept) {

	if (handshake.headers.cookie == null) {
		accept(null, false);
	} else {
		var sid = cookie.parse(handshake.headers.cookie)[SESSION_KEY];
		sid = sid.replace('s:', '');
		sid = signature.unsign(sid, SESSION_SECRET);

		store.get(sid, function(err, session) {
			if (err) {
				console.log('err authenticating');
				accept(null, false);
			} else if (session == null || session.passport == null || session.passport.user == null) {
				console.log('not loging in (socket authentication)');
				accept(null, false);
			} else {
				handshake.conferenceSessionId = session.conferenceSessionId;
				handshake.user = session.passport.user;
				console.log('authenticated socket');
				console.log(handshake.user);
				accept(null, true);
			}
		});
	}
});

io.sockets.on('connection', function(socket) {
	/*	if(socket.handshake.query.room == null || socket.handshake.query.room == '' ) {
		socket.handshake.query.room = '0';
	}

	if(socket.handshake.query.uName == null || socket.handshake.query.uName == '' ) {
		socket.handshake.query.uName = 'anonymous';
	}
*/
	var room = socket.handshake.conferenceSessionId;
	var user = socket.handshake.user.user_first_name;
	socket.join(room);

	socket.emit('message', {
		userName: 'Server',
		message: 'Welcome to the Chat',
		
	});
	
	socket.emit('classSessionId',{
		classSessionId: room
	});

	socket.on('newPeer', function() {
		socket.broadcast.to(room).emit('newPeer', {
			peerID: socket.handshake.query.peerID,
			uName: user
		});
	});

	socket.on('disconnect', function() {
		logger.info('Disconected: ' + socket.handshake.query.peerID);
		socket.broadcast.to(room).emit('peerDisconected', {
			peerID: socket.handshake.query.peerID
		});
	});

	socket.on('message', function(data) {
		io.sockets. in (room).emit('message', {
			message: data.message,
			userName: user
		});
	});

	socket.on('presentation', function(data) {
		io.sockets. in (room).emit('presentation', data);
	});

	socket.on('getPresentationData', function(data) {
		logger.info("getPresentationData: " + data.presentationName);
		
		mediaDAO.getMediaInfo(data.presentationName, function(err, mediaInfo){
			if(err){
				logger.info("getPresentationData-error: " + err);
			}
			
			io.sockets.in(room).emit('presentationData', mediaInfo);
		});
	});

	socket.on('requestSlideRefresh', function(data) {
		io.sockets. in (room).emit('requestSlideRefresh', data);
	});
	socket.on('sendQuestion', function(data){
		io.sockets.in(room).emit('getQuestion',data);
	});
	socket.on('sendAnswer', function(data){
		io.sockets.in(room).emit('getAnswer', data);
	});
});
