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

function drawCenter(ctx, pt) {
	if (ctx == null) return;
	ctx.fillStyle="red";
	ctx.beginPath();
	ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
}

function clearRectRobot(ctx, pt, theta) {
	if (ctx == null) return;
	var w = 30; // bot width
	var h = 6; // bot hight

	ctx.save();
	ctx.fillStyle="white";
    ctx.beginPath();
    ctx.translate(pt.x,pt.y);
    ctx.rotate(theta * Math.PI);
    ctx.clearRect(-w/2-1, -h/2-1, w+2, h+2);
    ctx.clearRect(-w/2+w-7, -h/2+h-10, 14, 14);
	ctx.closePath();
	ctx.restore();
}

function rotateRectRobot(ctx, pt, theta) {
	if (ctx == null) return;
	var w = 30; // bot width
	var h = 6; // bot hight

	ctx.save();
    ctx.beginPath();
    ctx.translate(pt.x,pt.y);
    ctx.rotate(theta * Math.PI);
	ctx.fillStyle="blue";
	ctx.fillRect(-w/2, -h/2, w, h);
    ctx.fillRect(-w/2+w-6, -h/2+h-9, 12, 12); //add head
	//ctx.fillStyle="red";
	// //XX ctx.fillRect(-w/2-6, -h/2, 6, 6); //add tail rect
    //ctx.arc(-w/2-3, -h/2+3, 3, 0, 3.14159265359 *2, true); //add tail circle.
    //ctx.fill();
	ctx.closePath();
	ctx.restore();
}

function markPoint(ctx, pt, opt) {
	if (ctx == null) return;
	var radius = 5;
	ctx.beginPath();
	ctx.clearRect(opt.x - radius, opt.y - radius, radius * 2, radius * 2);
	ctx.fillStyle="blue";
	ctx.arc(pt.x-radius*2,pt.y-radius*2,radius,0,Math.PI*2,true);
	ctx.fill();
	ctx.closePath();
	opt.x=pt.x-radius*2; opt.y=pt.y-radius*2;
}

function drawPath(ctx, pts) {
	if (ctx == null) return;
	var pt, ppt;
	if(pts.length>1) ppt = pts[0];
	for(var i=0; i< pts.length; i++) {
		pt = pts[i];
		console.log("Pt Arr length: ", pts.length, pt.x, pt.y, ppt.x, ppt.y);
		/*ctx.beginPath();
		ctx.fillStyle="red";
		ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();*/

		ctx.beginPath(); //begin
		ctx.lineWidth=2;
		ctx.strokeStyle = 'red';
			ctx.moveTo(pt.x, pt.y); //put vaertical-y lines
			ctx.lineTo(ppt.x, ppt.y);
		ctx.stroke(); //draw it.
		ctx.closePath(); //done
		ppt=pt;
	}
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//part null return cmd; 
//part have < return <+
//part have > return cmd + >
//return cmd+part.
//collect command when start with Done
function collectCmd(cmd, part) {
	if(part == null) return cmd;
	var n = part.search("<");
	if(n != -1) return part.substring(n+1,part.length);
	n = part.search(">");
	if(n != -1) return "Done,"+cmd + part.substring(0, n);
	return cmd+part;
}

