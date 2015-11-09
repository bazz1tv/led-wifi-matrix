var HOSTNAME="wiki.bazz1.com";
var HTTP_PORT = 3000;
var PITALK_PORT = 9999;
var FILESERVER_PORT = 8888;
var FILESERVER_URL = 'http://' + HOSTNAME + ':' + FILESERVER_PORT;
// read PITALK_PORT file
fs = require('fs');
// must read the file synchronously else the server will be initialized before we read the port value!! readFile is async
PI_PORT = parseInt(fs.readFileSync(__dirname + '/PITALK_PORT', 'ascii'));
console.log('PITALK_PORT == ' + PITALK_PORT);
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
GLOBAL.io = require('socket.io')(http);                     // global not yet REQUIRED
GLOBAL.workerio = require('socket.io').listen(PITALK_PORT); // global so fileserver.js has access
app.use(express.static('public'));                          // static files in public folder

GLOBAL.iQueue = require('./Queue.js');  //
var fileServer = require('./fileserver.js');

var connectedPeers = 0;

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
  socket.on('disconnect', function(message, callback) {
      //io.sockets.emit('worker_disconnected', "worker disconnected");
      console.log("client disconnected : ", socket.request.connection._peername);
      io.emit('numPeers_update', --connectedPeers);
    });
  socket.on('new_file_uploaded', function(data) {
    console.log("new_file_uploaded");
    /*socket.broadcast*/io.emit('new_file_uploaded', data);
  })

  // Not documented so may not work forever
  console.log('client connected :', socket.request.connection._peername);
  io.emit('numPeers_update', ++connectedPeers);
});


/*
 Worker client (python)
*/
workerio.sockets.on('connection', function (socket) {
    socket.on('disconnect', function(message, callback) {
      //io.sockets.emit('worker_disconnected', "worker disconnected");
      console.log("PI disconnected");
    });

    socket.on('image_display_done', function() {
      console.log('image_display_done');
      // dequeue image and remove image from visual Queues of all browsers
      var itemToDelete = iQueue.dequeue();
      io.sockets.emit('remove_img', itemToDelete);
      // DELETE file from SERVER-SIDE to prevent client-side abuse
      // this currently is implemented in a style requiring the FileServer to be run from this file
      fileServer.destroyFile(itemToDelete);
      // if the queue is not empty, play another image
      playImageIfQueued();
      // see delete button on webpage I made for sample
    });
 
    //io.sockets.emit('worker_connected', "worker connected");
    console.log("PI connected");
    playImageIfQueued();
});

function playImageIfQueued()
{
  if (!iQueue.isEmpty())
  {
    workerio.emit('queue_image', iQueue.peek());
  }
}
 
 
// function queue_image()
// {
// 	// communicate to PI
//     workerio.sockets.emit("queue_image", "now");
//     setTimeout(queue_image, 1000);
// };
 
 
// queue_image();
