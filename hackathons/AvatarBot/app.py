# Avatar Control : A Web Service to control robot with http requests.
# Author :  Korhan Akcura

import json
import requests
import requests
import cv2
import base64
import logging
#import RPi.GPIO as GPIO
import atexit

from logging.handlers import RotatingFileHandler

from flask import Flask, jsonify, Response

from time import sleep

app = Flask(__name__, static_url_path='')

'''
GPIO.setmode(GPIO.BCM)

# Create a dictionary called motors to store the pin number, port type:
motors = {
	'motor1E' : {'pin' : 18},
	'motor1L' : {'pin' : 23},
	'motor1R' : {'pin' : 24},
	'motor2E' : {'pin' : 17},
	'motor2L' : {'pin' : 27},
	'motor2R' : {'pin' : 22},
	'motor3E' : {'pin' : 25},
	'motor3L' : {'pin' : 8},
	'motor3R' : {'pin' : 7},
	'motor4E' : {'pin' : 5},
	'motor4L' : {'pin' : 6},
	'motor4R' : {'pin' : 13}
}

GPIO.setup(motors['motor1E']['pin'], GPIO.OUT)
GPIO.setup(motors['motor1L']['pin'], GPIO.OUT)
GPIO.setup(motors['motor1R']['pin'], GPIO.OUT)

GPIO.setup(motors['motor2E']['pin'], GPIO.OUT)
GPIO.setup(motors['motor2L']['pin'], GPIO.OUT)
GPIO.setup(motors['motor2R']['pin'], GPIO.OUT)

GPIO.setup(motors['motor3E']['pin'], GPIO.OUT)
GPIO.setup(motors['motor3L']['pin'], GPIO.OUT)
GPIO.setup(motors['motor3R']['pin'], GPIO.OUT)

GPIO.setup(motors['motor4E']['pin'], GPIO.OUT)
GPIO.setup(motors['motor4L']['pin'], GPIO.OUT)
GPIO.setup(motors['motor4R']['pin'], GPIO.OUT)

GPIO.output(motors['motor1E']['pin'], 0)
GPIO.output(motors['motor1L']['pin'], 0)
GPIO.output(motors['motor1R']['pin'], 0)

GPIO.output(motors['motor2E']['pin'], 0)
GPIO.output(motors['motor2L']['pin'], 0)
GPIO.output(motors['motor2R']['pin'], 0)

GPIO.output(motors['motor3E']['pin'], 0)
GPIO.output(motors['motor3L']['pin'], 0)
GPIO.output(motors['motor3R']['pin'], 0)

GPIO.output(motors['motor4E']['pin'], 1)
GPIO.output(motors['motor4L']['pin'], 0)
GPIO.output(motors['motor4R']['pin'], 0)
'''

def motor1L():
	GPIO.output(motors['motor1E']['pin'], 1)
	GPIO.output(motors['motor1L']['pin'], 1)
	GPIO.output(motors['motor1R']['pin'], 0)
	return

def motor1R():
	global motor1E, motor1L, motor1R
	GPIO.output(motors['motor1E']['pin'], 1)
	GPIO.output(motors['motor1L']['pin'], 0)
	GPIO.output(motors['motor1R']['pin'], 1)
	return

def motor1C():
	GPIO.output(motors['motor1L']['pin'], 0)
	GPIO.output(motors['motor1R']['pin'], 0)
	return

def motor2L():
	GPIO.output(motors['motor2E']['pin'], 1)
	GPIO.output(motors['motor2L']['pin'], 1)
	GPIO.output(motors['motor2R']['pin'], 0)
	return

def motor2R():
	GPIO.output(motors['motor2E']['pin'], 1)
	GPIO.output(motors['motor2L']['pin'], 0)
	GPIO.output(motors['motor2R']['pin'], 1)
	return

def motor2C():
	GPIO.output(motors['motor2L']['pin'], 0)
	GPIO.output(motors['motor2R']['pin'], 0)
	return

def motor3L():
	GPIO.output(motors['motor3E']['pin'], 1)
	GPIO.output(motors['motor3L']['pin'], 1)
	GPIO.output(motors['motor3R']['pin'], 0)
	return

def motor3R():
	GPIO.output(motors['motor3E']['pin'], 1)
	GPIO.output(motors['motor3L']['pin'], 0)
	GPIO.output(motors['motor3R']['pin'], 1)
	return

def motor3C():
	GPIO.output(motors['motor3L']['pin'], 0)
	GPIO.output(motors['motor3R']['pin'], 0)
	return

def motor4L():
	GPIO.output(motors['motor4E']['pin'], 1)
	GPIO.output(motors['motor4L']['pin'], 1)
	GPIO.output(motors['motor4R']['pin'], 0)
	return

def motor4R():
	GPIO.output(motors['motor4E']['pin'], 1)
	GPIO.output(motors['motor4L']['pin'], 0)
	GPIO.output(motors['motor4R']['pin'], 1)
	return

def motor4C():
	GPIO.output(motors['motor4L']['pin'], 0)
	GPIO.output(motors['motor4R']['pin'], 0)
	return

def clear_on_close():
	GPIO.cleanup()
	return

def stop_motors():
	motor1C()
	motor2C()
	motor3C()
	motor4C()
	return

@app.route("/")
def root(): 
	return app.send_static_file('index.html')

def gen(camera):
	while True:
		frame = camera.get_frame()
		yield (b'--frame\r\n'
		       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')		     

@app.route("/video_feed")
def video_feed():
	return Response(gen(Camera()),
			mimetype='multipart/x-mixed-replace; boundary=frame')
  
@app.route("/api/stream", methods=['GET', 'POST'])
def take_and_send_picture():
	# initialize the camera
	cam = cv2.VideoCapture(0)
	ret, img = cam.read()
	if ret:
		retval = cv2.imencode('.jpg', img)[1].tobytes() 
	cam.release()
	
	return retval


@app.route("/api/turn_left", methods=['GET', 'POST']) 
def turn_left():
	'''
	motor1R()
	motor3R()

	motor2L()
	motor4L()

	sleep(1.0)

	stop_motors()
	'''
	
	return jsonify({"result" : "LEFT SUCCESS"})


@app.route("/api/turn_right", methods=['GET', 'POST']) 
def turn_right():
	'''
	motor1L()
	motor3L()

	motor2R()
	motor4R()

	sleep(1.0)

	stop_motors()
	'''

	return jsonify({"result" : "RIGHT SUCCESS"})


@app.route("/api/move_forward", methods=['GET', 'POST']) 
def move_forward():
	'''
	motor1L()
	motor3L()

	motor2L()
	motor4L()

	sleep(0.5)
	'''

	return jsonify({"result" : "FORWARD SUCCESS"})


@app.route("/api/move_backward", methods=['GET', 'POST']) 
def move_backward():
	'''
	motor1R()
	motor3R()

	motor2R()
	motor4R()

	sleep(0.5)
	'''

	return jsonify({"result" : "BACKWARD SUCCESS"})


@app.route("/api/stop", methods=['GET', 'POST']) 
def stop():
	#stop_motors()

	return jsonify({"result" : "STOP SUCCESS"})

if __name__ == '__main__':
	handler = RotatingFileHandler('flask.log', maxBytes=10000, backupCount=1)
	handler.setLevel(logging.INFO)
	app.logger.addHandler(handler)
	atexit.register(clear_on_close)
	app.run(host="0.0.0.0",port=5000)

