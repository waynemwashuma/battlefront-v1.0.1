server.use((socket, next) => {
    if (typeof socket.handshake.headers.cookie !== "string") return next(new Error('unathorized'));
    if (!cookie.parse(socket.handshake.headers.cookie).sessId) return next(new Error('unathorized'));
    if (typeof socket.handshake.headers.cookie === "string") {
        let sid = cookie.parse(socket.handshake.headers.cookie), sd;
        if (typeof sid.sessId === "undefined") {
            console.log('no session made for user');
            return next(new Error('unathorized'))
        } else {
            conn.query('SELECT * FROM sessions WHERE sessId=?', [sid.sessId], (err, results) => {
                if (!err) {
                    if (!results.length) return next(new Error('unathorized'));
                    if (Date.now() < results[0].expires) console.log('session expired');
                    sd = JSON.parse(results[0].data);
                    clientHandler.resolveClient(sd.uid, sd.uname, socket.id);
                    next();
                }
                if (err) console.log(err.message);
            })
        }
    }
});
server.on('connection', socket => {
    clientHandler.resolveAndJoinRoom('global', socket);
    socket.on('pl-message', (data, room) => {
        room = room || 'global';
        let client = clientHandler.findClient(socket.id);
        clientHandler.resolveAndJoinRoom(room, socket);
        //add room selection later
        server.emit('message', client.name, data)
    })
    socket.on('room-leave', room => {
        let user = clientHandler.findClient(socket.id);
        clientHandler.removeFromRoom(user, room)
    })
    socket.on('rooms', e => {
        console.log(clientHandler.chatRooms);
    })
    socket.broadcast.emit('sys-message', true, socket.id)
    gameLib.bases.forEach(b => {
        server.sockets.to(socket.id).emit('firstConnect-bases', [b.pos.x, b.pos.y, b.id, b.whose, b.flaks.length]);
    });
    gameLib.tanks.forEach(b => {
        server.sockets.to(socket.id).emit('firstConnect-tanks', [b.pos.x, b.pos.y, b.id, b.whose, b.deg]);
    });
    gameLib.APCs.forEach(b => {
        server.sockets.to(socket.id).emit('firstConnect-APCs', [b.pos.x, b.pos.y, b.id, b.whose, b.deg]);
    });
    socket.on(codes.actioncodes.occupation.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (!gameLib.APCs.has(e[1])) return;
        if (!validateObjBelongToSender(gameLib.APCs.get(e[1]), client)) return;
        moveToCaptureBase(gameLib.bases.get(e[0]), gameLib.APCs.get(e[1]));
    });
    socket.on(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), e => {
        let client = clientHandler.findClient(socket.id)
        if (!gameLib.bases.has(e)) return;

        //for some weird reason,this request is being recieved twice per every creation request by client,this fixes that...temporarily.
        if (creations.find(b => b.base.id == e)) return;
        if (!validateObjBelongToSender(gameLib.bases.get(e), client)) return;
        resHandler.deductFromRes(client, 'tank')
        creations.push(new CreationCard(codes.objcodes.tank, gameLib.bases.get(e)))
    });
    socket.on(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (!gameLib.bases.has(e)) return;
        if (creations.find(b => b.base.id == e)) return;
        if (!validateObjBelongToSender(gameLib.bases.get(e), client)) return;
        resHandler.deductFromRes(client, 'APC');
        creations.push(new CreationCard(codes.objcodes.APC, gameLib.bases.get(e)))
    });
    socket.on(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (!gameLib.bases.has(e)) return;
        if (creations.find(b => b.base.id == e)) return;
        if (!validateObjBelongToSender(gameLib.bases.get(e), client)) return;
        resHandler.deductFromRes(client, 'flak')
        creations.push(new CreationCard(codes.objcodes.flak, gameLib.bases.get(e)))
    });
    socket.on(codes.actioncodes.movement.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (gameLib.tanks.has(e[0])) {
            if (!validateObjBelongToSender(gameLib.tanks.get(e[0]), client)) return;
            gameLib.tanks.get(e[0]).moveTo.unshift(...avoidAllCollision(new Vector(e[1].x, e[1].y), gameLib.tanks.get(e[0]), gameLib.bases))
        };
        if (gameLib.APCs.has(e[0])) {
            if (!validateObjBelongToSender(gameLib.APCs.get(e[0]), client)) return;
            gameLib.APCs.get(e[0]).moveTo.unshift(...avoidAllCollision(new Vector(e[1].x, e[1].y), gameLib.APCs.get(e[0]), gameLib.bases))
        };
    });
    socket.on('disconnect', () => {
        clientHandler.updateClient(clientHandler.findClient(socket.id), false)
        console.log(`Player disconnected ::: id:${socket.id}`);
        socket.broadcast.emit('sys-message', false, socket.id);
    })
    socket.on('log', () => {
        console.log(clientHandler.clients);
    })
});





export function emitToAll(event, data) {
    server.sockets.emit(event, data)
}
export function emitToRoom(event, room, data) {
    server.to(room).emit(event, data)
}
export function emitTosockets(params) {

}