import { ResHandler } from './resHandler.js'
Array.prototype.remove = function (value) {
    let w = this.indexOf(value)
    if (w == -1) return;
    return this.splice(w, 1)[0]
}
const clients = [];
function Client(uid, name, socketid) {
    this.name = name;
    this.uid = uid;
    this.online = true;
    this.lastOnline = null;
    this.lastlogin = null;
    this.resHandler = new ResHandler();
    this.socketid = socketid;
    this.rooms = [];
}
const chatRooms = [
    {
        name: 'global',
        role: 'root',
    }
];
function removeFromRoom(client, room) {
    client.rooms.remove(room);
}
function findClient(id) {
    if (typeof id == 'number') return clients.find(client => client.uid === id);
    return clients.find(client => client.socketid === id);
}
function createClient(uid, name, socketid) {
    let client = clients.find(client => client.uid === uid)
    if (client) return client
    client = new Client(uid, name, socketid);
    clients.push(client)
    return client
}
function destroyClient(id) {
    return clients.remove(findClient(id))
}
function updateClient(client, online, socketid, next) {
    if (client === void 0) return null;
    if (online) {
        client.online = online;
        client.lastlogin = Date.now();
        client.socketid = socketid;
        return client
    }
    client.online = online;
    client.lastOnline = Date.now();
    return client
}
function resolveClient(id, name, socketid) {
    let client = findClient(id);
    if (client) return updateClient(client, true, socketid);
    return createClient(id, name, socketid)
}
function resolveAndJoinRoom(room, socket, alliance = '') {
    let resolved = chatRooms.find(e => e.name == room), client = findClient(socket.id)
    if (!resolved) chatRooms.push({ name: room, role: `alliance=${alliance}` });
    if (client) {
        client.rooms.push(room);
        socket.join(room);
    }
}
function findRoom(room) {
    chatRooms.find(e => e.name === room)
}
function isAllichat(room) {
    room = findRoom(room) || undefined;
    if (!room) return false;
    if (room.role == 'alliance') return true;
    return false;
}
function debug(server, socket) {
    server.to(socket.id).emit('debug', clients)
}
function findRoomUsers(room) {
    return clients.filter(client => client.rooms.includes(room))
}
export {
    isAllichat,
    findClient,
    destroyClient,
    resolveClient,
    updateClient,
    resolveAndJoinRoom,
    removeFromRoom,
    debug,
    findRoomUsers,
    chatRooms,
    clients
}
setInterval(() => {
    chatRooms.forEach(room => {
        if (!findRoomUsers(room.name).length && room.role !== 'root') chatRooms.remove(room)
    })
}, 1000 * 60 * 60)