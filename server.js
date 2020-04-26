// HTTP Connection
var http = require('http'), fs = require('fs');
let index = fs.readFileSync(__dirname + '/index.html');
let extjs1 = fs.readFileSync(__dirname + '/utility.js');

var app = http.createServer((req, res) => {
	if(req.url == '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(index);
	}
	else if(req.url == '/utility.js') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(extjs1);		
	}
});

var io = require('socket.io').listen(app);

// Bluetooth Connection
var btserial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
const DEVICE_NAME = "SHAHBLE1";

// 0-disconnected, 1-conncted, 2-serial port err, 3-connct err
const BTSERIAL_DISCONNECTED = 0;
const BTSERIAL_CONNECTED    = 1;
const BTSERIAL_SERPORTERR   = 2;
const BTSERIAL_CONNECTERR   = 3;
let btserial_status = BTSERIAL_DISCONNECTED;

// Robot State
let wcmd_left = 0.0;
let wcmd_right = 0.0;
const wdelta = 0.5;
const wupper_limit = 10.0;
const wlower_limit = -10.0;
let x=0;y=0;theta=0;

function sendStatusToClients() {
	if (io == null) return;
	io.emit('status', { blestatus: btserial_status });
}

function sendFeedBackToClient(data) {
	if (io == null) return;
	io.emit('feedback', { feedback: data.key});
}

function processKeyData(key) {
	let mykey = Math.abs(key);
	if(mykey >=0 && mykey <= 9) {
		wcmd_right = key; 
		wcmd_left = key;
    }
	else if (key != '37' && key != '38' && key != '39' && 
			key != '40' && key != '83' && key != '76' && key != '82') {
			return;
	}
	// 37: LEFT arrow, 38: Up arrow, 39: RIGHT arrow, 40: DOWN arror, 83: S key
	// 76: L, 82: R
	if (key == 38) { // UP
		wcmd_left += wdelta;
		wcmd_right += wdelta;
	}
	else if (key == 40) { // DOWN
		wcmd_left -= wdelta;
		wcmd_right -= wdelta;
	}
	else if (key == 37) { // LEFT
		wcmd_left -= wdelta;
		wcmd_right += wdelta;
	}
	else if (key == 39) { // RIGHT
		wcmd_left += wdelta;
		wcmd_right -= wdelta;
	}
	else if (key == 83) { // STOP
		wcmd_left = 0.0;
		wcmd_right = 0.0;
	}
	else if (key == 76) { // L trun
		wcmd_left = -3;
		wcmd_right = 3;
	}
	else if (key == 82) { // R trun
		wcmd_left = 3;
		wcmd_right = -3;
	}

	if (wcmd_left >= wupper_limit) {
		wcmd_left = wupper_limit;
	} else if (wcmd_left <= wlower_limit) {
		wcmd_left = wlower_limit;
	}
	if (wcmd_right >= wupper_limit) {
		wcmd_right = wupper_limit;
	} else if (wcmd_right <= wlower_limit) {
		wcmd_right = wlower_limit;
	}

	//console.log("transmitCommand: ", wcmd_left, wcmd_right, key, mykey);
	transmitCommand(wcmd_left, wcmd_right, true);
}

function transmitCommand(wtarget_left, wtarget_right, is_conservative) {
	if (btserial_status != BTSERIAL_CONNECTED) return;
	if (!Number.isFinite(wtarget_left) || !Number.isFinite(wtarget_right) || typeof is_conservative != "boolean") {
		console.error("transmitCommand error: invalid arguements wtarget_left (float): " +
			wtarget_left + ", wtarget_right (float): " + wtarget_right + ", is_conservative (bool): " + is_conservative);
		return;
	}
	let conservative = is_conservative ? 1 : 0;
	let command = "<" + wtarget_left.toFixed(6) + "," + wtarget_right.toFixed(6) + "," + conservative + ">";
	console.log(command);
	btserial.write(Buffer.from(command, 'utf-8'), (err, bytesWritten) => {
		if (err) console.log(err);
	});
}

// Connect to bluetooth.
btserial.on('found', (address, name) => {
	if (name == DEVICE_NAME) {
		btserial.findSerialPortChannel(address, channel => {
			btserial.connect(address, channel, () => {
				btserial_status = BTSERIAL_CONNECTED;
				sendStatusToClients();
				console.log("btserial: connected");
			}, () => {
				btserial_status = BTSERIAL_CONNECTERR;
				sendStatusToClients();
				console.error("btserial error: " + DEVICE_NAME + " connect failed");
			}); 

		}, () => {
			btserial_status = BTSERIAL_SERPORTERR;
			sendStatusToClients();
			console.error("btserial error: " + DEVICE_NAME + " paired, but not connected");
		});
	}
});

btserial.inquire();

// feedback received from bluetooth, x,t,theta.
btserial.on('data', buffer => {
	console.log(buffer.toString('utf-8'));
	//socket.emit('feedback', { feedback: keydata.key });
});

// Emit welcome message on connection
io.on('connection', socket => {
	// Use socket to communicate with this particular client only, sending it it's own id
	socket.emit('welcome', { id: socket.id });
	sendStatusToClients();

	socket.on('keypress', (keydata) => {
		processKeyData(keydata.key);
	});
});

app.listen(3000);
