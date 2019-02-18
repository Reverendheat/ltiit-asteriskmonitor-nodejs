//.env file in parent directory that holds variable values - TO BE EXCLUDED FROM GIT!
require('dotenv').config();

//SQLite3 Requirements
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('UserStatus.db');

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT,loggedin INTEGER, queue TEXT)");
});

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

//Get requests
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Asterisk Manager Requirements
var ami = new require('asterisk-manager')(process.env.Asterisk_Port,process.env.Asterisk_Host,process.env.Asterisk_User,process.env.Asterisk_Secret, true);

ami.keepConnected();

ami.on('queuememberadded', function(evt) {
    db.all(`SELECT * FROM users WHERE username="${evt.membername}"`, (err,rows)=>{
        if (err) throw err;
        if (rows.length == 0) {
            console.log("No results found.., adding to database");
            db.run(`INSERT into users(username,loggedin,queue) VALUES ("${evt.membername}","${1}","${evt.queue}")`);
        } else {
            console.log(`${evt.membername} updated to ONLINE for ${evt.queue}`);
            db.run(`UPDATE users SET loggedin ="${1}", queue="${evt.queue}" WHERE username="${evt.membername}"`);
        }
    })
    io.emit('added', evt);
});
ami.on('queuememberremoved', function(evt) {
    db.all(`SELECT * FROM users WHERE username="${evt.membername}"`, (err,rows)=>{
        if (err) throw err;
        if (rows.length == 0) {
            console.log("No results found.., user will be added the next time they login.");
        } else {
            console.log(`${evt.membername} is going OFFLINE`);
            db.run(`UPDATE users SET loggedin ="${0}", queue="OFFLINE" WHERE username="${evt.membername}"`);
        }
    })
    io.emit('removed', evt);
});