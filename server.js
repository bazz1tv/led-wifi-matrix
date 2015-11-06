var HTTP_PORT = 3000;
var PITALK_PORT = 9999;
//
fs = require('fs');
// must read the file synchronously else the server will be initialized before we read the port value!! readFile is async
PI_PORT = parseInt(fs.readFileSync(__dirname + '/PITALK_PORT', 'ascii'));
console.log('PITALK_PORT == ' + PITALK_PORT);
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var workerio = require('socket.io').listen(PITALK_PORT);

app.use(express.static('jqfu-9.11.2'));
app.get('/', function(req, res){
  res.sendFile('jqfu-9.11.2/jquery-ui.html', {"root": __dirname});
});

// POST method route
app.post('/', function (req, res) {
  //res.send('POST request to the homepage');
  //require('blueimp-file-upload-node')
});


http.listen(HTTP_PORT, function(){
  console.log('listening on *:' + HTTP_PORT);
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
 
 
function queue_image()
{
	// communicate to PI
    workerio.sockets.emit("queue_image", "now");
    setTimeout(queue_image, 1000);
};
 
 
queue_image();
