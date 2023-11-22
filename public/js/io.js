//update client library//
let socket = io.connect(window.location.host);
socket.on('firstConnect', function (packet) {
    gameLib.bases.clear()
    gameLib.tanks.clear()
    gameLib.APCs.clear()

    packet.bases.forEach(data => {
        let flakNo = data.pop(),
            base = new Base(...data);
        for (let i = 0; i < flakNo; i++) {
            base.addFlakonBase();
        }
        gameLib.bases.set(data[2], base);
    })
    packet.tanks.forEach(data => {
        let tank = new Tank(...data);
        gameLib.tanks.set(data[2], tank)
    })
    packet.APCs.forEach(data => {
        let A = new APC(...data);
        gameLib.APCs.set(data[2], A)
    })
})
socket.on('vehicle-rotate', data => {
    if (gameLib.tanks.has(data[0])) return gameLib.tanks.get(data[0]).deg = data[1];
    if (gameLib.APCs.has(data[0])) return gameLib.APCs.get(data[0]).deg = data[1];

});
socket.on(codes.actioncodes.movement.toString(), data => {
    if (gameLib.tanks.has(data[0])) {
        gameLib.tanks.get(data[0]).pos.x = data[1].x;
        gameLib.tanks.get(data[0]).pos.y = data[1].y;
    }
    if (gameLib.APCs.has(data[0])) {
        gameLib.APCs.get(data[0]).pos.x = data[1].x;
        gameLib.APCs.get(data[0]).pos.y = data[1].y;
    }
})
socket.on(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), data => {
    let tank = new Tank(...data);
    gameLib.tanks.set(data[2], tank);
});
socket.on(codes.objcodes.base.toString() + codes.actioncodes.creation.toString(), data => {
    let base = new Base(...data);
    gameLib.bases.set(data[2], base);
})

socket.on(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), data => {
    let A = new APC(...data);
    gameLib.APCs.set(data[2], A);
});
socket.on(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), data => {
    gameLib.bases.get(data[0]).addFlakonBase();
});
socket.on('flak-rotate', function (data) {
    while (data[2] < 360) {
        data[2] += 360;
    }
    while (data[2] > 360) {
        data[2] -= 360;
    }
    if (data[0] == 'flak') {
        gameLib.bases.get(data[3]).flaks[data[1]].deg = data[2];
    } else {
        gameLib.tanks.get(data[3]).turrent.deg = data[2];
    }
});
socket.on(codes.actioncodes.destruction.toString(), data => {
    if (data[0] == 'tank') {
        gameLib.tanks.delete(data[1])
    } else if (data[0] == 'APC') {
        gameLib.APCs.delete(data[1])
    } else {
        gameLib.bases.get(data[1]).flaks.pop();
    }
});
socket.on('fire', data => {
    if (data[0] == 'turrent') {
        if (gameLib.bases.has(data[2])) {
            gameLib.bullets.push(new Bullet(gameLib.tanks.get(data[3]), gameLib.bases.get(data[2]).flaks[gameLib.bases.get(data[2]).flaks.length - 1]))
        }
        else {
            gameLib.bullets.push(new Bullet(gameLib.tanks.get(data[3]), gameLib.tanks.has(data[2]) ? gameLib.tanks.get(data[2]) : gameLib.APCs.get(data[2])));
        }
    }
    if (data[0] == 'flak') gameLib.bullets.push(new Bullet(gameLib.bases.get(data[3]).flaks[data[1]], gameLib.tanks.has(data[2]) ? gameLib.tanks.get(data[2]) : gameLib.APCs.get(data[2])));
    audiohandler.play(audiohandler.audiobuffers[0])
});
socket.on('base-rename', data => {
    gameLib.bases.get(data[0]).whose = data[1]
});
socket.on('game-error', data => {
    alert('Game error', data)
})
socket.on('base-creation', data => {
    gameLib.bases.set(data[2], new Base(...data))
});
let room;
let box = document.querySelector('#chat-box');
let form = document.querySelector('#chat-message');
document.querySelector('#chat-send').onclick = e => {
    socket.emit('pl-message', form.value);
    if (room) socket.emit('room-join', room)
    form.value = '';
}
socket.on('sys-message', (...data) => {
    let t = document.createElement('li');
    t.innerHTML = data[1] + ' has ' + (data[0] ? 'connected' : 'disconnected');
    box.append(t)
})
socket.on('message', (...data) => {
    if (!data[0] || !data[1]) return;
    let t = document.createElement('li');
    t.innerHTML = data[0] + ':' + data[1];
    box.append(t);
    box.scroll({ top: box.scrollHeight, behavior: 'smooth' });
});
function updatePlayerAllianceInGame(clientname, alliance) {
    console.log(`${clientname}::${alliance}`);
    gameLib.bases.forEach(base => {
        if (base.whose.name === clientname) {
            base.whose.alliance = alliance
        }
    });
    gameLib.tanks.forEach(tank => {
        if (tank.whose.name === clientname) {
            tank.whose.alliance = alliance
        }
    });
    gameLib.APCs.forEach(apc => {
        if (apc.whose.name === clientname) {
            apc.whose.alliance = alliance;
        }
    })
    if (user.name === clientname) {
        user.alliance = alliance
    }
}
socket.on('update-alli', (...data) => {
    updatePlayerAllianceInGame(data[0], data[1])
})
socket.on('rooms', console.log);
socket.on('log', console.log)
//emit target base intended to produce the vehicle --done//
//placed in creatoncard class{res.js}//

//emit the vehicle id and intended pont to move to ---done///