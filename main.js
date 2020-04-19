var http = require('http'), fs = require('fs');
let index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
    io.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 2000);

// Emit welcome message on connection
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });

    socket.on('i am client', console.log);
});

app.listen(3000);

// var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
// let DEVICE_NAME = "SHAHBLE"

// btSerial.on('found', function(address, name) {
//     if (name == DEVICE_NAME) {
//         btSerial.findSerialPortChannel(address, function(channel) {
//             btSerial.connect(address, channel, function() {
//                 console.log('connected');

//                 btSerial.write(Buffer.from('my data', 'utf-8'), function(err, bytesWritten) {
//                     if (err) console.log(err);
//                 });

//                 btSerial.on('data', function(buffer) {
//                     console.log(buffer.toString('utf-8'));
//                 });

//             }, function () {
//                 console.log("Cannot connect to " + DEVICE_NAME);
//             });

//             // close the connection when you're ready
//             btSerial.close();
//         }, function() {
//             console.log(DEVICE_NAME + " not found");
//         });
//     }
// });

// btSerial.inquire();