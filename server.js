var HOSTNAME="wiki.bazz1.com";
var HTTP_PORT = 3000;
var PITALK_PORT = 9999;
var FILESERVER_PORT = 8888;
var FILESERVER_URL = 'http://' + HOSTNAME + ':' + FILESERVER_PORT;
//
fs = require('fs');
// must read the file synchronously else the server will be initialized before we read the port value!! readFile is async
PI_PORT = parseInt(fs.readFileSync(__dirname + '/PITALK_PORT', 'ascii'));
console.log('PITALK_PORT == ' + PITALK_PORT);
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
GLOBAL.io = require('socket.io')(http);
GLOBAL.workerio = require('socket.io').listen(PITALK_PORT);
app.use(express.static('public'));

GLOBAL.iQueue = require('./Queue.js');
require('./fileserver.js');

// var proxy = require('http-proxy').createProxyServer({
//     host: 'http://wiki.bazz1.com',
//     port: '8888'
// });

// app.get('/gfx-upload', function(req, res, next) {
//   res.redirect(FILESERVER_URL);
// });

// app.use('/gfx-upload', function(req, res, next) {
  
//   //console.log(FILESERVER_URL);
//   proxy.web(req, res, {
//       target: 'http://wiki.bazz1.com:8888'
//   }, next);
  
//   // res.redirect(DERP);
// });


app.get('/', function(req, res){
  res.sendFile('jqfu-9.11.2/jquery-ui.html', {"root": __dirname});
});


http.listen(HTTP_PORT, function(){
  console.log('listening on *:' + HTTP_PORT);
});
/*
 Real clients
*/
io.on('connection', function (socket) {
  socket.on('new_file_uploaded', function(data) {
    console.log("new_file_uploaded");
    socket.broadcast.emit('new_file_uploaded', data);
  })

  //var address = socket.handshake.address;
  //console.log('New connection from ' + address.address + ':' + address.port);
  //console.log('client connected');
  //console.log(socket);
  console.log('client connected :', socket.request.connection._peername);
});


/*
 Worker client (python)
*/
workerio.sockets.on('connection', function (socket) {
    socket.on('disconnect', function(message, callback) {
      //io.sockets.emit('worker_disconnected', "worker disconnected");
      console.log("PI disconnected");
    });
 
    // When we receive an update from worker.
    socket.on('update_from_worker', function(message, callback) {
      io.sockets.emit('new_update', message);
    });

    socket.on('image_display_done', function() {
      console.log('image_display_done');
      // dequeue image and remove image from visual Queues of all browsers
      var itemToDelete = iQueue.dequeue();
      io.sockets.emit('remove_img', itemToDelete);
      // if the queue is not empty, play another image
      if (!iQueue.isEmpty())
      {
        workerio.emit('queue_image', iQueue.peek());
      }
      // see delete button on webpage I made for sample
    });
 
    //io.sockets.emit('worker_connected', "worker connected");
    console.log("PI connected");
});
 
 
// function queue_image()
// {
// 	// communicate to PI
//     workerio.sockets.emit("queue_image", "now");
//     setTimeout(queue_image, 1000);
// };
 
 
// queue_image();
