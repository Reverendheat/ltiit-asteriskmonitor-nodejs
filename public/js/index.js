function getCurrentMembers() {
    $.ajax({url: "/memberstatus", dataType : "json",contentType :"application/json",method:"GET", success: function(data){
        data.forEach(element => {
            membername = element.username.replace('/','');
            membername = membername.replace('-',"");
            membername = membername.replace(/\s+/g, '');
            if (element.active == 1) {
                if ($(`#${membername}row`).length) {
                    $(`#${membername}queue`).append(`<p id=p${element.queue}>${element.queue}</p>`);
                } else {
                $("#techtable tbody").append(`
                <tr id="${membername}row">
                <td id="${membername}">${element.username}</td>
                <td id="${membername}status" class="text-success">Online</td>
                <td id="${membername}queue"><p id=p${element.queue}>${element.queue}</p></td>
                <td id="${membername}callstatus">Ready</td>
                <td id="${membername}callduration"></td>
                </tr>`)
                }
            } 
        });
      }, complete: function(){
        $("#techtable").tablesorter({ sortList: [[3,1]]});
      }});
}

function setCopyRightDate(){
    var d = new Date()
    var n = d.getFullYear()
    $(`#datediv`).html(`© ${n} Copyright:
    <p> @Parakoopa</p>`);
}

let timer = [];
function callTimer(start,membername) {
        timer.push(setInterval(function () {
        let now = moment()
        let diff = now.diff(start, "seconds", true)
        let duration = new Date(diff * 1000).toISOString().substr(11, 8)
        $(`#${membername}callduration`).text(duration)
        console.log(duration);
    },1000));
}

$('document').ready(function(){
    //Socket IO Client connection/Management
    var socket = io.connect('http://' + document.location.host);
    socket.on('added', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        //If the user is already in the list
        if ($(`#${membername}row`).length) {
            $(`#${membername}queue`).append(`<p id=p${membername+data.queue}>${data.queue}</p>`);
        }
        else {
            //Add them to the table if not
            $("#techtable tbody").append(`
            <tr id="${membername}row">
            <td id="${membername}">${data.membername}</td>
            <td id="${membername}status" class="text-success">Online</td>
            <td id="${membername}queue"><p id=p${membername+data.queue}>${data.queue}</p></td>
            <td id="${membername}callstatus">Ready</td>
            <td id="${membername}callduration"></td>
            </tr>`)
        }
    });

    socket.on('removed', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        $(`#p${membername+data.queue}`).remove();
        if (!$(`#${membername}queue`).text().length) {
            $(`#${membername}row`).remove();
        }
    });

    socket.on('ringing', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        if ($(`#${membername}row`).length) {
            $(`#${membername}callstatus`).text(`Ringing`).addClass('text-success');
        } else {
            return;
        }
    })

    socket.on('ready', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        if ($(`#${membername}row`).length) {
            $(`#${membername}callstatus`).text(`Ready`).removeClass('text-success text-danger');
            timer.forEach((timer) => {
                clearInterval(timer);  
            });
            $(`#${membername}callduration`).empty();
        } else {
            return;
        }
    })

    socket.on('oncall', (data) => {
        console.log('On call fired');
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        if ($(`#${membername}row`).length) {
            $(`#${membername}callstatus`).text(`On Call`).removeClass('text-success text-danger');
            if ($(`#${membername}callduration`).text() == "") {
                console.log(`Timer starting for ${membername}`);
                callTimer(moment(),membername);
            }
        } else {
            return;
        }
    })
    
    socket.on('onhold', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        if ($(`#${membername}row`).length) {
            $(`#${membername}callstatus`).text(`On Hold`);
        } else {
            return;
        }
    })

    socket.on('unavailable', (data) => {
        membername = data.membername.replace('/','');
        membername = membername.replace('-',"");
        membername = membername.replace(/\s+/g, '');
        if ($(`#${membername}row`).length) {
            $(`#${membername}callstatus`).text(`Unavailable`).removeClass('text-success').addClass('text-danger');
        } else {
            return;
        }
    })

    getCurrentMembers();
    setCopyRightDate();

});