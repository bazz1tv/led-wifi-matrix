from socketIO_client import SocketIO
from time import sleep
from datetime import datetime
 
socketIO = SocketIO('localhost', 9999)
 
def pleaseUpdate_cb(*args):
    socketIO.emit('update_from_worker', "io-client.py: finished update - %s" % (datetime.now(),))
 
socketIO.on("please_update", pleaseUpdate_cb)
 
while 1:
    socketIO.wait(seconds=1)