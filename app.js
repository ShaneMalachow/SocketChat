'use strict';
const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pug = require('pug');
var port = process.env.PORT || 8081;
var fs = require('fs');

var messages = [];

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render(__dirname + '/templates/index.pug', {messages: messages});
});

io.on('connection', function (socket) {
    console.log('An anonymous user connected');
    socket.username = 'Anonymous';

    socket.on('login', function (usr) {
        socket.username = usr;
        var text = socket.username + ' logged in.';
        console.log(text);
        io.emit('login', {name: socket.username});
        messages.push({text:text});
    });

    socket.on('disconnect', function () {
        var text = socket.username + ' logged out.';
        console.log(text);
        io.emit('logout', {name: socket.username});
        messages.push({text:text});
    });

    socket.on('chat message', function (msg) {
        var data = {name: socket.username, text:msg};
        socket.isTyping = false;
        socket.broadcast.emit('chat message', data);
        socket.broadcast.emit('stopped typing', {name: socket.username});
        messages.push(data);
    });

    socket.on('typing', function(){
        if (!socket.isTyping) {
            socket.isTyping = true;
            socket.broadcast.emit('typing', {name: socket.username});
        }
    });

    socket.on('stopped typing', function(){
        socket.broadcast.emit('stopped typing', {name: socket.username})
        socket.isTyping = false;
    });

    // socket.on('relog', function(user){
    //     socket.username = user;
    //     socket.broadcast.emit('relog', user);
    // });

});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
