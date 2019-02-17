$('document').ready(function(){

    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('event', (data) => {
        console.log(data);
    })
});