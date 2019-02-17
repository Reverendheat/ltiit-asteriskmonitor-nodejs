//.env file in parent directory that holds variable values - TO BE EXCLUDED FROM GIT!
require('dotenv').config();


//Express Web Server Requirements
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
//SocketIO Requirements

//Start the server
const server = app.listen(process.env.Express_Port, () => console.log('Listening on port '+ process.env.Express_Port))

//Express Web uses
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/public')));

//Socket IO requirements
const socket = require('socket.io');
const io = socket(server);

//Socket IO Events
io.on('connection', (socket) => {
    console.log('A new friend has arrived from ' + socket.handshake.address);
    socket.on('disconnect', () => {
        console.log('Goodbye ' + socket.handshake.address + ' ):');
    });
});

//Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Asterisk Manager Requirements
/**
 * port:  port server
 * host: host server
 * username: username for authentication
 * password: username's password for authentication
 * events: this parameter determines whether events are emited.
 **/
var ami = new require('asterisk-manager')(process.env.Asterisk_Port,process.env.Asterisk_Host,process.env.Asterisk_User,process.env.Asterisk_Secret, true);
 
// In case of any connectiviy problems we got you coverd.
ami.keepConnected();
 
// Listen for any/all AMI events.
ami.on('managerevent', function(evt) {
    console.log(evt);
    io.emit('event',evt);
});