#!/usr/bin/env python
# -*- coding: utf-8 -*- 
from socketIO_client import SocketIO
from time import sleep
from datetime import datetime
from os import system

# should be synced with filserver.js
uploadDir = 'public/files'
LED_IMAGE_VIEWER = 'led-image-viewer'
f = open('PITALK_PORT', 'r')
PITALK_PORT = int(f.read())
PITALK_SERVER = '192.168.1.1'
socketIO = SocketIO(PITALK_SERVER, PITALK_PORT)
 
def queueImage_cb(*args):
    #socketIO.emit('update_from_worker', "io-client.py: finished update - %s" % (datetime.now(),))
    #subprocess.call([/usr/local/bin/led-image-viewer ])
    print('queue_image: ' + args[0])
    system('sudo ' + LED_IMAGE_VIEWER + ' -t' + '5' + ' "' + uploadDir + '/' + args[0] + '"')
    socketIO.emit('image_display_done')

socketIO.on("queue_image", queueImage_cb)

while 1:
    socketIO.wait(seconds=1)