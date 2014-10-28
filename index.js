var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

nicknames = [];

app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));


http.listen(3000, function(){
	console.log('listening on *:3000');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
		console.log('user disconnected');
	});
});

function updateNicknames() {
	io.emit('usernames', nicknames);
}

io.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if (nicknames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	});
});

io.on('connection', function(socket){
	socket.on('chat message', function(data){
		io.emit('chat message', {msg: data, nick: socket.nickname});
	});
});

