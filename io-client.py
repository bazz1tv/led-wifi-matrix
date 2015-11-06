from socketIO_client import SocketIO
from time import sleep
from datetime import datetime
import subprocess

f = open('PITALK_PORT', 'r')
PITALK_PORT = int(f.read())
PITALK_SERVER = 'localhost'
socketIO = SocketIO(PITALK_SERVER, PITALK_PORT)
 
def queueImage_cb(*args):
    socketIO.emit('update_from_worker', "io-client.py: finished update - %s" % (datetime.now(),))
    #subprocess.call([/usr/local/bin/led-image-viewer ])
 
socketIO.on("queue_image", queueImage_cb)
 
while 1:
    socketIO.wait(seconds=1)