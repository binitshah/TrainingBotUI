var http = require('http'), fs = require('fs');
let index = fs.readFileSync(__dirname + '/index.html');
var io = null;

var btserial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
const DEVICE_NAME = "SHAHBLE1"

// 0-disconnected, 1-conncted, 2-serial port err, 3-connct err
const BTSERIAL_DISCONNECTED = 0;
const BTSERIAL_CONNECTED    = 1;
const BTSERIAL_SERPORTERR   = 2;
const BTSERIAL_CONNECTERR   = 3;
const BTSERIAL_STATUS = [ "BTSERIAL_DISCONNECTED", "BTSERIAL_CONNECTED", "BTSERIAL_SERPORTERR", "BTSERIAL_CONNECTERR" ];

let btserial_status = BTSERIAL_DISCONNECTED;

// Send current time to all connected clients
function sendUpdateToClient() {
    if (io == null) return;
    io.emit('status', { time: new Date().toJSON(), blestatus: BTSERIAL_STATUS[btserial_status]});
}

// Send key feedback
function sendFeedBackToClient(data) {
    if (io == null) return;
    io.emit('feedback', { feedback: data.key});
}

function transmitCommand(wtarget_left, wtarget_right, is_conservative) {
    if (btserial_status != BTSERIAL_CONNECTED) return;
    if (!Number.isFinite(wtarget_left) || !Number.isFinite(wtarget_right) || typeof is_conservative != "boolean") {
        console.error("transmitCommand error: invalid arguements wtarget_left (float): " +
            wtarget_left + ", wtarget_right (float): " + wtarget_right + ", is_conservative (bool): " + is_conservative);
        return;
    }
    let conservative = is_conservative ? 1 : 0;
    let command = "<" + wtarget_left.toFixed(6) + "," + wtarget_right.toFixed(6) + "," + conservative + ">\n";
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
                console.log("btserial: connected");
            }, () => {
                // TODO: call html io to publish error msg.
                btserial_status = BTSERIAL_CONNECTERR;
                console.error("btserial error: " + DEVICE_NAME + " connect failed");
            }); 

        }, () => {
            // TODO: call html io to publish error msg.
            btserial_status = BTSERIAL_SERPORTERR;
            console.error("btserial error: " + DEVICE_NAME + " serial port not found");
        });
    }
});

btserial.inquire();

btserial.on('data', buffer => {
    console.log(buffer.toString('utf-8'));
});

function SendKeyData() {
    if(btserial_status != BTSERIAL_CONNECTED) return;
    transmitCommand(0.1,0.1,true);
}

// Send current time every 10 secs.
// setInterval(SendKeyData, 1000);'

// Send index.html to all browser requests.
var app = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
io = require('socket.io').listen(app);

// Send current time every 10 secs
setInterval(sendUpdateToClient, 1000);

// Emit welcome message on connection
io.on('connection', socket => {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });
    console.log('Welcome Client: ' + socket.id + " !");
    sendUpdateToClient();

    socket.on('Client Connect', console.log);

    socket.on('Key Press', (keydata) => {
        socket.emit('feedback', { feedback: keydata.key});
    });
});

app.listen(3000);
