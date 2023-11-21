import { DBpool, codes } from "../constants.js";
import { Server } from 'socket.io'
import { Vector, avoidAllCollision, CaptureCard, captures, gameLib, creations, addBase, hasBase, VehicleType } from '../game/index.js'
import * as clientHandler from "../node_utils/chatconfig.js";
import cookie from 'cookie'

export const io = new Server();

io.use((socket, next) => {
    if (typeof socket.handshake.headers.cookie !== "string") return next(new Error('unathorized'));
    if (!cookie.parse(socket.handshake.headers.cookie).sessId) return next(new Error('unathorized'));
    if (typeof socket.handshake.headers.cookie === "string") {
        let sid = cookie.parse(socket.handshake.headers.cookie), sd;
        if (typeof sid.sessId === "undefined") {
            return next(new Error('unathorized'))
        } else {
            DBpool.query('SELECT * FROM sessions WHERE sessId=?', [sid.sessId], (err, results) => {
                if (!err) {
                    if (!results.length) return next(new Error('unathorized'));
                    if (Date.now() < results[0].expires) console.log('session expired');
                    sd = JSON.parse(results[0].data);
                    clientHandler.resolveClient(sd.uid, sd.username, socket.id);
                    if (!hasBase(sd.username)) {
                        addBase({ name: sd.username, alliance: sd.alliance || '', id: sd.uid })
                    };
                    next();
                }
                if (err) console.log(err.message);
            })
        }
    }
});
io.on('connection', socket => {
    clientHandler.resolveAndJoinRoom('global', socket);
    socket.on('pl-message', (data, room) => {
        room = room || 'global';
        let client = clientHandler.findClient(socket.id);
        clientHandler.resolveAndJoinRoom(room, socket);
        //add room selection later
        io.emit('message', client.name, data)
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
        io.sockets.to(socket.id).emit('firstConnect-bases', [b.pos.x, b.pos.y, b.id, b.whose, b.flaks.length]);
    });
    gameLib.tanks.forEach(b => {
        io.sockets.to(socket.id).emit('firstConnect-tanks', [b.pos.x, b.pos.y, b.id, b.whose, b.deg]);
    });
    gameLib.APCs.forEach(b => {
        io.sockets.to(socket.id).emit('firstConnect-APCs', [b.pos.x, b.pos.y, b.id, b.whose, b.deg]);
    });

    socket.on(codes.actioncodes.occupation.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (!gameLib.has(e[1], VehicleType.APC)) return;
        if (!validateObjBelongToSender(gameLib.get(e[1], VehicleType.APC), client)) return;
        moveToCaptureBase(gameLib.get(e[0], VehicleType.BASE), gameLib.get(e[1], VehicleType.APC));
    });
    socket.on(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), e => {
        let client = clientHandler.findClient(socket.id)
        if (!gameLib.has(e, VehicleType.BASE)) return;

        //for some weird reason,this request is being recieved twice per every creation request by client,this fixes that...temporarily.
        if (creations.find(b => b.base.id == e)) return;
        if (!validateObjBelongToSender(gameLib.get(e, VehicleType.BASE), client)) return;
        resHandler.deductFromRes(client, 'tank')
        creations.push(new CreationCard(codes.objcodes.tank, gameLib.get(e, VehicleType.BASE)))
    });
    socket.on(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (!gameLib.has(e, VehicleType.BASE)) return;
        if (creations.find(b => b.base.id == e)) return;
        if (!validateObjBelongToSender(gameLib.get(e, VehicleType.BASE), client)) return;
        resHandler.deductFromRes(client, 'APC');
        creations.push(new CreationCard(codes.objcodes.APC, gameLib.get(e, VehicleType.BASE)))
    });
    socket.on(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (!gameLib.has(e, VehicleType.BASE)) return;
        if (creations.find(b => b.base.id == e)) return;
        if (!validateObjBelongToSender(gameLib.get(e, VehicleType.BASE), client)) return;
        resHandler.deductFromRes(client, 'flak')
        creations.push(new CreationCard(codes.objcodes.flak, gameLib.get(e, VehicleType.BASE)))
    });
    socket.on(codes.actioncodes.movement.toString(), e => {
        let client = clientHandler.findClient(socket.id);
        if (gameLib.has(e[0], VehicleType.TANK)) {
            if (!validateObjBelongToSender(gameLib.get(e[0], VehicleType.TANK), client)) return;
            gameLib.get(e[0], VehicleType.TANK).moveTo.unshift(...avoidAllCollision(new Vector(e[1].x, e[1].y), gameLib.get(e[0], VehicleType.TANK), gameLib.bases))
        };
        if (gameLib.has(e[0], VehicleType.APC)) {
            if (!validateObjBelongToSender(gameLib.get(e[0], VehicleType.APC), client)) return;
            gameLib.get(e[0], VehicleType.APC).moveTo.unshift(...avoidAllCollision(new Vector(e[1].x, e[1].y), gameLib.get(e[0], VehicleType.APC), gameLib.bases))
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
export function emitGameError(error, id) {
    io.sockets.to(id).emit('game-error', error)
}
function validateObjBelongToSender(obj, client) {
    if (client) {
        if (client.uid === obj.whose.id) {
            return true
        }
    }
    return false
}
function moveToCaptureBase(base, obj) {
    if (objsAreAlly(obj, base)) {
        clientHandler.clients.forEach(c => {
            if (c.name == obj.whose.name) {
                emitGameError('You cannot capture an allied base', c.socketid)
            }
        });
        return
    }
    if (base.flaks.length > 0) {
        clientHandler.clients.forEach(c => {
            if (c.name == obj.whose.name) {
                server.to(c.socketid).emit('game-error', 'Destroy the flaks on the base first');
            }
        });
        return
    }
    obj.moveTo.push(...avoidAllCollision(new Vector(base.actualSpawnPoint.x, base.actualSpawnPoint.y + 150), obj, gameLib.bases))
    obj.moveTo.push(base.actualSpawnPoint.copy());
    captures.push(new CaptureCard(base, obj));
}
gameLib.addListener('add', ev => {
    let t = ev.entity
    switch (ev.type) {
        case VehicleType.TANK:
            io.sockets.emit(
                codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(),
                [t.pos.x, t.pos.y, t.id, t.whose, t.deg]
            );
            break;
        case VehicleType.APC:
            io.sockets.emit(
                codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(),
                [t.pos.x, t.pos.y, t.id, t.whose, t.deg]
            );
            break;
        case VehicleType.BASE:
            io.sockets.emit(
                codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(),
                [t.pos.x, t.pos.y, t.id, t.whose, t.deg]
            );
    }
})
/*gameLib.addListener("remove", ev => {
    let t = ev.entity
    switch (ev.type) {
        case VehicleType.TANK:
            io.sockets.emit(
                codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(),
                [t.pos.x, t.pos.y, t.id, t.whose, t.deg]
            );
            break;
        case VehicleType.APC:
            io.sockets.emit(
                codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(),
                [t.pos.x, t.pos.y, t.id, t.whose, t.deg]
            );
            break;
        case VehicleType.BASE:
            io.sockets.emit(
                codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(),
                [t.pos.x, t.pos.y, t.id, t.whose, t.deg]
            );
})*/