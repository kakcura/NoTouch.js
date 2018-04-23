/*!
* Hand gesture detection logic
* Created by Korhan Akcura
*/

// Browser polyfills
//===================
if (!window.URL) {
	window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
}

if (!navigator.getUserMedia) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia || navigator.msGetUserMedia;
}

// Below contains modified code from;
// https://github.com/willy-vvu/reveal.js - MIT License
// https://github.com/hdmchl/gest.js - MIT License
video=document.getElementById('video')
canvas=document.getElementById('canvas')
_=canvas.getContext('2d')
ccanvas=document.getElementById('comp')
c_=ccanvas.getContext('2d')

navigator.getUserMedia({ "video": { "mandatory": { "minWidth": 1857, "minHeight": 180}}},function(stream){
	s=stream
	video.src=window.URL.createObjectURL(stream)
	video.addEventListener('play',
		function(){setInterval(grabVideoFrame,1000/25)}
	)
},function(error){
	throw new Error(error);
})
compression=5
width=height=0
function grabVideoFrame(){
	if(canvas.width!=video.videoWidth){
		//width=Math.floor(video.videoWidth/compression)
		//height=Math.floor(video.videoHeight/compression)
		width=video.videoWidth;
		height=video.videoHeight;
		canvas.width=width
		canvas.height=height
	}
	_.drawImage(video,width,0,-width,height)
	draw=_.getImageData(0,0,width,height)
	differenceMap()
}

last=false
maxAssessableColorChange=150
down=false
wasdown=false
var cursor_point = [];
var detect_count = 0;
function differenceMap(){
	var delt = _.createImageData(width, height);
	if(last!==false){
		var x = 0;
		var y = 0;
		var totalx = 0;
		var totaly = 0;
		//total number of changed pixels
		var totald = 0;
		var totaln = delt.width * delt.height;
		var dscl = 0;
		var pix = totaln * 4;
		var cursor_pixel = null;

		while(pix -= 4){
			//don't do [pix+3] because alpha doesn't change
			var d= Math.abs(draw.data[pix] - last.data[pix]) + Math.abs(draw.data[pix+1] - last.data[pix+1]) + Math.abs(draw.data[pix+2] - last.data[pix+2]);
			if(d > maxAssessableColorChange){
				delt.data[pix] = 160; //R
				delt.data[pix+1] = 255; //G
				delt.data[pix+2] = 255; //B
				delt.data[pix+3] = 255; //alpha
				x = ((pix/4) % width);
				y = (Math.floor((pix/4)/delt.height));
				totalx += x;
				totaly += y;
				totald += 1;
				// Mark the latest pixel with significant change in color
				cursor_pixel = pix;
			}
		}
		if (!(cursor_pixel < 4)){

			/*if(cursor_point && (((cursor_point.x-x)<5) && ((cursor_point.y-y)<5))) {
				console.log("Detected: " + detect_count);
				detect_count++;
			}*/

			//if((detect_count<10) || (cursor_point && (((cursor_point.x-x)<20) && ((cursor_point.y-y)<20)))) {

				cursor_point = {
					x: x,
					y: y
				};

				var x_pos = (width - x);
				var y_pos = y;
			
				document.getElementById("pointer").style.top = y_pos + "px";
				document.getElementById("pointer").style.left = (width - x_pos)+"px";
				document.elementFromPoint(x_pos, y_pos).click();
			//}
		}
	}

	//slide.setAttribute('style','display:initial')
	//slide.value=(totalx/totald)/width
	if(totald){
		down={
			x:totalx/totald,
			y:totaly/totald,
			d:totald
		}
		handledown()
	}
	//console.log(totald)
	last=draw
	c_.putImageData(delt,0,0)
}

movemaxAssessableColorChange=2
brightmaxAssessableColorChange=300
overmaxAssessableColorChange=1000

function calibrate(){
	wasdown={
		x:down.x,
		y:down.y,
		d:down.d
	}
}

var avg = 0;
var state = 0; //States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end

function handledown(){
	avg = 0.9 * avg + 0.1 * down.d;
	var davg = down.d - avg;
	var good = davg > brightmaxAssessableColorChange;
	//console.log(davg)
	switch(state){
		case 0:
			if(good){//Found a gesture, waiting for next move
				state=1
				calibrate()
			}
			break
		case 2://Wait for gesture to end
			if(!good){//Gesture ended
				state=0
			}
			break;
		case 1://Got next move, do something based on direction
			var dx=down.x-wasdown.x,dy=down.y-wasdown.y
			var dirx=Math.abs(dy)<Math.abs(dx)//(dx,dy) is on a bowtie
			//console.log(good,davg)
			if(dx<-movemaxAssessableColorChange&&dirx){
				console.log('right');
			}
			else if(dx>movemaxAssessableColorChange&&dirx){
				console.log('left');
			}
			if(dy>movemaxAssessableColorChange&&!dirx){
				if(davg>overmaxAssessableColorChange){
					console.log('over up')
				}
				else{
					console.log('up')
				}
			}
			else if(dy<-movemaxAssessableColorChange&&!dirx){
				if(davg>overmaxAssessableColorChange){
					console.log('over down')
				}
				else{
					console.log('down')
				}
}
			state=2
			break
	}
}
