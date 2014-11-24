var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

	users = {};

app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));
 

http.listen(3000, function(){
	console.log('listening on *:3000');
});

io.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if (data in users) {
			callback(false);
		} else {
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = data;
			updateNicknames();
		}
	});
});

io.on('connection', function(socket){
	socket.on('chat message', function(data, callback){
		console.log(users);
		var msg = data.trim();
		if(msg.substr(0,3) === '/w ') {
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1) {
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if (name in users) {
					console.log(io);
					console.log(users[name]);
					io.users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					console.log('whisper');
				} else {
					callback('Error! Enter a valid user!');
				}
			} else {
				callback('Error! Please enter a message for your whisper.');
			}
		} else {
			io.emit('chat message', {msg: msg, nick: socket.nickname});
		}
	});
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
		console.log('user disconnected');
	});
});

function updateNicknames() {
	io.emit('usernames', Object.keys(users));
}


