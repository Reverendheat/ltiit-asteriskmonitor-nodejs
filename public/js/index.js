function getCurrentMembers() {
    $.get('memberstatus', (data) => {
        data.forEach(element => {
            membername = element.username.replace('/','');
            membername = membername.replace('-',"");
            membername = membername.replace(' ','');
            if (element.loggedin == 1) {
                $("#techtable tbody").append(`
                <tr id="${membername}row">
                <td id="${membername}">${element.username}</td>
                <td id="${membername}status" class="text-success">Online</td>
                <td id="${membername}queue">${element.queue}</td>
                <td id="${membername}callstatus">Ready</td>
                </tr>`)
            } else {
                $("#techtable tbody").append(`
                <tr id="${membername}row">
                <td id="${membername}">${element.username}</td>
                <td id="${membername}status" class="text-danger">Offline</td>
                <td id="${membername}queue">Offline</td>
                <td id="${membername}callstatus">Offline</td>
                </tr>`)
            }
        });
    });
}

$('document').ready(function(){

    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('added', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        if ($(`#${membername}row`).length) {
            console.log("tryin to change it")
            $(`#${membername}row`).html(`
            <td id="${membername}">${data.membername}</td>
            <td id="${membername}status" class="text-success">Online</td>
            <td id="${membername}queue">${data.queue}</td>
            <td id="${membername}callstatus">Ready</td>`)
            console.log(`${data.membername} has has logged back into queue ${data.queue}`);
        } else {
            console.log("Adding to Table..");
            $("#techtable tbody").append(`
            <tr id="${membername}row">
            <td id="${membername}">${data.membername}</td>
            <td id="${membername}status" class="text-success">Online</td>
            <td id="${membername}queue">${data.queue}</td>
            <td id="${membername}callstatus">Ready</td>
            </tr>`)
            console.log(`${data.membername} has logged into queue ${data.queue}`);
        }
    })
    socket.on('removed', (data) => {
        console.log(data);
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        $(`#${membername}row`).html(`
        <td id="${membername}">${data.membername}</td>
        <td id="${membername}status" class="text-danger">Offline</td>
        <td id="${membername}queue">${data.queue}</td>
        <td id="${membername}callstatus">Offline</td>`)
        $(`#${membername}queue`).text('Offline')
        console.log(`${data.membername} is logging out of queue ${data.queue}`);
    })
    socket.on('ringing', (data) => {
        console.log(data);
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        if ($(`#${membername}row`).length) {
            console.log("tryin to change it to Ringing")
            $(`#${membername}callstatus`).text(`Ringing`).addClass('text-success');
            console.log(`${data.membername} phone is ringing!`);
        } else {
            return;
        }        
    })
    socket.on('ready', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        if ($(`#${membername}row`).length) {
            console.log("tryin to change it to Ready")
            $(`#${membername}callstatus`).text(`Ready`).removeClass('text-success text-danger');
            console.log(`${data.membername} phone is ringing!`);
        } else {
            return;
        }
    })
    socket.on('oncall', (data) => {
        console.log(data);
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        if ($(`#${membername}row`).length) {
            console.log("tryin to change it to On Call")
            $(`#${membername}callstatus`).text(`On Call`).removeClass('text-success text-danger');
            console.log(`${data.membername} is on a call!`);
        } else {
            return;
        }
    })
    socket.on('onhold', (data) => {
        console.log(data);
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        if ($(`#${membername}row`).length) {
            console.log("tryin to change it to On Hold")
            $(`#${membername}callstatus`).text(`On Hold`);
            console.log(`${data.membername} is on hold`);
        } else {
            return;
        }
    })
    socket.on('unavailable', (data) => {
        console.log(data);
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(' ','');
        if ($(`#${membername}row`).length) {
            console.log("tryin to change it to unavailable")
            $(`#${membername}callstatus`).text(`Unavailable`).removeClass('text-success').addClass('text-danger');
            console.log(`${data.membername} is unavailable`);
        } else {
            return;
        }
    })
    getCurrentMembers();
});