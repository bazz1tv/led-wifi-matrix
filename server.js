var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var workerio = require('socket.io').listen(9999);

app.get('/', function(req, res){
  res.sendFile('client.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
/*
 Real clients
*/
io.sockets.on('connection', function (socket) {
     console.log('client connected');
});
 
 
/*
 Worker client (python)
*/
workerio.sockets.on('connection', function (socket) {
    socket.on('disconnect', function(message, callback) {
        io.sockets.emit('worker_disconnected', "worker disconnected");
    });
 
    // When we receive an update from worker.
    socket.on('update_from_worker', function(message, callback) {
        io.sockets.emit('new_update', message);
    });
 
    io.sockets.emit('worker_connected', "worker connected");
});
 
 
function askUpdates()
{
    workerio.sockets.emit("please_update", "now");
    setTimeout(askUpdates, 1000);
};
 
 
askUpdates();
