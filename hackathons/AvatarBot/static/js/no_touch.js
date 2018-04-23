/*!
* NoTouch.js V1.0
* A JavaScripy library for motion based control of a webpage.
* Created by Korhan Akcura
*/

var debug = false;
var camera_control = true;
var audio_control = false;
var stream_audio = false;
var pointer_radius = 25;

// Browser polyfills
//===================
if (!window.URL) {
	window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
}

if (!navigator.getUserMedia) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
}
if (!navigator.getUserMedia) {
	console.log('NoTouch.js not supported on this browser!');
}

var video_camera = document.createElement('video');
var video_cavans = document.createElement('canvas');
var pointer = document.createElement('div');

if(debug){
	var motion_cavans = document.createElement('canvas');
	var c_=motion_cavans.getContext('2d');
}
initilizeTracking();

var video=document.getElementById('no_touch_video_camera');
var canvas=document.getElementById('no_touch_video_canvas');
var _=video_cavans.getContext('2d');

navigator.getUserMedia({video:camera_control,audio:audio_control},function(stream){
	video_camera.muted = stream_audio;
	video_camera.src=window.URL.createObjectURL(stream);
	video_camera.addEventListener('play', function(){
			setInterval(grabVideoFrame,25);
		}
	);
	//listen_audio(stream);
},function(error){
	throw new Error(error);
});


/*var audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
var dataArray = new Uint8Array(analyser.frequencyBinCount);
var pitchSamples = [];
function listen_audio(stream){
	audioContext.createMediaStreamSource(stream).connect(analyser);
	analyser.frequencyBinCount;
	setTimeout(function(){ 
		analyser.getByteTimeDomainData(dataArray);
		//audioContext.disconnect();
		var lastPos = 0;
		var lastItem = 0;
		dataArray.forEach((item, i) => {
			if (lastItem != item) { // we have crossed below the mid point
				const elapsedSteps = i - lastPos; // how far since the last time we did this
				lastPos = i;

				const hertz = 1 / (elapsedSteps / 44100);
				pitchSamples.push(hertz); // an array of every pitch encountered
			}
			lastItem = item;
		});
		var sum = dataArray.reduce(function(a, b) { return (a + b)%256; });
		//var avg = Math.round(sum / dataArray.length);
		console.log(sum);
	}, 3000);
};*/


var compression=5;
var width=0;
var height=0;
var widthMapRatio = 1;
var heightMapRatio = 1;
function grabVideoFrame(){
	if(video_cavans.width!=video_camera.clientWidth){
		width=Math.floor(video_camera.clientWidth/compression);
		height=Math.floor(video_camera.clientHeight/compression);
		video_cavans.width=width;
		video_cavans.height=height;
		if(debug){
			motion_cavans.width=width;
			motion_cavans.height=height;
		}
	}
	widthMapRatio = Math.round(window.innerWidth/width);
	heightMapRatio = Math.round(window.innerHeight/height);

	_.drawImage(video,width,0,-width,height);
	draw=_.getImageData(0,0,width,height);
	detectMovement();
}

last=false;
maxAssessableColorChange=150;
down=false;
wasdown=false;
var cursor_point = {};
var detect_count = 0;
var move_counter = 0;
var click_counter = 0;
var move_coordinate = {};
function detectMovement(){
	var delt = _.createImageData(width, height);
	if(last!==false){
		var x = 0;
		var y = 0;
		var totalx=0;
		var totaly=0;
		var totald=0;
		var totaln = delt.width * delt.height;
		var dscl = 0;
		var pix = 0;
		var cursor_pixel = null;
		var target_x = 0;
		var target_y = 0;

		for (pix = totaln * 4; 0 < pix; pix -= 4) {
			// Don't do [pix+3] because alpha doesn't change
			var d= Math.abs(draw.data[pix] - last.data[pix]) + Math.abs(draw.data[pix+1] - last.data[pix+1]) + Math.abs(draw.data[pix+2] - last.data[pix+2]);
			if(d > maxAssessableColorChange){
				if(debug){
					delt.data[pix] = 255; //R
					delt.data[pix+1] = 255; //G
					delt.data[pix+2] = 255; //B
					delt.data[pix+3] = 255; //alpha
				}
				x = ((pix/4) % width);
				y = (Math.floor((pix/4)/delt.height));
				var deltx = x-cursor_point.x;
				var delty = y-cursor_point.y;
				if(((Math.abs(deltx)<10) && Math.abs(delty)<10) || !cursor_point.hasOwnProperty("x")) {
					target_x = x;
					target_y = y;

					cursor_pixel = pix;
				}
				totald+=1;
				totalx+=x;
				totaly+=y;
			}
		}
		if (cursor_pixel > 3){
			move_counter = 0;
			var actual_cord = getScreenCord(target_x,target_y);
			if(!click_counter){
				movePointer(actual_cord);
				lock_click(actual_cord);
			} else {
				click(actual_cord);
			}
		} else if (move_counter === 30) {
			// Reset the movement for a new position
			move_counter = 0;
			cursor_point = {};
			if(click_counter){
				unlock_click();
			}
		} else if(move_coordinate.hasOwnProperty("x") && Math.abs(move_coordinate.x-x)<5 && Math.abs(move_coordinate.y-y)<5) {
			move_counter += 1;
		} else {
			move_coordinate = {
				x: x,
				y: y
			};
		}
		if(totald){
			down={
				x:totalx/totald,
				y:totaly/totald,
				d:totald
			};
			detectDirection();
		}
	}
	last=draw;
	if(debug){
		c_.putImageData(delt,0,0);
	}

}

function getScreenCord(x_cord, y_cord) {

	cursor_point = {
		x: x_cord,
		y: y_cord
	};

	// Maximum x, y coordinate values.
	var max_x = window.innerWidth - (2*pointer_radius);
	var max_y = window.innerHeight - (2*pointer_radius);

	var x_pos = (width - x_cord) * widthMapRatio;
	var y_pos = y_cord * heightMapRatio;
	// Do not go out of the visible screen area.
	if(x_pos>max_x){
		x_pos = max_x;
	}
	if(y_pos>max_y){
		y_pos = max_y;
	}

	return {
		x: x_pos,
		y: y_pos
	};
}

function movePointer(actual_cord) {
	move_counter = 0;
	move_coordinate = [];

	pointer.style.left = Math.round(window.scrollX) + actual_cord.x + "px";
	pointer.style.top = Math.round(window.scrollY) + actual_cord.y + "px";
}

fingerMap = {};
function fingerDetector() {
}

function initilizeTracking() {
	video_camera.id = "no_touch_video_camera";
	video_camera.style.cssText = "visibility: hidden;";
	video_camera.autoplay = true;
	video_cavans.id = "no_touch_video_canvas";
	video_cavans.style.cssText = "visibility: hidden;";
	pointer.id = "no_touch_pointer";
	pointer.style.cssText = "top: 0px;left: 0px;";
	document.body.appendChild(video_camera);
	document.body.appendChild(video_cavans);
	document.body.appendChild(pointer);
	if(debug){
		video_cavans.style.cssText = "position:absolute;bottom: 0;left: 0; width:500px;";
		motion_cavans.id = "no_touch_motion_canvas";
		motion_cavans.style.cssText = "position:absolute;bottom: 0;left: 0; width:500px;";
		document.body.appendChild(motion_cavans);
	}
	// Add style for NoTouch.js
	var pointer_diameter = 2 * pointer_radius;
	var sheet = document.createElement('style');
	sheet.innerHTML = "#no_touch_pointer {z-index:999; position:absolute; width:"+pointer_diameter+"px; height:"+pointer_diameter+"px; box-sizing:content-box;" +
			"-webkit-border-radius:50%; -moz-border-radius:50% ;border-radius:50%; background:red; opacity:0.6; transition:all .1s; }" +
		"@keyframes spin {0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}" +
		".no_touch_click_element {min-width: 200px; min-height: 200px;}";
	document.body.appendChild(sheet);
}

var lock_counter = 0;
var lockedelement = null;
var last_element = null;
function lock_click(actual_cord) {
	lockedelement = document.elementFromPoint(actual_cord.x, actual_cord.y);
	if(check_clickable(lockedelement)){
		//pointer.style.top = (Math.round(window.scrollX)+(lockedelement.offsetTop + lockedelement.offsetHeight / 2)-pointer_radius) + "px";
		//pointer.style.left = (Math.round(window.scrollY)+(lockedelement.offsetLeft + lockedelement.offsetWidth / 2)-pointer_radius) + "px";
		pointer.style.border = "16px solid #f3f3f3"; 
		if(lock_counter === 10){
			click_counter = 1;
			pointer.style.cssText = pointer.style.cssText + "border-top: 16px solid blue; animation: spin 2s linear infinite;";
		} else	if(lockedelement === last_element) {
			lock_counter += 1;
		} else {
			last_element = lockedelement;
		}
	} else {
		pointer.style.border = "";
	}
}

function click(actual_cord) {
	var current_element = document.elementFromPoint(actual_cord.x, actual_cord.y);
	if(current_element !== lockedelement && check_clickable(current_element)){
		// Unlock click event
		unlock_click();
	} else {
		if(click_counter === 35){
			lockedelement.click();
			unlock_click();
		} else {
			click_counter += 1;
			if(click_counter == 10) {
				pointer.style.cssText = pointer.style.cssText + "border-right: 16px solid blue;";
			} else if(click_counter == 20) {
				pointer.style.cssText = pointer.style.cssText + "border-bottom: 16px solid blue;";
			} else if(click_counter == 30) {
				pointer.style.cssText = pointer.style.cssText + "border-left: 16px solid blue;";
			}
		}
	}
}

function unlock_click() {
		if(click_counter || lock_counter){
			pointer.style.cssText = "top: "+pointer.style.top+";left: "+pointer.style.left+";";
		}
		lock_counter = 0;
		last_element = null;
		click_counter = 0;
}

function check_clickable(element) {
	if(element && (element.classList.contains("no_touch_click_element") ||
		(element.type && element.type.match(/^(submit|button|reset|checkbox|radio)$/)) ||
		(element.tagName && element.tagName.match(/^(A|BUTTON|INPUT)$/)) )){
		return true;
	}
	return false;
}

var movethresh=2;
var brightthresh=300;

function calibrate(){
	wasdown={
		x:down.x,
		y:down.y,
		d:down.d
	};
}

var avg=0;
//States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end
var state=0;
function detectDirection(){
	avg=0.9*avg+0.1*down.d;
	var davg=down.d-avg,good=davg>brightthresh;
	switch(state){
		case 0:
			//Found a gesture, waiting for next move
			if(good){
				state=1;
				calibrate();
			}
			break;
		case 2:
			//Wait for gesture to end
			if(!good){//Gesture ended
				state=0;
			}
			break;
		case 1:
			//Got next move, do something based on direction
			var dx=down.x-wasdown.x;
			var dy=down.y-wasdown.y;
			var dirx=Math.abs(dy)<Math.abs(dx);
			if(dy>movethresh&&!dirx){
				console.log('down');
				window.scrollBy(0,window.innerHeight);
			}
			else if(dy<-movethresh&&!dirx){
				console.log('up');
				window.scrollBy(0,-window.innerHeight);
			} else if(dx<-movethresh){
				console.log('right');
				window.scrollBy(window.innerWidth,0);
			}
			else if(dx>movethresh){
				console.log('left');
				window.scrollBy(-window.innerWidth,0);
			}
			state=2;
			break;
	}
}
