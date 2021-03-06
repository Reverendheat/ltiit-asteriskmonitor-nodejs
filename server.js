//.env file in parent directory that holds variable values - TO BE EXCLUDED FROM GIT!
require('dotenv').config();

//SQLite3 Requirements
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('UserStatus.db');

db.serialize(function() {db.run("CREATE TABLE IF NOT EXISTS users (username TEXT, queue TEXT, active INTEGER)");});

//Express Web Server Requirements
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');


//Start the server
const server = app.listen(process.env.Express_Port, () => console.log('Listening on port '+ process.env.Express_Port))

//Express Web uses
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/public')));

//Socket IO requirements
const socket = require('socket.io');
const io = socket(server);

//Socket IO Events (Web browser connections)
io.on('connection', (socket) => {
    console.log('A new friend has arrived from ' + socket.handshake.address);
    socket.on('disconnect', () => {
        console.log('Goodbye ' + socket.handshake.address + ' ):');
    });
});

//Express Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/memberstatus', (req,res) => {
    //send back db information
    db.all(`SELECT * FROM users`, (err,rows)=>{
        if (err) throw err;
        res.send(rows);
    });
});

//Asterisk Manager Requirements
var ami = new require('asterisk-manager')(process.env.Asterisk_Port,process.env.Asterisk_Host,process.env.Asterisk_User,process.env.Asterisk_Secret, true);

ami.keepConnected();

//When a user enters a queue, use this because more descriptive
ami.on('queuememberadded', function(evt) {
    db.all(`SELECT * FROM users WHERE username="${evt.membername}" AND queue="${evt.queue}"`, (err,rows)=>{
        if(err) throw err;
        if (rows.length == 0) {
            console.log('ADD - Trying to ADD a new entry');
            db.run(`INSERT into users(username,queue,active) VALUES ("${evt.membername}","${evt.queue}",${1})`);
        } else {
            console.log('ADD - Trying to UPDATE an entry');
            db.run(`UPDATE users SET active=${1} WHERE username="${evt.membername}" AND queue="${evt.queue}"`);
        }
    });
    io.emit('added', evt);
});

//When a user leaves a queue, use this because more descriptive
ami.on('queuememberremoved', function(evt) {
    db.all(`SELECT * FROM users WHERE username="${evt.membername}" AND queue="${evt.queue}"`, (err,rows)=>{
        if(err) throw err;
        if (rows.length == 0) {
            console.log('Someone was removed, but they do not exist in the database');
        } else {
            console.log('REMOVE - Trying to UPDATE an entry')
            db.run(`UPDATE users SET active=${0} WHERE username="${evt.membername}" AND queue="${evt.queue}"`);
        }
    });
    io.emit('removed', evt);
});

//Fires when queue status changes
ami.on('queuememberstatus', function(evt) {
    db.all(`SELECT * FROM users WHERE username="${evt.membername}"`, (err,rows)=>{
        if (err) throw err;
        if (rows.length == 0) {
            console.log("Queue Member Status - No results found.., user will be added the next time they login.");
        } else {
            if (rows[0].active == 1) {
                if (evt.status == '1') {
                    console.log(`${evt.membername} is ready`);
                    io.emit('ready', evt)
                } else if (evt.status == '2'){
                    console.log(`${evt.membername} is on a call`);
                    io.emit('oncall', evt)
                } else if (evt.status == '3'){
                    console.log(`${evt.membername} is busy (thats weird right?)`);
                    io.emit('busy', evt)
                } else if (evt.status == '4'){
                    console.log(`${evt.membername} is invalid (thats weird right?)`);
                    io.emit('invalid', evt)
                } else if (evt.status == '5'){
                    console.log(`${evt.membername} is unavailable (thats weird right?)`);
                    io.emit('unavailable', evt)
                } else if (evt.status == '6'){
                    console.log(`${evt.membername} is ringing`);
                    io.emit('ringing', evt)
                } else if (evt.status == '7'){
                    console.log(`${evt.membername} is ringing, but is already on a call`);
                    io.emit('ringinuse', evt)
                } else if (evt.status == '8'){
                    console.log(`${evt.membername} is on hold`);
                    io.emit('onhold', evt)
                }
            } else {
                console.log(`${evt.membername} is offline`);
            }
        }
    })
})