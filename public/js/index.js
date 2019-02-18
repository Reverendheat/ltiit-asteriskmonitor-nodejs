$('document').ready(function(){

    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('added', (data) => {
        console.log(data);
        if ($("#"+data.membername+"row").length) {
            console.log("tryin to change it")
            $("#"+data.membername+"row").html("<td id=" + data.membername + ">" + data.membername + "</td>" + "<td id=" + data.membername + "status" + ' class="text-success"' + ">" + "Online</td>" + "<td id=" + data.membername + "queue" + ">" + data.queue  + "</td>")
        } else {
            $('#techtable tbody').append("<tr id= " + data.membername + "row" + ">" + "<td id=" + data.membername + ">" + data.membername + "</td>" + "<td id=" + data.membername + "status" + ' class="text-success"' + ">" + "Online</td>" + "<td id=" + data.membername + "queue" + ">" + data.queue  + "</td>" + "</tr>")
        }
    })
    socket.on('removed', (data) => {
        console.log(data);
        $("#"+data.membername+"row").html("<td id=" + data.membername + ">" + data.membername + "</td>" + "<td id=" + data.membername + "status" + ' class="text-danger"' + ">" + "Offline</td>" + "<td id=" + data.membername + "queue" + ">" + data.queue  + "</td>")
        $('#'+data.membername+'queue').text('Offline')
    })
});