function updateBlueToothStatus() {
	if (context == null) return;
	var redius = 10; 
	var x = canvassizex - redius;
	var y = redius * 4;

	/*
		// 0-disconnected, 1-conncted, 2-serial port err, 3-connct err
		const BTSERIAL_DISCONNECTED = 0; //RED : #bf0000, bluetooth disconnected 
		const BTSERIAL_CONNECTED    = 1; //GREEN : 0b6623, bluetooth connected
		const BTSERIAL_SERPORTERR   = 2; //ORANGE : #ffa500, bluetooth paired, but not connected
		const BTSERIAL_CONNECTERR   = 3; //RED : #bf0000, bluetooth connect error
	*/

	context.fillStyle = "#bf0000";
	if (blestatus == 1) {
		context.fillStyle="#0b6623";
	}
	else if(blestatus == 2) {
		context.fillStyle="#ffa500";
	}

	context.beginPath();
	context.clearRect(x - redius, y - redius, redius * 2, redius * 2);
	context.closePath();

	context.beginPath();
	context.arc(x-redius*2,y-redius*2,redius,0,Math.PI*2,true);
	context.closePath();
	context.fill();
}

function drawGrid(ctx, w, h, inc)
{
	if (ctx == null) return;

	ctx.beginPath(); //begin
	ctx.lineWidth=1;
	ctx.strokeStyle = '#d1edd8';

	for(var i = 0; i <= w; i += inc) {
		ctx.moveTo(i, 0); //put vaertical-y lines
		ctx.lineTo(i, h);
		if(i <= h) {
			ctx.moveTo(0, i); //put horizontal-x lines
			ctx.lineTo(w, i);
		}
	}
	ctx.stroke(); //draw it.
	ctx.closePath(); //done
}

function drawCenter(x, y) {
	if (context == null) return;
	context.fillStyle="red";
	context.beginPath();
	context.arc(x, y, 4, 0, 2 * Math.PI);
	context.stroke();
	context.fill();
	context.closePath();
}

function clearRectRobot(x, y, theta) {
	if (context == null) return;
	var w = 60; // bot width
	var h = 6; // bot hight

	context.save();
	context.fillStyle="white";
    context.beginPath();
    context.translate(x,y);
    context.rotate(theta * Math.PI / 180);
    context.clearRect(-w/2-1, -h/2-1, w+2, h+2);
    context.clearRect(-w/2+w-7, -h/2+h-10, 14, 14);
	context.closePath();
	context.restore();
}

function rotateRectRobot(x, y, theta) {
	if (context == null) return;
	var w = 60; // bot width
	var h = 6; // bot hight

	context.save();
    context.beginPath();
    context.translate(x,y);
    context.rotate(theta * Math.PI / 180);
	context.fillStyle="blue";
	context.fillRect(-w/2, -h/2, w, h);
    context.fillRect(-w/2+w-6, -h/2+h-9, 12, 12); //add head
	context.fillStyle="red";
	//context.fillRect(-w/2-6, -h/2, 6, 6); //add tail rect
    context.arc(-w/2-3, -h/2+3, 3, 0, 3.14159265359 *2, true); //add tail circle.
    context.fill();
	context.closePath();
	context.restore();
}

