$('document').ready(function(){

    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('added', (data) => {
        console.log(data);
        userInterface = data.interface.replace('/','');
        userInterface = userInterface.replace('-',"");
        if ($(`#${userInterface}row`).length) {
            console.log("tryin to change it")
            $("#"+userInterface+"row").html("<td id=" + userInterface + ">" + data.membername + "</td>" + "<td id=" + userInterface + "status" + ' class="text-success"' + ">" + "Online</td>" + "<td id=" + userInterface + "queue" + ">" + data.queue  + "</td>")
            console.log(`${data.membername} has has logged back into queue ${data.queue}`);
        } else {
            console.log("Adding to Table..");
            $("#techtable tbody").append(`
            <tr id="${userInterface}row">
            <td id="${userInterface}">${data.membername}</td>
            <td id="${userInterface}status" class="text-success">Online</td>
            <td id="${userInterface}queue">${data.queue}</td>
            </tr>`)
            console.log(`${data.membername} has logged into queue ${data.queue}`);
        }
    })
    socket.on('removed', (data) => {
        console.log(data);
        userInterface = data.interface.replace('/','');
        userInterface = userInterface.replace('-',"");
        $(`#${userInterface}row`).html(`
        <td id="${userInterface}">${data.membername}</td>
        <td id="${userInterface}status" class="text-danger">Offline</td>
        <td id="${userInterface}queue">${data.queue}</td>`)
        $(`#${userInterface}queue`).text('Offline')
        console.log(`${data.membername} is logging out of queue ${data.queue}`);
    })
});